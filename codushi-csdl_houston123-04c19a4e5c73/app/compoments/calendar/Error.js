import React from 'react';
import style from './style.css';

class Error extends React.Component {
    onClick() {
        $('.modal-themlophoc').hide();
    }

    render () {
        return (
            <div>
                <div className={style.error}>
                    <p>{this.props.error}</p>
                    <input type="button" onClick={this.onClick.bind(this)} value="Thoát" />
                </div>
            </div>
        )
    }
}

module.exports = Error;