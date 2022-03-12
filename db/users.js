const client = require("./client");

async function createUser({ username, password }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users(username, password) 
      VALUES($1, $2) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `,
      [username, password]
    );

    // console.log("user ===>", user);
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const { rows } = await client.query(
      `
      SELECT id
      FROM users
      WHERE username = $1 AND password = $2
      LIMIT 1;
    `,
      [username, password]
    );

    // console.log("users rows ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(id) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE id = $1; 
    `,
      [id]
    );

    delete user.password;

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername({ username }) {
  try {
    const { rows } = await client.query(
      `
      SELECT username
      FROM users
      WHERE username = $1; 
    `,
      [username]
    );

    // console.log("users by username rows ===>", rows);
    return rows;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
