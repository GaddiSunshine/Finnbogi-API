import express from 'express';
import dotenv from 'dotenv';
import { query } from './db.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

function catchError(f) {
  return (req, res, next) => f(req, res, next).catch(next);
}

const app = express();
const router = express.Router();

app.set('view engine', 'ejs');

async function getShifts(req,res) {
  let shifts
  try {
    shifts = await query('select * from shifts;');
  } catch (e) {
    console.error(e);
  }
  if(shifts) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(shifts.rows));
  } else {
    res.render('404', {title: "404" });
  }
}

router.get('/shifts', catchError(getShifts));


app.use('/', router);

app.use('./', (req, res) => {
  res.status(404).render('404', { title: "404" });
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
