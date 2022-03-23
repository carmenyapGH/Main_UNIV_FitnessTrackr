const express = require("express");
const routine_activitiesRouter = express.Router();
const { requireUser } = require("./utils");
const {
  updateRoutineActivity,
  getPublicRoutinesByActivity,
  getRoutineActivityById,
  getRoutineById,
  destroyRoutineActivity,
} = require("../db");

routine_activitiesRouter.patch(
  "/:routineActivityId",
  requireUser,
  async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { routineId, activityId, duration, count } = req.body;
    // console.log("PATCH req.body==============>", req.body);
    // console.log("req.params==============>", routineActivityId, req.params);
    // console.log("req.name==============>", req.body.name);
    // console.log("req.description==============>", req.body.description);

    let authToken = req.headers.authorization.split(" ")[1];

    // console.log("req head==============>", authToken);
    const updateFields = {};

    if (routineId) {
      updateFields.routineId = routineId;
    }
    if (duration) {
      updateFields.duration = duration;
    }

    if (count) {
      updateFields.count = count;
    }
    // console.log("PATCH updateFields==============>", updateFields);
    try {
      const originalPost = await getRoutineActivityById(routineActivityId);
      // console.log("originalPost==============>", originalPost);

      // const updatedPost = await updateRoutineActivity({
      //   id: routineActivityId,
      //   count,
      //   duration,
      // });
      // res.send(updatedPost);

      const userInfo = await getRoutineById(originalPost.routineId);
      // console.log("userInfo==============>", userInfo);
      // console.log("req.user.id==============>", req.user.id);
      if (originalPost && userInfo.creatorId === req.user.id) {
        const updatedPost = await updateRoutineActivity({
          id: routineActivityId,
          count,
          duration,
        });
        // console.log("updatedPos==============>", { updatedPost });

        res.send(updatedPost);
      } else {
        next({
          name: "UnauthorizedUserError",
          message: "You cannot update a post that is not yours",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

routine_activitiesRouter.delete(
  "/:routineActivityId",
  requireUser,
  async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { id, routineId, activityId } = req.body;
    // console.log("DELETE req.body==============>", req.body);
    // console.log("DELETE req.user.id==============>", req.user.id);

    try {
      const post = await getRoutineActivityById(routineActivityId);
      // console.log("DELETE post==============>", post);

      const userInfo = await getRoutineById(post.routineId);
      // console.log("userInfo==============>", userInfo);
      // console.log("req.user.id==============>", req.user.id);
      // console.log("DELETE postroutineId==============>", post.routineId);
      // console.log("userInfo==============>", userInfo.creatorId);
      // console.log("routineActivityId==============>", routineActivityId);

      if (post && userInfo.creatorId === req.user.id) {
        await destroyRoutineActivity(routineActivityId);
        res.send(post);
      } else {
        next({
          name: "PostNotFoundError",
          message: "That routine id does not exist",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

module.exports = routine_activitiesRouter;
