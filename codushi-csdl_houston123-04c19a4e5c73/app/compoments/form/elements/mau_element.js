
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
} from '@fortawesome/free-solid-svg-icons';

// import mystyle from './styletable.css';

class Table extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount () {
        this.update();
    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps, prevState) {
        this.update();
    }

    update () {

    }

    render () {
        let icon = null;
        let fn = this.props.onClick;

        if (this.props.disabled == true) {
            icon = <FontAwesomeIcon icon={faSpinner} spin/>
            fn = null;
        }

        return (
            <div
                onClick={fn} 
                className={mystyle.Table}
                style={this.props.style}
            >
                {icon}{' '}{this.props.value}
            </div>
        );
    }
}

module.exports = Table;
