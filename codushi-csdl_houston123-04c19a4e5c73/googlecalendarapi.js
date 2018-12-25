console.log('Google Calendar');

// /**
//  * Google API
//  * Use google calendar api in web
//  */
// var google = require('googleapis');
// var moment = require('moment-timezone');
// var fs = require('fs.extra');

// var OAuth2 = google.auth.OAuth2;
// var TOKEN_DIR = './credentials/';
// var TOKEN_PATH = TOKEN_DIR + 'googleaip_calendar_token.json';
// var oauth2Client = new OAuth2(
//   '556186180997-1f9fnuhpcae5ei82d76nm4n2fbvd0n82.apps.googleusercontent.com',
//   'dUoiDhZkCZj2VP_KzGj6B_-x',
//   'http://localhost:80/xacnhangooglecalendar'
// );
// var google_auth_url = oauth2Client.generateAuthUrl({
//   access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
//   scope: [
//     'https://www.googleapis.com/auth/calendar',
//   ]
// });

// function storeToken(token) {
//   try {
//     fs.mkdirSync(TOKEN_DIR);
//   } catch (err) {
//     if (err.code != 'EEXIST') {
//       throw err;
//     }
//   }
//   fs.writeFile(TOKEN_PATH, JSON.stringify(token));
//   // console.log('Token stored to ' + TOKEN_PATH);
// }

// function setCredentials(res) {
//   fs.readFile(TOKEN_PATH, function(err, token) {
//     if (err) {
//       res.redirect(google_auth_url);
//     } else {
//       oauth2Client.credentials = JSON.parse(token);
//       console.log('Calendar service: setCredentials successfull');
//       res.redirect('/test3');
//     }
//   });
// }

// function listEvents(auth, callback) {
//   var calendar = google.calendar('v3');
//   calendar.events.list({
//     auth: auth,
//     calendarId: 'primary',
//     timeMin: (new Date()).toISOString(),
//     maxResults: 10,
//     singleEvents: true,
//     orderBy: 'startTime'
//   }, function(err, response) {
//     if (err) {
//       console.log('Calendar service: ' + err);
//       callback('error');
//     }
//       callback(response.items);
//   });
// }

// function insertEvents(auth, callback) {
//   var calendar = google.calendar('v3');
//   var event = {
//     'summary': 'Nodejs send',
//     'location': 'DIA',
//     'description': 'Set by Nodejs',
//     'start': {
//       'dateTime': moment.tz(new Date().toJSON(), 'Asia/Ho_Chi_Minh').format(),
//       'timeZone': 'Asia/Ho_Chi_Minh',
//     },
//     'end': {
//       'dateTime': moment.tz(new Date(2017, 10, 6, 16, 0, 0, 0).toJSON(), 'Asia/Ho_Chi_Minh').format(),
//       'timeZone': 'Asia/Ho_Chi_Minh',
//     },
//   };
  
//   calendar.events.insert({
//     auth: auth,
//     calendarId: 'primary',
//     resource: event,
//   }, function(err, event) {
//     if (err) {
//       console.log('Calendar service: ' + err);
//       callback('error');
//     }
//     callback(event);
//   });
// }

// app.get('/test3', function (req, res) {
//   insertEvents(oauth2Client, function (data) {
//     if( data != 'error' ) {
//       res.send(data);
//     } else {
//       res.send('Lỗi vui lòng liên hệ ban quản trị');
//     }    
//   });
// });

// app.get('/test2', function (req, res) {
//   listEvents(oauth2Client, function (data) {
//     if( data != 'error' ) {
//       res.send(data);
//     } else {
//       res.send('Lỗi vui lòng liên hệ ban quản trị');
//     }    
//   });
// });

// const options = {
//   key: fs.readFileSync('keys/key.pem'),
//   cert: fs.readFileSync('keys/cert.pem')
// };

// app.get('/test' , function (req, res) {
//   setCredentials(res);
// });

// app.get('/xacnhangooglecalendar' , function (req, res) {
//   oauth2Client.getToken(req.query.code, function (err, tokens) {
//     if (!err) {
//       storeToken(tokens);
//       setCredentials(res);
//     }
//   });
// });