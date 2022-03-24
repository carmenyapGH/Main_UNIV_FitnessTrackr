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
    let authToken = req.headers.authorization.split(" ")[1];
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

    try {
      const originalPost = await getRoutineActivityById(routineActivityId);

      const userInfo = await getRoutineById(originalPost.routineId);

      if (originalPost && userInfo.creatorId === req.user.id) {
        const updatedPost = await updateRoutineActivity({
          id: routineActivityId,
          count,
          duration,
        });

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

    try {
      const post = await getRoutineActivityById(routineActivityId);

      const userInfo = await getRoutineById(post.routineId);

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
