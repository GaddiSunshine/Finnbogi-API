import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import util from 'util';

const readFileAsync = util.promisify(fs.readFile);

dotenv.config();

const {
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

export async function query(q) {
  const pool = new pg.Pool({ connectionString });
  const client = await pool.connect();

  try {
    const result = await client.query(q);
    return result;
  } catch (e) {
    return null;
  } finally {
    client.release();
  }
}

async function main() {
  await query('drop table if exists shifts');

  try {
    const createTable = await readFileAsync('sql/schema.sql');
    await query(createTable.toString('utf8'));
  } catch (e) {
    console.error('Villa við að setja upp töflu', e.message);
    return;
  }

  try {
    const insert = await readFileAsync('sql/fake.sql');
    await query(insert.toString('utf8'));
  } catch (e) {
    console.error('villa við að fylla í töflu', e.message);
  }
}

main().catch((error) => {
  console.error(error);
});
