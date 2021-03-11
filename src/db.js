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
  // console.log(results);
  return results.rows;
}

export async function getAllShifts() {
  const results = await query('select * from shifts');
  // console.log(results);
  return results.rows;
}

export async function getUser(id) {
  const results = await query('select * from users where id = $1', [id]);

  // checking if user exists
  if (results.rows) {
    return results.rows[0];
  }
  return null;
}

export async function makeUser(username, email, password) {
  const cryptedPass = await bcrypt.hash(password, 11);

  const result = await query('insert into users (username, email, password) values ($1, $2, $3)', [xss(username), xss(email), cryptedPass]);
  if (result) {
    return { username, email };
  }
  return null;
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