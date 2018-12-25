/**
 * notifyType: warning, error, information
 */

// this.props.dispatch({
//     type: 'ALERT_NOTIFICATION_ADD',
//     content: 'Không tìm thấy dữ liệu trong Database!',
//     notifyType: 'warning',
// })

// this.props.dispatch({
//     type: 'ALERT_NOTIFICATION_ADD',
//     content: 'Không tìm thấy dữ liệu trong Database!',
//     notifyType: 'error',
// })

// this.props.dispatch({
//     type: 'ALERT_NOTIFICATION_ADD',
//     content: 'Không tìm thấy dữ liệu trong Database!',
//     notifyType: 'information',
// })

// store.dispatch({
//     type: 'ALERT_NOTIFICATION_ADD',
//     content: 'Không tìm thấy dữ liệu từ hệ thống!',
//     notifyType: 'error',
// })

let test = [
    {
        content: 'error',
        type: 'error',
    },
    {
        content: 'warning',
        type: 'warning',
    },
    {
        content: 'information',
        type: 'information',
    }
]

var alertnotification = function ( state = [], action ) {
    let item = {
        content: action.content,
        type: action.notifyType,
    }
    switch (action.type) {
        case 'ALERT_NOTIFICATION_ADD':
            return [...state, item];
        case 'ALERT_NOTIFICATION_REMOVE':
            return state.filter((v, i) => v != action.item);
        default:
            return state;
    }
}

module.exports = alertnotification;