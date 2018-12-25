/**
 *  <Button 
        onClick={this.next.bind(this)}
        value="Tiếp Tục"
        icon="next"
        style={{'float': 'right', 'margin-right': '10px',}}
        disabled={this.state.disbutton}
    />
 */

import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner,
    faCheck,
    faTimes,
    faPrint,
    faForward,
    faSmile,
    faPaste,
    faChevronRight,
    faChevronLeft,
    faReply,
    faEye,
} from '@fortawesome/free-solid-svg-icons';

import mystyle from './stylebutton.css';

class Button extends React.Component {
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

        switch (this.props.icon) {
            case 'agree':
                icon = <FontAwesomeIcon icon={faCheck}/>
                break;
            case 'close':
                icon = <FontAwesomeIcon icon={faTimes}/>
                break;
            case 'print':
                icon = <FontAwesomeIcon icon={faPrint}/>
                break;
            case 'next':
                icon = <FontAwesomeIcon icon={faChevronRight}/>
                break;
            case 'back':
                icon = <FontAwesomeIcon icon={faChevronLeft}/>
                break;
            case 'skip':
                icon = <FontAwesomeIcon icon={faForward}/>
                break;
            case 'smile':
                icon = <FontAwesomeIcon icon={faSmile}/>
                break;
            case 'paste':
                icon = <FontAwesomeIcon icon={faPaste}/>            
                break;
            case 'reply':
                icon = <FontAwesomeIcon icon={faReply}/>            
                break;
            case 'eye':
                icon = <FontAwesomeIcon icon={faEye}/>  
                break;
            default:
        }

        if (this.props.disabled == true) {
            icon = <FontAwesomeIcon icon={faSpinner} spin/>
            fn = null;
        }

        return (
            <div 
                onClick={fn} 
                className={mystyle.button}
                style={this.props.style}
            >
                {icon}{' '}{this.props.value}
            </div>
        );
    }
}

module.exports = Button;
