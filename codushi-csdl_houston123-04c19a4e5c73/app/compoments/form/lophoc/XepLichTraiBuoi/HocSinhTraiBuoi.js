import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');
import ChuyenLop from './ChuyenLop'

class HocSinhTraiBuoi extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            themtraibuoi: [],
            isBusy: true,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.dongy = this.dongy.bind(this);
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_xeplichhoctraibuoi_loadthongtintraibuoi_' + this.props.data['User ID']:                        
                        if (rows[0]['Thời Gian Chuyển'] != null
                        && rows[0]['Thời Gian Chuyển'] != '') {
                            try {
                                let thoigianchuyen = JSON.parse(rows[0]['Thời Gian Chuyển']);
                                let themtraibuoi = this.state.themtraibuoi;
                                let count = 0;
                                for (let val of thoigianchuyen) {
                                    let newid = {};
                                    newid.id = count;
                                    newid.malopchuyen = val.malopchuyen;
                                    newid.thoigianchuyen = thoigianchuyen;
                                    themtraibuoi.push(newid);
                                    count++;
                                }
                                this.setState({
                                    themtraibuoi: themtraibuoi
                                });
                            } catch (e) {
                                
                            }
                        }
                        break;
                    default:                        
                }                
            }
        }  
    }

    componentDidMount () {
        let query;
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.getMe(this);
        query = 'SELECT * FROM DANHSACHHOCSINHTRONGLOP WHERE `User ID` = \'!\?!\' AND `Mã Lớp` = \'!\?!\'';
        query = query.replace('!\?!', this.props.data['User ID']);
        query = query.replace('!\?!', this.props.malop);
        this.props.socket.emit('gui-query-den-database' , query , 'laydulieu_trave', { 
            fn : 'form_xeplichhoctraibuoi_loadthongtintraibuoi_' + this.props.data['User ID'],
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        try {
            this.props.onChange();
        } catch (e) {
            
        }

        if (!this.state.isBusy) {
            this.props.checkBusy();
        }
    }

    onClickThem () {
        let themtraibuoi = this.state.themtraibuoi;
        let newid = {};
        newid.malopchuyen = [];
        newid.thoigianchuyen = [];
        if (themtraibuoi.length > 0) {
            newid.id = themtraibuoi[themtraibuoi.length - 1].id + 1;
        } else {
            newid.id = 0;
        }
        themtraibuoi.push(newid);
        this.setState({
            themtraibuoi: themtraibuoi
        });
    }

    dongy () {
        let lichchuyen = [];
        let themtraibuoi = this.state.themtraibuoi;
        for (let val of themtraibuoi) {
            if (val.hide != true) {
                let temp = this['chuyenlop' + this.props.data['User ID'] + val.id];
                let temparry = {
                    malopchuyen: temp.refs.lopchuyentoi.value,
                    thuchuyendi: temp.refs.thuchuyendi.value,
                    giochuyendi: temp.refs.giochuyendi.value,
                    thuchuyentoi: temp.refs.thuchuyentoi.value,
                    giochuyentoi: temp.refs.giochuyentoi.value,
                };                
                if (temp.state.repeat == true) {
                    temparry.repeat = true;
                } else {
                    temparry.repeat = false;
                    if (temp.refs.ngaycuthe.value != '') {
                        temparry.onceDate = temp.refs.ngaycuthe.value;
                    } else {
                        let date = new Date();
                        temparry.onceDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                    }
                }
                lichchuyen.push(temparry)
            }
        }
        let query = 'UPDATE DANHSACHHOCSINHTRONGLOP SET `Thời Gian Chuyển`=\'!\?!\' WHERE `User ID` = \'!\?!\' AND `Mã Lớp` = \'!\?!\'';
        query = query.replace('!\?!', JSON.stringify(lichchuyen));
        query = query.replace('!\?!', this.props.data['User ID']);
        query = query.replace('!\?!', this.props.malop);
        this.props.socket.emit('gui-query-den-database' , query , 'sua' , {
            isReload : false,
            isSuccess: true,
        });
        this.setState({
            isBusy: false,
        });
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div style={{
                'display': 'grid',
                'grid-template-columns': '50% 50%',
                'border': '1px solid #888',
            }}>
                <h4 style={{'margin': '0', 'text-align': 'center', }}>{this.props.data['User ID'] + ' - ' + this.props.data['Họ Và Tên']}</h4>
                <div>
                    <a href="javascript:void(0)"  style={{'float': 'right'}} onClick={this.onClickThem.bind(this)}>
                        <i className="fa fa-plus fa-lg" aria-hidden="true">{' Thêm'}</i>
                    </a>
                </div>
                {
                    this.state.themtraibuoi.map((v, i) => {
                        return (
                            <ChuyenLop
                                malop={this.props.malop}
                                mahocsinh={this.props.data['User ID']}
                                malopchuyen={v.malopchuyen[i]}
                                thoigianchuyen={v.thoigianchuyen[i]}
                                lopchuyentoi={this.props.lophoc}
                                giohoc={this.props.giohoc}
                                id={v.id}
                                hide={v.hide}
                                getMe={me => (this['chuyenlop' + this.props.data['User ID'] + v.id] = me)}
                                onClickXoa={() => {
                                    let _traibuoi = this.state.themtraibuoi;
                                    for (let _tb of _traibuoi) {
                                        if (_tb.id == i) {
                                            _tb.hide = true;
                                            break;
                                        }
                                    }
                                    this.setState({
                                        themtraibuoi: _traibuoi
                                    });
                                }}
                            />
                        )
                    })
                }
            </div>
        )
    }
}

module.exports = HocSinhTraiBuoi;
