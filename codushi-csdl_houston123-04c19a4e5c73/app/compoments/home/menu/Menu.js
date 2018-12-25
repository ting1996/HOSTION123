import React from 'react';
import { Provider, connect } from 'react-redux';
// import store from 'store';
import style from './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faListUl,
    faToolbox,
} from '@fortawesome/free-solid-svg-icons';

class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lists: [],
            tools: [],
            isClickContainer: false,
            isClickBackground: false,
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
                        let lists = [];
                        let tools = [];
                        for (let row of rows) {
                            if (row.parent == null) {
                                switch (row.type) {
                                    case 'list': {
                                        lists.push(row);
                                    } break;
                                    case 'tool': {
                                        tools.push(row);
                                    } break;
                                    default:
                                        break;
                                }
                            } else {
                                for (let row2 of rows) {
                                    if (row2.id == row.parent) {
                                        if (row2.child == null) {
                                            row2.child = [row];
                                        } else {
                                            row2.child.push(row);
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        this.setState({
                            lists,
                            tools,
                        })
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
        if (prevProps.userInformation == null
        && this.props.userInformation != null) {
            let query = 'SELECT * FROM menu ' + 
            'WHERE `permissionAllow` LIKE \'%"permission":"!\?!"%\'' + 
            'OR `permissionAllow` LIKE \'%"permission":"all"%\'; ';
            query = query.replace('!\?!', this.props.userInformation.permission);
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                fn: 'home_menu_loadlistmenu',
            });
        }

        if (this.state.isClickContainer) {
            if (!this.state.isClickBackground) {
                try {
                    this.props.onClickContainer()
                } catch (error) {
                    
                }
            }
            this.setState({
                isClickBackground: false,
                isClickContainer: false,
            })
        }
    }

    render () {
        let showStyle = {}
        if (this.props.isShow == true) {
            showStyle.left = 0;
        }

        return (
            <div
                className={style.container}
                style={showStyle}
                onClick={() => {this.setState({isClickContainer: true})}}
            >
                <div
                    className={style.background}
                    style={showStyle}
                    onClick={() => {this.setState({isClickBackground: true})}}
                >
                    <div
                        className={style.branch}  
                        onClick={() => {
                            try {
                                this.props.onClickBranch()
                            } catch (error) {
                                
                            }
                        }}
                    >
                        <div style={{
                            padding: '5px 30px',
                            background: '#8e001e',
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            fontWeight: 'bold',
                            borderRadius: '20px',
                        }}>
                            {this.props.branchName}
                        </div>
                    </div>
                    <div className={style.root}>
                        <div className={style.title}>
                            <FontAwesomeIcon icon={faListUl}/>
                            <span style={{padding: '5px'}}>
                                Danh Sách
                            </span>
                        </div>
                        <div>
                            {this.state.lists.map(v => {
                                let child = null;
                                if (v.child != null) {
                                    child = 
                                    <div className={style.listChildButton}>
                                        {v.child.map(v1 => {
                                            return (
                                                <div
                                                    className={style.button}
                                                    onClick={this.onClickItem.bind(this, v1)}
                                                    id={v1.name}
                                                >
                                                    <FontAwesomeIcon icon={v1.icon}/>
                                                    <span style={{padding: '5px'}}>
                                                        {v1.label}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                }
                                return (
                                    <div className={style.parentButton}>
                                        <div
                                            className={style.button}
                                            onClick={this.onClickItem.bind(this, v)}
                                            id={v.name}
                                        >
                                            <FontAwesomeIcon icon={v.icon}/>
                                            <span style={{padding: '5px'}}>
                                                {v.label}
                                            </span>
                                        </div>
                                        {child}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className={style.root}>
                        <div className={style.title}>
                            <FontAwesomeIcon icon={faToolbox}/>
                            <span style={{padding: '5px'}}>
                                Công Cụ
                            </span>
                        </div>
                        <div>
                            {this.state.tools.map(v => {
                                let child = null;
                                if (v.child != null) {                                    
                                    child = 
                                    <div className={style.listChildButton}>
                                        {v.child.map(v1 => {
                                            return (
                                                <div
                                                    className={style.button}
                                                    onClick={this.onClickItem.bind(this, v1)}
                                                    id={v1.name}
                                                >
                                                    <FontAwesomeIcon icon={v1.icon}/>
                                                    <span style={{padding: '5px'}}>
                                                        {v1.label}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                }
                                return (
                                    <div className={style.parentButton}>
                                        <div
                                            className={style.button}
                                            onClick={this.onClickItem.bind(this, v)}
                                            id={v.name}
                                        >
                                            <FontAwesomeIcon icon={v.icon}/>
                                            <span style={{padding: '5px'}}>
                                                {v.label}
                                            </span>
                                        </div>
                                        {child}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    onClickItem (value) {
        try {
            this.props.onClick(value)
        } catch (error) {
        }
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (Menu);
