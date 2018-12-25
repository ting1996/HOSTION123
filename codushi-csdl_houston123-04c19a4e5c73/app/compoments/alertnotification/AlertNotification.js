import React from 'react';
import { connect } from 'react-redux';
import Notification from './Notification'
import style from './style.css';

class AlertNotification extends React.Component {
    render () {
        return (
            <div className={style.body}>
                {this.props.notifications.map((item, index) => {
                    return (
                        <Notification
                            key={index}
                            item={item}
                        />
                    )
                })}
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      notifications: state.alertnotification,
    };
}) (AlertNotification);
