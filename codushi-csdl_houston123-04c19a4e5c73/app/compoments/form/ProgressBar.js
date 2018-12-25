import React from 'react';
import style from './style.css';

class ProgressBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0,
            isSet: false,
        }
    }

    componentDidMount () {
        if (this.props.default != null) {
            let v = this.props.default
            if (v > 100) {
                v = 100;
            }
            if (v < 0) {
                v = 0;
            }
            this.setState({
                value: v,
                isSet: true,
            })            
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.isSet && (prevState.value != this.state.value)) {            
            this.refs.runer.style.width = this.state.value + '%';
            this.setState({
                isSet: false,
            })
        }
    }

    value () {
        if (arguments[0] != null) {
            let v = arguments[0];
            if (v > 100) {
                v = 100;
            }
            if (v < 0) {
                v = 0;
            }
            this.setState({
                value: v,
                isSet: true,
            });
        } else {
            return this.state.value;
        }
    }

    render () {
        return (
            <div className={style.progressbar}>
                <div ref="runer">
                    {this.state.value + ' %'}
                </div>
            </div>
        )
    }
}

module.exports = ProgressBar;
