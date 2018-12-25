import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../SoDienThoai'
import Select from 'react-select';

class DiTuVan extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hocsinhcu: false,
            danhsachhocsinhcu: [],
            listoldstuden: [],
            oldname: null,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'dituvan_loadhocsinhcu':
                        let options = [];
                        let oldname = null;
                        let hocsinhcu = false;
                        for (let val of rows) {
                            let value = { 
                                value: val['User ID'],
                                label: val['User ID'] + ' - ' + val['Họ Và Tên'],
                                sodienthoai: val['Số Điện Thoại'],
                                hovaten: val['Họ Và Tên'],
                            }
                            options.push(value);

                            if (this.props.action == 'edit' && this.props.data != null) {
                                if (this.props.data['User ID'] != null && value.value == this.props.data['User ID']) {
                                    oldname = value;
                                    this.sodienthoai.state.value = value.sodienthoai;
                                    hocsinhcu = true;
                                    this.refs.hocsinhcu.checked = true;
                                }
                            }
                        }

                        this.setState({
                            danhsachhocsinhcu: rows,
                            listoldstuden: options,
                            oldname: oldname,
                            hocsinhcu: hocsinhcu,
                        })
                        break;
                    case 'dituvan_themthanhcong':
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        break;
                    case 'dituvan_suathanhcong':
                        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
                        break;
                    default:                        
                }                
            }
        } 
    }

    componentDidMount () {
        let query;
        let that = this;
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        let now = new Date();
        now = now.toLocaleDateString('en-GB').split('/');
        this.refs.ngaylayso.value = now[2] + '-' + now[1] + '-' + now[0];

        query = 'SELECT * FROM quanlyhocsinh.USERS WHERE `Cơ Sở` = \'' + $('.khuvuc').attr('value') + '\' AND `Ngày Nghỉ Học` IS NOT NULL';
        this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'dituvan_loadhocsinhcu',
        });

        if (this.props.action == 'edit' && this.props.data != null) {
            let date = new Date(this.props.data['Ngày Lấy Số']).toLocaleDateString('en-GB').split('/');
            this.refs.ngaylayso.value = date[2] + '-' + date[1] + '-' + date[0];
            this.refs.hovaten.value = this.props.data['Họ Và Tên'];
            this.sodienthoai.state.value = this.props.data['Số Điện Thoại'];
            this.refs.ghichu.value = this.props.data['Ghi Chú'];
        }
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    onChangeHocSinhCu () {
        if (this.state.danhsachhocsinhcu.length > 0) {
            this.setState({hocsinhcu: this.refs.hocsinhcu.checked});
        } else {
            this.refs.hocsinhcu.checked = false;
        }
    }

    onChangeOldStuden (value) {
        this.setState({oldname: value});

        if (value != null) {
            this.sodienthoai.setState({value: value.sodienthoai});
        } else {
            this.sodienthoai.setState({value: ''});
        }        
    }

    dongy () {
        let checkfaile = false;
        let manhansu = $('#lable_button_nexttoicon').attr('value');
        let sdt = this.sodienthoai.state.value;
        let ghichu = this.refs.ghichu.value;
        this.sodienthoai.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        if (sdt == '') {
            this.sodienthoai.refs.input.style.borderColor = 'red';
            checkfaile = true;
        }
        let ngaylayso = this.refs.ngaylayso.value;
        this.refs.ngaylayso.style.borderColor = 'rgb(204, 204, 204)';
        if (ngaylayso == '') {
            this.refs.ngaylayso.style.borderColor = 'red';
            checkfaile = true;
        }
        let hovaten;
        if (this.state.hocsinhcu) {
            $('.dituvan-select-hovaten > div').css('border-color', 'rgb(204, 204, 204)');
            if (this.state.oldname == null) {
                $('.dituvan-select-hovaten > div').css('border-color', 'red');
                checkfaile = true;
            } else {
                hovaten = this.state.oldname.hovaten;
            }
        } else {
            this.refs.hovaten.style.borderColor = 'rgb(204, 204, 204)';
            hovaten = this.refs.hovaten.value;
            if (hovaten == '') {
                this.refs.hovaten.style.borderColor = 'red';
                checkfaile = true;
            }
        }

        if (checkfaile) {
            return;
        } else if(this.props.action == 'add') {
            let query = 'ALTER TABLE `quanlyhocsinh`.`MARKETING` AUTO_INCREMENT = 1; ' +
            'INSERT INTO `quanlyhocsinh`.`MARKETING` (`Họ Và Tên`, `User ID`, `Số Điện Thoại`, `Mã Nhân Viên Đi Tư Vấn`, `Ngày Lấy Số`, `Cơ Sở`, `Ghi Chú`) VALUES (\'?\', \'?\', \'?\', \'?\', \'?\', \'?\', \'?\')';
            query = query.replace('?', hovaten);
            if (this.state.hocsinhcu) {
                query = query.replace('?', this.state.oldname.value);
            } else {
                query = query.replace('\'?\'', null);
            }
            query = query.replace('?', sdt);
            query = query.replace('?', manhansu);
            query = query.replace('?', ngaylayso);
            query = query.replace('?', $('.khuvuc').attr('value'));
            query = query.replace('?', ghichu);
            this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                fn: 'dituvan_themthanhcong',
                isReload: true,
                isSuccess: true,
            });
        } else if (this.props.action == 'edit' && this.props.data != null) {
            let query = 'UPDATE `quanlyhocsinh`.`MARKETING` SET `Họ Và Tên`=\'?\', `User ID`=\'?\', `Số Điện Thoại`=\'?\', `Ngày Lấy Số`=\'?\', `Ghi Chú`=\'?\' WHERE `ID`=\'?\' AND `Mã Nhân Viên Đi Tư Vấn` =\'?\'';
            query = query.replace('?', hovaten);
            if (this.state.hocsinhcu) {
                query = query.replace('?', this.state.oldname.value);
            } else {
                query = query.replace('\'?\'', null);
            }
            query = query.replace('?', sdt);
            query = query.replace('?', ngaylayso);
            query = query.replace('?', ghichu);
            query = query.replace('?', this.props.data['ID']);
            query = query.replace('?', this.props.data['Mã Nhân Viên Đi Tư Vấn']);
            this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                fn: 'dituvan_suathanhcong',
                isReload: true,
                isSuccess: true,
            });
        } else {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Không thể xác định được hành động!',
                notifyType: 'warning',
            })
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = '';
        title = $('#lable_button_nexttoicon').attr('value') + ' - ' + $('#lable_button_nexttoicon')[0].innerText;

        let xhtml = '';
        if (this.state.hocsinhcu) {
            xhtml = 
            <div className="unsetdivformstyle">
                <label for="Họ Và Tên">Họ Và Tên: </label>
                <Select
                    name="Họ Và Tên"
                    value={this.state.oldname}
                    options={this.state.listoldstuden}
                    onChange={this.onChangeOldStuden.bind(this)}
                    className='dituvan-select-hovaten'
                />
            </div>
        } else {
            xhtml =  
            <div className="divformstyle">
                <div>
                    <label for="Họ Và Tên">Họ Và Tên: </label>
                    <input type="text" name="Họ Và Tên" ref='hovaten'/>
                </div>
            </div>   
        }

        return (
            <div className={style.formstyle}>
                <div className="form_body">
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Thêm Số Điện Thoại</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div>
                                <h2 style={{'margin': '0', 'text-align': 'center'}}>
                                    {title}
                                </h2>
                            </div>
                            <div>
                                <label for="Học Sinh Cũ" >Học Sinh Cũ: </label>
                                <input type="checkbox" name="Học Sinh Cũ" style={{'width': 'auto' }} onChange={this.onChangeHocSinhCu.bind(this)} ref='hocsinhcu'/>
                            </div>
                            <div>
                                <label for="Ngày Lấy Số">Ngày Lấy Số: </label>
                                <input type="date" name="Ngày Lấy Số" ref='ngaylayso'/>
                            </div>
                        </div>
                            {xhtml}
                        <div className="divformstyle">
                            <div>
                                <SoDienThoai getMe={me => this.sodienthoai = me}/>
                            </div>
                            <div>
                                <a>Ghi Chú: </a>
                                <textarea ref="ghichu" rows="4" cols="50" maxLength="1000" style={{'height' : '75px'}}></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
                    </div>
                </div>
                <div className="daithem">
                </div>
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (DiTuVan);
