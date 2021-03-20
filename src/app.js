import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';

import passport from './login.js';

import { router as userRouter } from './users.js';
import { router as shiftRouter } from './shifts.js';

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const theDirname = dirname(filename);

const {
  PORT: port = 3000,
  SESSION_SECRET: sessionSecret = 'leyndarmál',
} = process.env;

const app = express();

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 60 * 60 * 1000, // 1klst
}));

app.use(express.static('public'));
app.use('', express.static(join(theDirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

// innskráningarvirkni
app.post(
  '/users/login',
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð rangt',
    failureRedirect: '/users',
  }),

  (req, res) => {
    res.redirect(`/users/${req.session.passport.user.id}`);
  },
);

// útskráir notanda
app.get('/users/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.use('/users', userRouter);
app.use('/shifts', shiftRouter);

function indexRoute(req, res) {
  return res.json({
    shifts: {
      shifts: {
        href: '/shifts',
        methods: [
          'GET'
        ],
      },
      shift: {
        href: '/shifts/{id}',
        methods: [
          'GET',
          'PATCH',
          'DELETE',
        ],
      },
    },
    users: {
      users: {
        href: '/users',
        methods: [
          'GET',
        ],
      },
      user: {
        href: '/users/{id}',
        methods: [
          'GET',
          'PATCH',
          'DELETE',
        ],
      },
      register: {
        href: '/users/register',
        methods: [
          'POST',
        ],
      },
      login: {
        href: '/users/login',
        methods: [
          'POST',
        ],
      },
      me: {
        href: '/users/me',
        methods: [
          'GET',
          'PATCH',
        ],
      },
    },
  });
}

app.use('/', indexRoute);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
