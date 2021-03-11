import passport from 'passport';
import { Strategy } from 'passport-local';
import { comparePasswords, findByUsername, findById } from './userAuthentication.js';

// gæti þurft að breyta þessum föllum mögulega?

async function strat(username, password, done) {
  // console.log('username: ', username, ', password: ', password);
  try {
    const user = await findByUsername(username);
    if (!user) {
      return done(null, false);
    }

    const result = await comparePasswords(password, user.password);
    if (result) {
      return done(null, user);
    }
    return done(null, false);
  } catch (e) {
    console.error(e);
    return done(e);
  }
}

passport.use(new Strategy(strat));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = findById(id.id);
    done(null, user);
  } catch (e) {
    console.error(e);
    done(e);
  }
});

export default passport;
