const express = require('express');
const http = require('http');
const path = require('path');
const passport = require('passport');
const keys = require('../config/keys');
const Twit = require('twit');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../client/');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

//--------------------routing-------------------
app.get('/admin',(res,rep) => {
  rep.sendFile(publicPath + 'views/admin.html');
});

app.get('/',(res,rep) => {
  rep.sendFile(publicPath + 'views/index.html');
});


//---------------------setting up keys to use twitter api-------------------------------
var T = new Twit({
  consumer_key:         keys.TWITTER_CONSUMER_KEY,
  consumer_secret:      keys.TWITTER_CONSUMER_SECRET,
  access_token:         keys.TWITTER_Access_Token,
  access_token_secret:  keys.TWITTER_Access_Token_Secret,
  timeout_ms:           60*1000  // optional HTTP request timeout to apply to all requests.
});

//------------------init the filter for fetching twit ----------------------------
let filter = { track: [] };
let socketId;
let adminId;
let streamOn;
let currentAdminFilter;
let stream;

//---------------io listens on new socket connected on the client side ---------------------
io.on('connection',(socket) => {

  console.log(`New user connected, ${Date.now()}`);


//function to fetch twit using stream and post twit to the front using socket.io
// it will be called when user submits a new hashtag search
// or admin sets a new filter
  const fetchAndPostTwit = (socketId) => {

    //if streaming is currently on, stop it,
    //since the filter for fetching twit is changed
    //when user enter an new hashtag or
    //admin updated the filter

    if (streamOn) {
      stream.stop();
      streamOn = false;
    }

    //start a streaming with a filter
    stream = T.stream('statuses/filter', filter);

    //listen on new tweet
    stream.on('tweet', (tweet) => {

      // console.log('tweet:!!!!!!!!!!!!!!',tweet);
      console.log('new tweet, ', filter.track);
        // emit new tweet to front. Socket in index.js in the client/views folder is listening to this

        io.to(socketId).emit('newTwt',tweet);
    });

    //set it to on so the the code at line 57 knows,
    //I tried if (stream) or (!!stream), didnt seem to work
    streamOn = true;

    //stop the stream when the socket is disconnected, e.g. browser closed
    // otherwise the streaming will continue as long as the server is on
    if (socket.id !== adminId) {
      socket.on('disconnect',() => {
        stream.stop();
        streamOn = false;
      });
    }

  }

//---------You can ignore this part for now, I am still working on it---------------
// this part is for when admin sets a filter for the twit user would get, by e.g. location, username
  socket.on('adminFilterInput', (adminFilter) => {
    adminId = socket.id;
    // currentAdminFilter = adminFilter[0];
        console.log('adminFilter', adminFilter[0]);
        let i = 0;

        for(let key in adminFilter[0]) {
          switch (adminFilter[1]) {

            case "addNew":
              filter[key] ? filter[key].push(adminFilter[0][key]) : filter[key] = [adminFilter[0][key]];
              break;

            case "delete":
              filter[key] = filter[key].filter((elem) => {
                return elem !== adminFilter[0][key];
              });
              break;

            default:
              if (i === 0) {
                filter = {};
              }
              filter[key] = [adminFilter[0][key]]
              i++;
          }
        }

    console.log('Filter: ',filter);

    //-----once the filter is updated, call the function below to start new streaming again based on new filter
    fetchAndPostTwit(socketId);
  });
//-----------------------------------------------------------------

//----it listens the event that user submits the hashtag,
//-----the event is send by the code socket.emit('searchHashtag', hashtagInputBox.val()); at client/js/index  ------------------------
  socket.on('searchHashtag', (hashtag) => {
    socketId = socket.id;
    console.log('socket.id: ', socketId);
    //Sanitize the user input
    hashtag = hashtag.trim();
    hashtag = hashtag.charAt(0) === '#' ? hashtag : `#${hashtag}`;

    var currentHashtag = hashtag;

    //update the filter
    filter.track[0] = hashtag;
    console.log('Filter: ',filter);

    fetchAndPostTwit(socket.id);

  });

});


server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
