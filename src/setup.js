/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
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
    const result = await query('insert into userInfos (firstname, surname, address, email, phonenumber, startDate, ssn) values ($1, $2, $3, $4, $5, $6, $7);', [firstName, surName, address, email, phoneNumber, startDate, ssn]);
  }

  for (let i = 1; i < n; i += 1) {
    const name = faker.name.findName();
    // eslint-disable-next-line no-await-in-loop
    const password = await bcrypt.hash('123', 11);
    const role = getRandomRole();

    // eslint-disable-next-line no-await-in-loop
    const result = await query('insert into users (userName, role, password, userInfoId) values ($1, $2, $3, $4);', [name, role, password, i]);
    // console.info(result);
  }
  const adminPass = await bcrypt.hash('123', 11);
  await query('insert into users (userName, role, password, admin, userInfoId) values ($1, $2, $3, $4, $5);', ['admin', 'admin', adminPass, true, n]);
}

async function makeShifts(n, u) {
  for (let i = 0; i < n; i += 1) {
    const date = faker.date.between('2021-03-31', '2021-05-10');
    const userId = Math.floor(Math.random() * u) + 1;
    // eslint-disable-next-line no-await-in-loop
    const data = await query('select role from users where id = $1', [userId]);
    let role;
    if (data) {
      role = data.rows[0]?.role || 'Waiter';
    }
    // eslint-disable-next-line no-await-in-loop
    await query('insert into shifts (role, startTime, endTime, userId) values ($1, $2, $3, $4);', [role, date, date, userId]);
  }
}

async function makeNotifications(n, u) {
  for (let i = 1; i < u; i += 1) {
    for (let j = 0; j < n; j += 1) {
      const title = faker.lorem.sentence();
      const text = faker.lorem.words(50);

      const id = await query('insert into notifications (title, text) values ($1, $2) returning id;', [title, text]);

      const data = await query('insert into notificationusers (userid, notificationid) values ($1, $2);', [i, id.rows[0].id]);
    }
  }
}

async function makeShiftExchanges(users, shifts, upforgrabs, pending, confirmable) {
  const upforgrabshifts = [];
  for (let i = 0; i < upforgrabs; i += 1) {
    let shift;
    let employee;
    while (!shift || upforgrabshifts.includes(shift)) {
      const user = Math.floor(Math.random() * users) + 1;
      const results = await query('select * from shifts where userid = $1', [user]);
      shift = results.rows[Math.floor(Math.random() * results.rows.length)]?.id;
      if (shift) {
        employee = user;
      }
    }
    upforgrabshifts.push(shift);
    await query('insert into shiftexchanges (employeeid, shiftforexchangeid, status) values ($1, $2, $3)', [employee, shift, 'upforgrabs']);
  }

  const pendingshifts = [];
  const pendingcoworkershifts = [];
  for (let i = 0; i < pending + confirmable; i += 1) {
    let shift;
    let coworkershift;
    let employee;
    const status = (i >= pending ? 'confirmable' : 'pending');
    while (!shift || upforgrabshifts.includes(shift) || pendingshifts.includes(shift)
    || pendingcoworkershifts.includes(coworkershift)) {
      const user = Math.floor(Math.random() * users) + 1;
      const results = await query('select * from shifts where userid = $1', [user]);
      const coworkershifts = await query('select * from shifts where userid != $1;', [user]);
      shift = results.rows[Math.floor(Math.random() * results.rows.length)]?.id;
      coworkershift = coworkershifts.rows[Math.floor(Math.random() * coworkershifts.rows.length)]?.id;
      if (shift && coworkershift) {
        employee = user;
      }
    }
    pendingshifts.push(shift);
    pendingcoworkershifts.push(coworkershift);
    await query('insert into shiftexchanges (employeeid, shiftforexchangeid, coworkershiftid, status) values ($1, $2, $3, $4)', [employee, shift, coworkershift, status]);
  }
}

async function main() {
  console.info('dropping tables');
  await query('drop table if exists userInfos cascade;');
  await query('drop table if exists shifts cascade;');
  await query('drop table if exists users cascade;');
  await query('drop table if exists notificationusers cascade;');
  await query('drop table if exists notifications cascade;');
  await query('drop table if exists shiftexchanges cascade;');
  console.info('dropped tables');

  try {
    const createTable = await readFileAsync('sql/schema.sql');
    await query(createTable.toString('utf8'));
  } catch (e) {
    console.error('Villa við að setja upp töflu', e.message);
  }

  console.info('making data');
  const users = 10;
  const shifts = 50;
  const notifications = 20;
  await makeUsers(users);
  await makeShifts(shifts, users);
  await makeNotifications(notifications, users);
  const upforgrabs = 5;
  const pending = 5;
  const confirmable = 10;
  await makeShiftExchanges(users, shifts, upforgrabs, pending, confirmable);
  console.info('made data');
}

main().catch((error) => {
  console.error(error);
});
