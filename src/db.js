/* eslint-disable no-return-await */
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import xss from 'xss';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

export async function query(q, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    return null;
  } finally {
    client.release();
  }
}

export async function getAllUsers() {
  const results = await query('select * from users');
  return results.rows;
}

export async function getAllUsersWithInfo() {
  const results = await query('select * from users inner join userinfos on (users.userInfoId = userinfos.id);');

  if (!results) {
    return {};
  }
  return results.rows;
}

export async function getUserWithInfo(id) {
  const results = await query('select * from users inner join userinfos on (users.userInfoId = userinfos.id) where users.id = $1', [id]);
  console.info(results.rows);

  if (!results) {
    return {};
  }
  return results.rows;
}

export async function getAllShifts() {
  const results = await query('select * from shifts');
  // console.log(results);
  return results.rows;
}

export async function getShiftById(id) {
  const result = await query('select * from shifts where id = $1;', [id]);

  if (!result) {
    return {};
  }
  return result.rows[0];
}

export async function makeShift(role, startTime, endTime) {
  const id = await query('insert into shifts (role, startTime, endTime) values ($1, $2, $3) RETURNING id', [role, startTime, endTime]);
  const result = await query('select * from shifts where id = $1', [id.rows[0].id]);

  if (result) {
    return result.rows[0];
  }
  return null;
}

export async function getShiftByUserId(id) {
  const result = await query('select * from shifts where userid = $1', [id]);

  if (result) {
    return result.rows;
  }
  return null;
}

export async function deleteShift(id) {
  const result = await query('delete from shifts where id = $1', [id]);

  if (result) {
    return result.rows[0];
  }
  return null;
}

export async function assignUserOnShift(userId, shiftId) {
  const result = await query('update shifts set userid = $1 where id = $2', [userId, shiftId]);

  if (!result) {
    return {};
  }
  return result.rows[0];
}

export async function getUser(id) {
  const results = await query('select * from users where id = $1', [id]);

  // checking if user exists
  if (results) {
    return results.rows[0];
  }
  return {};
}

export async function makeUser(username, email, password) {
  const cryptedPass = await bcrypt.hash(password, 11);

  const result = await query('insert into users (username, email, password) values ($1, $2, $3)', [xss(username), xss(email), cryptedPass]);
  if (result) {
    return { username, email };
  }
  return {};
}

export async function patchUser(id, username = '', email = '', password = '') {
  const fields = [];
  const values = [];

  if (username) {
    fields.push('username');
    values.push(xss(username));
  }
  if (password) {
    fields.push('password');
    const cryptedPass = await bcrypt.hash(password, 11);
    values.push(cryptedPass);
  }
  if (email) {
    fields.push('email');
    values.push(xss(email));
  }

  const queries = fields.map((f, i) => (
    `${f} = '${values[i]}'`
  ));

  const q = `update users set ${queries.join(', ')} where id = $1`;

  const result = await query(q, [id]);
  return result;
}

export async function getAllNotifications() {
  const results = await query('select * from notifications;');

  return results.rows;
}

export async function getNotificationById(id) {
  const results = await query('select * from notifications where id = $1;', [id]);

  if (results) {
    return results.rows[0];
  }
  return {};
}

export async function getAllNotificationsForUser(userId) {
  const results = await query('select * from notifications inner join notificationusers on (notifications.id = notificationusers.notificationid) where notificationusers.userid = $1', [userId]);

  if (results) {
    return results.rows;
  }
  return {};
}

export async function readTheNotification(userId, notificationId) {
  const results = await query('update notificationusers set read = true where (userId = $1 and notificationId = $2);', [userId, notificationId]);

  if (results) {
    return results.rows;
  }
  return {};
}

export async function postNotification(title, text, userIds) {
  const id = await query('insert into notifications (title, text) values ($1, $2) returning id;', [title, text]);
  userIds.forEach(async (userId) => await query('insert into notificationusers (userid, notificationid) values ($1, $2);', [userId, id.rows[0].id]));

  if (id) {
    return id.rows;
  }
  return {};
}
