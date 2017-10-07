const passport = require('passport');
const TwitterStrategy = require('passport-twitter');
const keys = require('./config/keys');

passport.use(new TwitterStrategy({
    consumerKey: keys.TWITTER_CONSUMER_KEY,
    consumerSecret: keys.TWITTER_CONSUMER_SECRET,
    callbackURL: "/auth/twitter/callback"
  },
  (token, tokenSecret, profile, cb) => {
    User.findOrCreate({ twitterId: profile.id }, (err, user) => {
      return cb(err, user);
    });
  }
));
