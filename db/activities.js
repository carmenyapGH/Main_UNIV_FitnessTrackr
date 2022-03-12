const client = require("./client");

async function createActivity({ name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      INSERT INTO activities (name, description) 
      VALUES($1, $2)
      RETURNING *;
    `,
      [name, description]
    );

    // console.log("activity ===>", activity);
    return activity;
  } catch (error) {
    throw error;
  }
}

async function getAllActivities() {
  try {
    const { rows } = await client.query(`
      SELECT * 
      FROM activities;
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      SELECT * 
      FROM activities 
      WHERE id = $1;
    `,
      [id]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

async function updateActivity(activityToUpdate) {
  // console.log("activityToUpdate parameters =====>", activityToUpdate);
  const { id } = activityToUpdate;
  delete activityToUpdate.id;
  // console.log("Delete activityToUpdate=====>", activityToUpdate);

  const setString = Object.keys(activityToUpdate)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  // console.log(" setString======>", setString);

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      UPDATE activities
      SET ${setString}
      WHERE id=${id}
      RETURNING name,description;
    `,
      Object.values(activityToUpdate)
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createActivity,
  getAllActivities,
  getActivityById,
  updateActivity,
};
