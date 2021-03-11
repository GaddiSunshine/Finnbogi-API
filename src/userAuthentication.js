import bcrypt from 'bcrypt';
import { query } from './db.js';

// gæti þurft að breyta þessum föllum mögulega?

export async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);

  return result;
}

export async function findByUsername(username) {
  const q = 'select * from users where username = $1';

  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Fannst ekki notandi undir notandanafninu');
    return null;
  }

  return false;
}

export async function findById(id) {
  const q = 'select * from users where id = $1';

  try {
    const result = await query(q, [id]);
    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Fannst ekki notandi undir þessu id');
  }

  return null;
}
