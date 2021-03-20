import faker from 'faker';
import bcrypt from 'bcrypt';
import fs from 'fs';
import util from 'util';
import { query } from './db.js';

const readFileAsync = util.promisify(fs.readFile);

function getRandomRole() {
  const roles = ['Chef', 'Bartender', 'Waiter', 'Busboy', 'ShiftManager', 'Employer'];
  return roles[Math.floor(Math.random() * roles.length)];
}

async function makeUsers(n) {
  for (let i = 0; i < n; i += 1) {
    const firstName = faker.name.firstName();
    const surName = faker.name.lastName();
    const address = faker.address.streetAddress();
    const email = faker.internet.email();
    const phoneNumber = faker.phone.phoneNumber();
    const startDate = faker.date.past();
    let ssn = (1000000000 + Math.floor(Math.random() * 10000000000));
    if (ssn > 9999999999) {
      ssn = Math.floor(ssn / 10);
    }
    // eslint-disable-next-line no-await-in-loop
    const result = await query('insert into userInfos (firstName, surName, address, email, phoneNumber, startDate, ssn) values ($1, $2, $3, $4, $5, $6, $7);', [firstName, surName, address, email, phoneNumber, startDate, ssn]);
    console.info(result);
  }

  for (let i = 0; i < n; i += 1) {
    const name = faker.name.findName();
    // eslint-disable-next-line no-await-in-loop
    const password = await bcrypt.hash('123', 11);
    const role = getRandomRole();

    // eslint-disable-next-line no-await-in-loop
    const result = await query('insert into users (userName, role, password, userInfoId) values ($1, $2, $3, $4);', [name, role, password, i]);
    console.info(result);
  }
  const adminPass = await bcrypt.hash('123', 11);
  await query('insert into users (userName, role, password, admin, userInfoId) values ($1, $2, $3, $4, $5);', ['admin', 'admin', adminPass, true, n]);
}

async function makeShifts(n, u) {
  for (let i = 0; i < n; i += 1) {
    const date = faker.date.soon();
    const userId = Math.floor(Math.random() * u) + 1;
    // eslint-disable-next-line no-await-in-loop
    const data = await query('select role from users where id = $1', [userId]);
    let role;
    if (data) {
      console.log(data);
      role = data.rows[0].role;
    }
    // eslint-disable-next-line no-await-in-loop
    await query('insert into shifts (role, startTime, endTime, userId) values ($1, $2, $3, $4);', [role, date, date, userId]);
  }
}

async function main() {
  console.info('dropping tables');
  await query('drop table if exists userInfos;');
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
