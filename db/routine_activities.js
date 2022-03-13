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
      SELECT * FROM routineactivities
      WHERE id = $1;
    `,
      [id]
    );

    await client.query(
      `
      DELETE FROM routineactivities
      WHERE id = $1; 
    `,
      [id]
    );
    console.log("destroyRoutineActivity ===>", rows);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

async function getRoutineActivitiesByRoutine(fields = {}) {
  const { id } = fields;
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM routineactivities
      WHERE id = $1; 
    `,
      [id]
    );

    // console.log("getRoutineActivitiesByRoutine1 ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, count, duration }) {
  let routineActToUpdate = {};

  if (count) {
    routineActToUpdate.count = count;
  }
  if (duration) {
    routineActToUpdate.duration = duration;
  }

  const setString = Object.keys(routineActToUpdate)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [routine],
    } = await client.query(
      `
      UPDATE routineactivities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(routineActToUpdate)
    );

    return routine;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addActivityToRoutine,
  destroyRoutineActivity,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
};
