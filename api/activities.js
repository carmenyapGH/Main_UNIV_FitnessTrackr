// api/activities.js

const express = require("express");
const activitiesRouter = express.Router();
const { requireUser } = require("./utils");
const {
  getAllActivities,
  createActivity,
  getActivityById,
  updateActivity,
  getAllPublicRoutines,
  getPublicRoutinesByActivity,
} = require("../db");

activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.post("/", async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const activities = await createActivity({ name, description });
    if (!activities) {
      next({ error: "Could not make post." });
    }
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.patch("/:activityId", requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;
  let authToken = req.headers.authorization.split(" ")[1];
  try {
    const originalPost = await getActivityById(activityId);
    const updatedPost = await updateActivity({
      id: activityId,
      name,
      description,
    });
    res.send(updatedPost);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;

  try {
    const activities = await getAllPublicRoutines();
    const routines = await getPublicRoutinesByActivity(activityId);
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = activitiesRouter;
