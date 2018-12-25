/**
 * userInfo: state.userinformation
 */

// this.props.dispatch({
//     type: 'USER_INFORMATION_SET',
//     data: {},
// })

// this.props.dispatch({
//     type: 'USER_INFORMATION_BRANCH',
//     branch: 'DIA',
// })

// this.props.dispatch({
//     type: 'USER_INFORMATION_TABLESELECTED',
//     menuSelected: '..',
// })

let userinformation = function ( state = {}, action ) {
    switch (action.type) {
        case 'USER_INFORMATION_SET':            
            return action.data;
        case 'USER_INFORMATION_BRANCH':
            return {...state, branch: action.branch};
        case 'USER_INFORMATION_TABLESELECTED':
            return {...state, menuSelected: action.menuSelected};
        default:
            return state;
    }
}

module.exports = userinformation;