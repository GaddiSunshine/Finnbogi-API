import express from 'express';
import {
  // eslint-disable-next-line max-len
  getAllUsers, getAllUsersWithInfo, getUserWithInfo, getUser, makeUser, patchUserInfo, removeUserById,
} from './db.js';

export const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

export async function notFound(req, res) {
  return res.json({
    error: 'not found',
  });
}

export async function notLoggedIn(req, res) {
  return res.json({
    error: 'not logged in',
  });
}

export async function notAdmin(req, res) {
  return res.json({
    error: 'not admin',
  });
}

export async function error(req, res, message) {
  return res.json({
    message,
  });
}

export function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  // if not logged in, redirect to index page
  return notLoggedIn(req, res);
}

export function ensureAdmin(req, res, next) {
  if (req.session.passport.user.admin) {
    return next();
  }

  // if not admin, redirect to index page
  return notAdmin(req, res);
}

async function showUsers(req, res) {
  const data = await getAllUsers();
  return res.json(data);
}

async function showUsersWithInfo(req, res) {
  const data = await getAllUsersWithInfo();
  return res.json(data);
}

async function showUserWithInfo(req, res) {
  const { id } = req.params;
  const data = await getUserWithInfo(id);
  return res.json(data);
}

async function userById(req, res) {
  const { id } = req.params;
  const data = await getUser(id);
  if (data) {
    return res.json(data);
  }
  return notFound(req, res);
}

async function createUser(req, res) {
  const {
    username, password, role, ssn, admin,
  } = req.body;
  const data = await makeUser(username, password, role, ssn, admin);
  return res.json(data);
}

async function updateUserInfo(req, res) {
  const { id } = req.params;
  const { firstname, surname, address, email, phonenumber } = req.body;

  const data = await patchUserInfo(id, firstname, surname, address, email, phonenumber);
  return res.json(data);
}

async function removeUser(req, res) {
  const { id } = req.params;

  const data = await removeUserById(id);
  return res.json(data);
}

router.post('/register', catchErrors(createUser));
router.get('/info', catchErrors(showUsersWithInfo));
router.patch('/info/:id', catchErrors(updateUserInfo));
router.get('/info/:id', catchErrors(showUserWithInfo));
router.delete('/:id', catchErrors(removeUser));
router.get('/:id', catchErrors(userById));
router.get('/', catchErrors(showUsers));
