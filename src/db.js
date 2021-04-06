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
    console.info(e);
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
  const results = await query('select * from users inner join userinfos on (users.userInfoId = userinfos.id) where userinfos.id = $1', [id]);
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

export async function removeUserById(id) {
  const userinfoid = await query('select userinfoid from users where id = $1', [id]);
  await query('delete from userinfos where id = $1', [userinfoid.rows[0].userinfoid]);
  const results = await query('delete from users where id = $1', [id]);

  if (results) {
    return results.rows[0];
  }
  return null;
}

export async function makeUser(username, password, role, ssn, admin = false) {
  const id = await query('insert into userinfos (ssn) values ($1) returning id;', [ssn]);
  let results;
  if (id) {
    const cryptedPass = await bcrypt.hash(password, 11);
    const newId = await query('insert into users (username, password, role, userInfoId, admin) values ($1, $2, $3, $4, $5) returning id;', [username, cryptedPass, role, id.rows[0].id, admin]);
    results = await query('select * from users where id = $1', [newId.rows[0].id]);
  }
  if (results) {
    return results.rows[0];
  }
  return {};
}

export async function patchUserInfo(id, firstname = '', surname = '', address = '', email = '', phonenumber = '') {
  const fields = [];
  const values = [];

  if (firstname) {
    fields.push('firstname');
    values.push(xss(firstname));
  }
  if (surname) {
    fields.push('surname');
    values.push(surname);
  }
  if (address) {
    fields.push('address');
    values.push(xss(address));
  }
  if (email) {
    fields.push('email');
    values.push(xss(email));
  }
  if (phonenumber) {
    fields.push('phonenumber');
    values.push(xss(phonenumber));
  }

  const queries = fields.map((f, i) => (
    `${f} = '${values[i]}'`
  ));

  const q = `update userinfos set ${queries.join(', ')} where id = $1`;

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

export async function getAllShiftsForExchange() {
  const results = await query('select * from shiftexchanges;');

  let arr;

  if (results) {
    arr = await Promise.all(results.rows.map(async (r) => {
      const shift = await query('select * from shifts where id = $1;', [r.shiftforexchangeid]);
      return shift.rows[0];
    }));
  }

  return arr;
}

export async function getAllCoworkerShifts() {
  const results = await query('select * from shiftexchanges;');

  let arr;

  if (results) {
    arr = await Promise.all(results.rows.map(async (r) => {
      const shift = await query('select * from shifts where id = $1;', [r.coworkershiftid]);
      if (shift.rows) {
        return shift.rows[0];
      }
      return null;
    }));
  }

  return arr;
}

export async function getAllShiftExchanges() {
  const results = await query('select * from shiftexchanges;');

  if (results) {
    // const arr = await Promise.all(results.rows.map(async (r) => {
    //   const shiftone = await query('select * from shifts where id = $1;', [r.shiftforexchangeid]);
    //   const shifttwo = await query('select * from shifts where id = $1;', [r.coworkershiftid]);
    //   return [r, shiftone.rows[0], shifttwo.rows[0]];
    // }));
    // return arr;
    return results.rows;
  }
  return {};
}

export async function getShiftExchangeById(id) {
  const results = await query('select * from shiftexchanges where id = $1;', [id]);

  if (results) {
    return results.rows[0];
  }
  return {};
}

export async function getShiftExchangeWithInfo(id) {
  const results = await query('select * from shiftexchanges where id = $1;', [id]);
  if (results) {
    const arr = results.rows;
    const shiftone = await query('select * from shifts where id = $1;', [results.rows[0].shiftforexchangeid]);
    arr.push(shiftone.rows[0]);
    const shifttwo = await query('select * from shifts where id = $1;', [results.rows[0].coworkershiftid]);
    arr.push(shifttwo.rows[0]);
    return arr;
  }
  return {};
}

export async function getShiftExchangeByStatus(status) {
  const results = await query('select * from shiftexchanges where status = $1;', [status]);

  if (results) {
    return results.rows;
  } else {
    return {};
  }
}

export async function getShiftExchangeWithInfoByStatus(status) {
  const results = await query('select * from shiftexchanges where status = $1;', [status]);

  if (results) {
    const arr = await Promise.all(results.rows.map(async (r) => {
      const shiftone = await query('select * from shifts where id = $1;', [r.shiftforexchangeid]);
      const shifttwo = await query('select * from shifts where id = $1;', [r.coworkershiftid]);
      return [r, shiftone.rows[0], shifttwo.rows[0]];
    }));
    return arr;
  }
  return {};
}

export async function postShiftExchange(employeeid, shiftid) {
  const id = await query('insert into shiftexchanges (employeeid, shiftforexchangeid, status) values ($1, $2, $3) returning id;', [employeeid, shiftid, 'upforgrabs']);

  if (id) {
    return id.rows;
  }
  return {};
}

export async function pendingShiftExchange(shiftexchangeid, coworkershiftid) {
  const results = await query('update shiftexchanges set coworkershiftid = $1, status = $2 where id = $3;', [coworkershiftid, 'pending', shiftexchangeid]);

  if (results) {
    return results.rows[0];
  }
  return {};
}

export async function declineShiftExchange(shiftexchangeid) {
  const results = await query('update shiftexchanges set coworkershiftid = $1, status = $2 where id = $3;', [null, 'upforgrabs', shiftexchangeid]);

  if (results) {
    return results.rows;
  }
  return {};
}

export async function approvePendingShiftExchange(shiftexchangeid) {
  const results = await query('update shiftexchanges set status = $1 where id = $2;', ['confirmable', shiftexchangeid]);

  if (results) {
    return results.rows;
  }
  return {};
}

export async function removeShiftExchange(id) {
  const results = await query('delete from shiftexchanges where id = $1', [id]);

  if (results) {
    return results.rows[0];
  }
  return null;
}

export async function approveShiftExchange(id) {
  const shiftexchange = await query('select * from shiftexchanges where id = $1', [id]);
  const { employeeid, shiftforexchangeid, coworkershiftid } = shiftexchange.rows[0];
  const coworkershift = await query('select * from shifts where id = $1', [coworkershiftid]);

  await query('update shifts set userid = $1 where id = $2;', [coworkershift.rows[0].userid, shiftforexchangeid]);
  await query('update shifts set userid = $1 where id = $2;', [employeeid, coworkershiftid]);
  const results = await query('delete from shiftexchanges where id = $1', [id]);

  if (results) {
    return results.rows[0];
  }
  return {};
}
