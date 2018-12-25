import React from 'react';
import { Provider, connect } from 'react-redux';
// import store from 'store';
import style from './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class AdditionalConditional extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
    }

    SocketEmit () {
        if (arguments[0] == 'gui-query-den-database') {
            // $('.loading').show();
        }

        switch (arguments.length) {
            case 2:
                this.props.socket.emit(arguments[0], arguments[1]);
                break;
            case 3:
                this.props.socket.emit(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                this.props.socket.emit(arguments[0], arguments[1], arguments[2], arguments[3]);
                break;
            default:                
        }
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'home_menu_loadlistmenu': {
                        
                    }break;
                    default:                        
                }
            }
        }  
    }

    componentDidMount () {
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        
    }

    render () {
        return (
            <div
                className={style.container}
            >
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
      userInfo: state.userinformation,
    };
}) (AdditionalConditional);
