const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `,
      [creatorId, isPublic, name, goal]
    );

    // console.log("Create routine ===>", routine);
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM routines
      WHERE id = $1; 
    `,
      [id]
    );
    // console.log("getRoutineById1 ===>", rows);
    // console.log("getRoutineById2 ===>", rows[0]);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routines;
      
    `);
    // console.log("routine ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows } = await client.query(`
      SELECT * , users.username AS "creatorName", routines.id
      FROM routines 
      INNER JOIN users
      ON users.id = routines."creatorId"
      ;
    `);
    for (let item of rows) {
      const activities = await client.query(`
        SELECT * FROM 
        routineactivities where "activityId"= ${item.id} 
        `);
      item.activities = activities.rows;
      // console.log("activities===>", item.activities);
    }
    delete rows[0].password;
    // console.log("routine ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows } = await client.query(`
      SELECT * , users.username AS "creatorName", routines.id
      FROM routines 
      INNER JOIN users
      ON users.id = routines."creatorId"
       WHERE "isPublic" = true
      ;
    `);
    for (let item of rows) {
      const activities = await client.query(`
        SELECT * FROM
        routineactivities where "activityId"= ${item.id}

        `);
      item.activities = activities.rows;
      // console.log("activities===>", item.activities);
    }
    delete rows[0].password;
    // console.log("getAllPublicRoutine ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(
      `
      SELECT * , users.username AS "creatorName", routines.id
      FROM routines 
      INNER JOIN users
      ON users.id = routines."creatorId"
       WHERE users.username = $1
      ;
    `,
      [username]
    );
    for (let item of rows) {
      const activities = await client.query(`
        SELECT * FROM
        routineactivities where "activityId"= ${item.id}

        `);
      item.activities = activities.rows;
      // console.log("activities===>", item.activities);
    }

    // console.log("getAllRoutinesByUser ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(
      `
      SELECT * , users.username AS "creatorName", routines.id
      FROM routines 
      INNER JOIN users
      ON users.id = routines."creatorId"
       WHERE users.username = $1 and "isPublic" = true
      ;
    `,
      [username]
    );
    for (let item of rows) {
      const activities = await client.query(`
        SELECT * FROM
        routineactivities where "activityId"= ${item.id}

        `);
      item.activities = activities.rows;
      // console.log("activities===>", item.activities);
    }

    // console.log("getAllRoutinesByUser ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows } = await client.query(
      `
      SELECT * , users.username AS "creatorName", routines.id
      FROM routines 
      INNER JOIN users
      ON users.id = routines."creatorId"
       WHERE "isPublic" = true
      ;
    `
    );
    for (let item of rows) {
      const activities = await client.query(`
        SELECT * FROM
        routineactivities where "activityId"= ${item.id}

        `);
      item.activities = activities.rows;
      // console.log("activities===>", item.activities);
    }

    // console.log("getPublicRoutinesByActivity ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, isPublic, name, goal }) {
  let routineToUpdate = {};
  if (isPublic !== undefined) {
    routineToUpdate.isPublic = isPublic;
  }
  if (name) {
    routineToUpdate.name = name;
  }
  if (goal) {
    routineToUpdate.goal = goal;
  }

  // console.log("routineToUpdate =====>", routineToUpdate);

  const setString = Object.keys(routineToUpdate)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  // console.log(" setString======>", setString);

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [routine],
    } = await client.query(
      `
      UPDATE routines
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(routineToUpdate)
    );

    return routine;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(
      `
      DELETE FROM routines
      WHERE id = $1;
    `,
      [id]
    );

    const { rows } = await client.query(
      `
      DELETE FROM routineactivities
      WHERE id = $1; 
    `,
      [id]
    );
    // console.log("destroyRoutine ===>", rows[0]);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createRoutine,
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  updateRoutine,
  destroyRoutine,
  updateRoutine,
};
