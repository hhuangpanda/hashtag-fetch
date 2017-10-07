const express = require('express');
const http = require('http');
const path = require('path');
const passport = require('passport');
const keys = require('../config/keys');
const Twit = require('twit');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../client/');
const { Users } = require('../utils/users');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const users = new Users();

//link static files such as pictures in public into express
app.use(express.static(publicPath));

app.get('/admin',(res,rep) => {
  rep.sendFile(publicPath + 'views/admin.html');
});

app.get('/',(res,rep) => {
  rep.sendFile(publicPath + 'views/index.html');
});

var T = new Twit({
  consumer_key:         keys.TWITTER_CONSUMER_KEY,
  consumer_secret:      keys.TWITTER_CONSUMER_SECRET,
  access_token:         keys.TWITTER_Access_Token,
  access_token_secret:  keys.TWITTER_Access_Token_Secret,
  timeout_ms:           60*1000  // optional HTTP request timeout to apply to all requests.
});

let filter = { track: [] };

io.on('connection',(socket) => {
  users.addUser(socket.id);
  console.log(`New user connected, ${Date.now()}`);

  let stream;
  let streamOn;

  socket.on('adminFilterInput', (adminFilter) => {
    if (streamOn) {
      stream.stop();
      streamOn = true;
    }
    console.log('Filter: ',filter);
    for(let key in adminFilter) {
      filter[key] ? filter[key].push(adminFilter[key]) : filter[key] = [adminFilter[key]];
    }

    if (streamOn) {
      stream = T.stream('statuses/filter', filter);
      
    }

    console.log('Filter: ',filter);
  });

  socket.on('searchHashtag', (hashtag) => {

    hashtag = hashtag.trim();
    hashtag = hashtag.charAt(0) === '#' ? hashtag : `#${hashtag}`;

    filter.track.push(hashtag);
    console.log('Filter: ',filter);
    if (streamOn) {
      stream.stop();
    }

    stream = T.stream('statuses/filter', filter);
    //console.log('hashtag list',users.getHashtagList());
    //stream starts after user input hashtag
    stream.on('tweet', (tweet) => {
      console.log('tweet:!!!!!!!!!!!!!!',tweet);
        socket.emit('newTwt',tweet);
    });

    streamOn = true;

    socket.on('disconnect',() => {
      stream.stop();
      if (users.getUser(socket.id)) {
        users.removeUser(socket.id);
      }
    });

  });

});


server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
