/* eslint-disable max-len */
import express from 'express';
import {
  getAllShiftExchanges, getShiftExchangeById, postShiftExchange, getShiftExchangeByStatus, pendingShiftExchange, declineShiftExchange,
  approvePendingShiftExchange, removeShiftExchange, approveShiftExchange,
  getAllShiftsForExchange, getAllCoworkerShifts, getAllShiftsForExchangeConfirmable, getAllCoworkerShiftsConfirmable
} from './db.js';

export const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function showShiftExchanges(req, res) {
  const data = await getAllShiftExchanges();
  return res.json(data);
}

async function showShiftExchangeById(req, res) {
  const { shiftExchangeid } = req.params;

  const data = await getShiftExchangeById(shiftExchangeid);
  return res.json(data);
}

async function showShiftExchangeByStatus(req, res) {
  const data = await getShiftExchangeByStatus('confirmable');
  return res.json(data);
}

// async function showShiftExchangeWithInfoByStatus(req, res) {
//   const data = await getShiftExchangeWithInfoByStatus('confirmable');
//   return res.json(data);
// }

async function setPending(req, res) {
  const { shiftExchangeid } = req.params;
  const { coworkerShiftId } = req.body;

  const data = await pendingShiftExchange(shiftExchangeid, coworkerShiftId);
  return res.json(data);
}

async function declinePending(req, res) {
  const { shiftExchangeid } = req.params;

  const data = await declineShiftExchange(shiftExchangeid);
  return res.json(data);
}

async function approvePending(req, res) {
  const { shiftExchangeid } = req.params;

  const data = await approvePendingShiftExchange(shiftExchangeid);
  return res.json(data);
}

async function createShiftExchange(req, res) {
  const { employeeid, shiftid } = req.body;

  const data = await postShiftExchange(employeeid, shiftid);
  return res.json(data);
}

async function deleteShiftExchange(req, res) {
  const { shiftExchangeid } = req.params;

  const data = await removeShiftExchange(shiftExchangeid);
  return res.json(data);
}

async function confirmShiftExchange(req, res) {
  const { shiftExchangeid } = req.params;

  const data = await approveShiftExchange(shiftExchangeid);
  return res.json(data);
}

async function showShiftsForExchange(req, res) {
  const data = await getAllShiftsForExchange();
  return res.json(data);
}

async function showCoworkerShifts(req, res) {
  const data = await getAllCoworkerShifts();
  return res.json(data);
}

async function showConfirmableShiftByStatus(req, res) {
  const data = await getAllShiftsForExchangeConfirmable();
  return res.json(data);
}

async function showCoworkerShiftByStatus(req, res) {
  const data = await getAllCoworkerShiftsConfirmable();
  return res.json(data);
}

router.patch('/confirm/:shiftExchangeid', catchErrors(confirmShiftExchange));
router.patch('/approvepending/:shiftExchangeid', catchErrors(approvePending));
router.patch('/declinepending/:shiftExchangeid', catchErrors(declinePending));
router.patch('/setpending/:shiftExchangeid', catchErrors(setPending));
router.get('/confirmable', catchErrors(showShiftExchangeByStatus));
router.get('/confirmable/shiftsforexchange', catchErrors(showConfirmableShiftByStatus));
router.get('/confirmable/coworkershifts', catchErrors(showCoworkerShiftByStatus));
router.get('/shiftsforexchange', catchErrors(showShiftsForExchange));
router.get('/coworkershifts', catchErrors(showCoworkerShifts));
router.delete('/:shiftExchangeid', catchErrors(deleteShiftExchange));
router.get('/:shiftExchangeid', catchErrors(showShiftExchangeById));
router.post('/', catchErrors(createShiftExchange));
router.get('/', catchErrors(showShiftExchanges));
