import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
var ReactDOM = require('react-dom');

class StartupNotification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            version: [],
            contents: [],
            url: null,
            listurl: [],
            showclose: 'show',
            shownext: 'none',
            showback: 'none',
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeVersion = this.changeVersion.bind(this);
    }

    SocketEmit () {
        if (arguments[0] == 'gui-query-den-database') {
            $('.loading').show();
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
                    case 'system_startupnotification_loadreleasenote':
                        let version = [];
                        let contents = [];
                        let shownext = 'none';
                        let showback = 'none';
                        let showclose = 'none';
                        for (let row of rows) {
                            try {
                                contents.push(row['Contents'].split(' '));
                                version.push(row['Version']);
                            } catch (e) {
                                
                            }
                        }

                        if (version.length > 0) {
                            if (contents[0].length <= 1) {
                                showclose = 'block';
                            } else {
                                shownext = 'block';
                            }

                            if (version.length > 1) {
                                shownext = 'block';
                                showclose = 'none';
                            }

                            this.setState({
                                version: version,
                                contents: contents,
                                listurl: contents[0],
                                url: contents[0][0],
                                showclose: showclose,
                                shownext: shownext,
                                showback: showback,
                            })                                             
                        } else {
                            this.close();
                        }
                        break;
                    default:
                }                
            }
        }

        if (hanhdong == 'loi-cu-phap') {
            this.close();
        }
    }

    componentDidMount () {
        let query = null;
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        query = 'SELECT * FROM quanlyhocsinh.RELEASENOTE';
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'system_startupnotification_loadreleasenote',
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.version != this.state.version) {
            let now = $.cookie('releasenote_version');
            if (now != null) {
                try {
                    let ver = this.state.version.indexOf(now) + 1;
                    if (ver > this.state.version.length - 1 || ver < 0) {
                        this.close();
                    } else {
                        $(this.refs.version).val(ver).trigger('change');                    
                        this.changeVersion(ver);   
                    }
                } catch (e) {
                    this.close();
                }
            }
        }
    }

    onChange (e) {
        this.changeVersion(e.target.value);
    }

    changeVersion (ver, getlast) {
        let shownext = 'block';
        let showback = 'block';
        let showclose = 'none';
        let imgindex = 0;
        if (ver == 0) {
            showback = 'none';
        } else if (ver >= (this.state.version.length - 1) && this.state.contents[ver].length <= 1) {
            showclose = 'block';
            shownext = 'none';
        }

        if (getlast) {
            imgindex = this.state.contents[ver].length - 1;            
        }

        if (imgindex > 0) {
            showback = 'block';
        }

        this.setState({
            listurl: this.state.contents[ver],
            url: this.state.contents[ver][imgindex],
            showclose: showclose,
            shownext: shownext,
            showback: showback,
        })
    }

    close () {
        try {
            this.props.onClose();
        } catch (error) {
            
        }
    }

    next () {
        let listurl = this.state.listurl;
        let url = this.state.url;
        let shownext = 'none';
        let showback = 'none';
        let showclose = 'none';

        let nextimg = listurl.indexOf(url) + 1;
        if (nextimg > (listurl.length - 1)) {
            let nextver = Number(this.refs.version.value) + 1;
            if (nextver < this.state.version.length) {
                $(this.refs.version).val(nextver).trigger('change');
                this.changeVersion(nextver);
            } else {
                this.close();
            }
        } else if (nextimg == (listurl.length - 1) && (Number(this.refs.version.value) + 1 == this.state.version.length)) {
            shownext = 'none';
            showback = 'block';
            showclose = 'block';
            url = listurl[nextimg];
            this.setState({
                shownext: shownext,
                showback: showback,
                showclose: showclose,
                url: url,
            })
        } else {
            shownext = 'block';
            showback = 'block';
            showclose = 'none';
            url = listurl[nextimg];
            this.setState({
                shownext: shownext,
                showback: showback,
                showclose: showclose,
                url: url,
            })
        }
    }

    back () {
        let listurl = this.state.listurl;
        let url = this.state.url;
        let shownext = 'block';
        let showback = 'none';
        let showclose = 'none';

        let backimg = listurl.indexOf(url) - 1;
        if (backimg < 0) {
            let backver = Number(this.refs.version.value) - 1;
            if (backver >= 0) {
                $(this.refs.version).val(backver).trigger('change');
                this.changeVersion(backver, true);
            } else {
                this.close();
            }
        } else if (backimg == 0 && (this.refs.version.value - 1) < 0) {
            showback = 'none';
            url = listurl[backimg];
            this.setState({
                shownext: shownext,
                showback: showback,
                showclose: showclose,
                url: url,
            })
        } else{
            showback = 'block';
            url = listurl[backimg];
            this.setState({
                shownext: shownext,
                showback: showback,
                showclose: showclose,
                url: url,
            })
        }
    }

    done () {        
        $.cookie('releasenote_version', this.state.version[this.state.version.length - 1]);
        this.close();
    }

    render () {
        return (
            <div className={style.background}>
                <div className={style.body}>
                    <img src={this.state.url} alt="thongbao" height="100%" width="100%"/>
                    <div className={style.version}>
                        Phiên bản: 
                        <select onChange={this.onChange.bind(this)} ref="version">
                            {
                                this.state.version.map((v,i) => {
                                    return (
                                        <option key={i} value={i}>{v}</option>
                                    );
                                })
                            }
                        </select>
                    </div>
                    <div className={style.close + ' ' + style.button} onClick={this.done.bind(this)} style={{"display": this.state.showclose}}>
                        <i class="fa fa-times fa-2x" aria-hidden="true"></i>
                    </div>
                    <div className={style.back + ' ' + style.button} onClick={this.back.bind(this)} style={{"display": this.state.showback}}>
                        <i class="fa fa-arrow-left fa-2x" aria-hidden="true"></i>
                    </div>
                    <div className={style.next + ' ' + style.button} onClick={this.next.bind(this)} style={{"display": this.state.shownext}}>
                        <i class="fa fa-arrow-right fa-2x" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (StartupNotification);
