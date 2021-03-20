import express from 'express';
import {
  getAllUsers, getAllUsersWithInfo, getUserWithInfo, getUser, makeUser, patchUser,
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
  const { username, password, email } = req.body;

  const data = await makeUser(username, email, password);
  return res.json(data);
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { username, password, email } = req.body;

  const data = await patchUser(id, username, email, password);
  return res.json(data);
}

async function getMe(req, res) {
  const { username, email } = req.session.passport.user;
  return res.json({ username, email });
}

router.get('/info', catchErrors(showUsersWithInfo));
router.get('/info/:id', catchErrors(showUserWithInfo));
// router.patch('/me', ensureLoggedIn, catchErrors(updateUser));
// router.get('/me', ensureLoggedIn, catchErrors(getMe));
// router.post('/register', catchErrors(createUser));
router.get('/:id', catchErrors(userById));
router.get('/', catchErrors(showUsers));
