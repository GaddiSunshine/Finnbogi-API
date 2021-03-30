import express from 'express';
import {
  getAllNotifications, getNotificationById, getAllNotificationsForUser, readTheNotification, postNotification
} from './db.js';

export const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function showNotifications(req, res) {
  const data = await getAllNotifications();
  return res.json(data);
}

async function showNotificationById(req, res) {
  const { notificationId } = req.params;

  const data = await getNotificationById(notificationId);
  return res.json(data);
}

async function getNotificationsForUser(req, res) {
  const { userId } = req.params;

  const data = await getAllNotificationsForUser(userId);
  return res.json(data);
}

async function readNotification(req, res) {
  const { userId, notificationId } = req.params;

  const data = await readTheNotification(userId, notificationId);
  return res.json(data);
}

async function sendNotifications(req, res) {
  const { title, text, userIds } = req.body;

  const data = await postNotification(title, text, userIds);
  return res.json(data);
}

router.get('/user/:userId', catchErrors(getNotificationsForUser));
router.patch('/:userId/read/:notificationId', catchErrors(readNotification));
router.get('/:notificationId', catchErrors(showNotificationById));
router.post('/', catchErrors(sendNotifications));
router.get('/', catchErrors(showNotifications));
