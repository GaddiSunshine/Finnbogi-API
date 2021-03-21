import express from 'express';
import {
  getAllShifts, makeShift, assignUserOnShift, getShiftById, deleteShift, getShiftByUserId,
} from './db.js';

export const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function showShifts(req, res) {
  const data = await getAllShifts();
  return res.json(data);
}

async function getShift(req, res) {
  const { shiftId } = req.params;
  const data = await getShiftById(shiftId);
  return res.json(data);
}

async function getShiftsForUser(req, res) {
  const { userId } = req.params;
  const data = await getShiftByUserId(userId);
  return res.json(data);
}

async function createShift(req, res) {
  const { role, startTime, endTime } = req.body;

  console.info("gonna add shift: ", role, startTime, endTime);

  const data = await makeShift(role, startTime, endTime);
  return res.json(data);
}

async function putUserOnShift(req, res) {
  const { shiftId, userId } = req.params;

  const data = await assignUserOnShift(userId, shiftId);
  return res.json(data);
}

async function removeShift(req, res) {
  const { shiftId } = req.params;

  const data = await deleteShift(shiftId);
  return res.json(data);
}

router.patch('/:shiftId/set/:userId', catchErrors(putUserOnShift));
router.delete('/:shiftId', catchErrors(removeShift));
router.get('/:shiftId', catchErrors(getShift));
router.post('/', catchErrors(createShift));
router.get('/user/:userId', catchErrors(getShiftsForUser));
router.get('/', catchErrors(showShifts));
