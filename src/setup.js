import faker from 'faker';
import bcrypt from 'bcrypt';
import fs from 'fs';
import util from 'util';
import { query } from './db.js';

const readFileAsync = util.promisify(fs.readFile);

function getRandomRole() {
  const roles = ['chef', 'bartender', 'waiter'];
  return roles[Math.floor(Math.random() * roles.length)];
}

async function makeUsers(n) {
  const adminPass = await bcrypt.hash('123', 11);
  await query('insert into users (userName, role, password, admin) values ($1, $2, $3, $4);', ['admin', 'admin', adminPass, true]);
  for (let i = 0; i < n; i += 1) {
    const name = faker.name.findName();
    // eslint-disable-next-line no-await-in-loop
    const password = await bcrypt.hash('123', 11);
    const role = getRandomRole();

    // eslint-disable-next-line no-await-in-loop
    await query('insert into users (userName, role, password) values ($1, $2, $3);', [name, role, password]);
  }
}

async function makeShifts(n, u) {
  for (let i = 0; i < n; i += 1) {
    const date = faker.date.soon();
    // eslint-disable-next-line no-await-in-loop
    await query('insert into shifts (startTime, endTime, userId) values ($1, $2, $3);', [date, date, Math.floor(Math.random() * u) + 1]);
  }
}

async function main() {
  console.info('dropping tables');
  await query('drop table if exists shifts;');
  await query('drop table if exists users;');
  console.info('dropped tables');

  try {
    const createTable = await readFileAsync('sql/schema.sql');
    await query(createTable.toString('utf8'));
  } catch (e) {
    console.error('Villa við að setja upp töflu', e.message);
  }

  console.info('making data');
  const users = 10;
  const shifts = 20;
  await makeUsers(users);
  await makeShifts(shifts, users);
  console.info('made data');
}

main().catch((error) => {
  console.error(error);
});
