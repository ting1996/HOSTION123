import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
import Select from 'react-select';

class BranchSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            danhsachcoso: [],            
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    changeSize () {
        this.refs.background.style.paddingTop = ((window.innerHeight - this.refs.body.offsetHeight) / 2) + 'px';
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
                    case 'form_branchselector_loaddanhcoso':
                        let danhsachcoso = [];
                        for (let row of rows) {
                            danhsachcoso.push({label: row['Tên Cơ Sở'], value: row['Cơ Sở']})
                        }
                        this.setState({
                            danhsachcoso: danhsachcoso,
                        })
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        let query;
        window.addEventListener("resize", this.changeSize);
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        if (this.props.limitBranch == null
        || (this.props.limitBranch != null && this.props.limitBranch[0] == 'ALL')) {
            query = 'SELECT * FROM quanlyhocsinh.COSO WHERE `Cơ Sở` != \'ALL\'; ';
        } else {
            query = 'SELECT * FROM quanlyhocsinh.COSO WHERE ';
            for (let branch of this.props.limitBranch) {
                query += '`Cơ Sở` = \'!\?!\' OR '.replace('!\?!', branch);
            }
            query = query.substr(0, query.length - ' OR '.length);
        }        
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_branchselector_loaddanhcoso',
        });
        this.changeSize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    dongy () {
        try {
            this.props.onAgree(this.state.value.value);
        } catch (e) {
            
        }
    }

    cancel () {
        try {
            this.props.onCancel();
        } catch (e) {
            
        }
    }

    onChange (v) {
        this.setState({
            value: v,
        })
    }

    render () {
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body">
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Chọn Cơ Sở</h2>
                    </div>
                    <div className="body">
                        <div className="unsetdivformstyle">
                            <label for="">Danh Sách Cơ Sở: </label>
                            <Select
                                name="Danh sách cơ sở"
                                placeholder="--- Danh sách cơ sở ---"
                                value={this.state.value}
                                options={this.state.danhsachcoso}
                                onChange={this.onChange.bind(this)}
                                ref="loainhucau"
                            />
                        </div>
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.cancel.bind(this)} value="Hủy"/>
                        <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
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
}) (BranchSelector);
