const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [addActroutine],
    } = await client.query(
      `
      INSERT INTO routineActivities ("routineId", "activityId",duration,count) 
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `,
      [routineId, activityId, duration, count]
    );

    // console.log("addActroutine ===>", addActroutine);
    return addActroutine;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows } = await client.query(
      `
      DELETE FROM routineactivities
      WHERE "routineId" = $1; 
    `,
      [id]
    );

    // console.log("destroyRoutineActivity ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addActivityToRoutine,
  destroyRoutineActivity,
};
