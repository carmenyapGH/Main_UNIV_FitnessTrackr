const client = require("./client");
const bcrypt = require("bcrypt");

async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
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
      [username, hashedPassword]
    );

    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const response = await client.query(
      `
     SELECT * FROM users
     WHERE username = $1; 
        `,
      [username]
    );
    const user = response.rows[0];
    if (await bcrypt.compare(password, user.password)) {
      delete user.password;
      return user;
    }
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
