import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';

class Notification extends React.Component {
    render () {
        let icon = ''
        switch (this.props.item.type) {
            case 'warning':
                icon = <i 
                    className="fa fa-exclamation-triangle fa-2x"
                    aria-hidden="true"
                    style={{'color': '#cc0'}}
                />;
                break;
            case 'error':
                icon = <i
                    className="fa fa-exclamation fa-2x"
                    aria-hidden="true"
                    style={{'color': '#cc4100'}}
                />;
                break;
            case 'information':
                icon = <i
                    className="fa fa-info fa-2x"
                    aria-hidden="true"
                    style={{'color': '#00cc18'}}
                />;
                break;
            default:
                
        }

        return (
            <div className={style.note + ' ' + style[this.props.item.type]}>
                {icon}
                {' ' + this.props.item.content}
            </div>
        )
    }

    componentDidMount () {
        let {dispatch, item} = this.props;
        this.close = setTimeout(() => {
            dispatch({
                type: 'ALERT_NOTIFICATION_REMOVE',
                item,
            })
        }, 5000);
    }
}

module.exports = connect(function (state) {
    return {
      notifications: state.alertnotification,
    };
}) (Notification);
