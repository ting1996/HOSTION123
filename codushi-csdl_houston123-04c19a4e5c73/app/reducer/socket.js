var socket_io = window.io('/');

var socket = function ( state = socket_io, action ) {
    return state;
}
        
module.exports = socket;
    
