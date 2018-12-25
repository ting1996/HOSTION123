let redux = require('redux');
let socket = require('./socket');
let alertnotification = require('./alert');
let userinformation = require('./userInformation');

let reducer = redux.combineReducers({ 
    socket,
    alertnotification,
    userinformation,
});

module.exports = reducer;