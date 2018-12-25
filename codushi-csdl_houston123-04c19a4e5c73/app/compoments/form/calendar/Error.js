import React from 'react';
import style from './style.css';

class Error extends React.Component {
    render () {
        return (
            <div>
                <div className={style.error}>
                    <p>{this.props.error}</p>
                </div>
            </div>
        )
    }
}

module.exports = Error;