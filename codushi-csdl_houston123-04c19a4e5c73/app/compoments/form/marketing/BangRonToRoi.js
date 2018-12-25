import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
import mystyle from './style.css';
import GoogleMap from './GoogleMap';
const ReactDOM = require('react-dom');
import Select from 'react-select';

class DangKyMonHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: null,
            danhsachtruonghoc: [],
            oldlocation: null,
            oldvalue: [],
            truonghoc: null,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'bangrontoroi_loadtruonghoc':
                        let danhsachtruonghoc = [];
                        let truonghoc = null;
                        for (let val of rows) {
                            val['value'] = val['Tên Trường'];
                            val['label'] = val['Tên Trường'];
                            danhsachtruonghoc.push(val);
                            if (this.props.action == 'edit' && val['Tên Trường'] == this.props.data['Trường']) {
                                truonghoc = val;
                                if (val['Địa Điểm'] != null && val['Địa Điểm'] != '') {
                                    this.setState({oldlocation: val['Địa Điểm']});
                                }
                            }
                        }
                        this.setState({
                            danhsachtruonghoc: danhsachtruonghoc,
                            truonghoc: truonghoc,
                        });
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
        this.refs.ngaythuchien.value = now[2] + '-' + now[1] + '-' + now[0];
        this.setState({title: this.props.title})

        query = 'SELECT * FROM quanlyhocsinh.TRUONGTIEMNANG WHERE `Cơ Sở` LIKE \'%' + $('.khuvuc').attr('value') + '%\' OR `Cơ Sở` LIKE \'%ALL%\'';
        this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'bangrontoroi_loadtruonghoc',
        });

        if (this.props.action == 'edit') {
            let rows = this.props.data;
            this.setState({oldvalue: rows});
            let date = (new Date(rows['Ngày Thực Hiện'])).toLocaleDateString('en-GB').split('/');
            this.refs.ngaythuchien.value = date[2] + '-' + date[1] + '-' + date[0];
            this.refs.soluong.value = rows['Số Lượng'];
            if (rows['Địa Điểm'] != null && rows['Địa Điểm'] != '') {
                this.setState({oldlocation: rows['Địa Điểm']});
            }
        }
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    onChangeTruongHoc (e) {
        this.setState({truonghoc: e});

        if (e != null && e['Địa Điểm'] != null && e['Địa Điểm'] != '') {
            let location = e['Địa Điểm'].split(' ');
            let lat = Number(location[0]);
            let lng = Number(location[1]);
            this.googlemap.setPlace(lat, lng);
        }
    }

    dongy () {
        let checkfail = false;
        let ngaythuchien = this.refs.ngaythuchien.value;
        let truonghoc = '';
        if (this.state.truonghoc != null) {
            truonghoc = this.state.truonghoc.value;
        }        
        let soluong = this.refs.soluong.value;
        let local = this.googlemap;
        let diadiem = local.state.lat + ' ' + local.state.long;
        
        this.refs.ngaythuchien.style.borderColor = 'rgb(204, 204, 204)';
        if (ngaythuchien == '') {
            this.refs.ngaythuchien.style.borderColor = 'red';
            checkfail = true;
        }

        this.refs.soluong.style.borderColor = 'rgb(204, 204, 204)';
        if (soluong == '') {
            this.refs.soluong.style.borderColor = 'red';
            checkfail = true;
        }

        if (checkfail) {
            return;
        } else if (this.props.action == 'add') {
            let query = 'ALTER TABLE `quanlyhocsinh`.`BANGRONTOROI` AUTO_INCREMENT = 1; ' +
            'INSERT INTO `quanlyhocsinh`.`BANGRONTOROI` (`Loại`, `Mã Nhân Viên`, `Ngày Thực Hiện`, `Số Lượng`, `Trường`, `Địa Điểm`, `Cơ Sở`) VALUES (\'?\', \'?\', \'?\', \'?\', \'?\', \'?\', \'?\')';
            query = query.replace('?', this.props.type);
            query = query.replace('?', $('#lable_button_nexttoicon').attr('value'));
            query = query.replace('?', ngaythuchien);
            query = query.replace('?', soluong);        
            if (truonghoc != '') {
                query = query.replace('?', truonghoc);
                query = query.replace('\'?\'', 'null');
            } else {
                query = query.replace('\'?\'', 'null');
                query = query.replace('?', diadiem);
            }
            query = query.replace('?', $('.khuvuc').attr('value'));
            this.props.socket.emit('gui-query-den-database', query, 'them', {
                isReload: true
            });
        } else if (this.props.action == 'edit' && this.props.data != null) {
            let query = 'UPDATE `quanlyhocsinh`.`BANGRONTOROI` SET ~ WHERE `ID`=\'?\' AND `Mã Nhân Viên` =\'?\'';
            query = query.replace('?', this.props.data['ID']);
            query = query.replace('?', this.props.data['Mã Nhân Viên']);
            
            if (ngaythuchien != this.state.oldvalue['Ngày Thực Hiện']) {
                let add = '`Ngày Thực Hiện`=\'?\', ~'.replace('?', ngaythuchien);
                query = query.replace('~', add);
            }

            if (soluong != this.state.oldvalue['Số Lượng']) {
                let add = '`Số Lượng`=\'?\', ~'.replace('?', soluong);
                query = query.replace('~', add);
            }
             
            if (truonghoc != this.state.oldvalue['Trường'] && truonghoc != '') {
                let add = '`Trường`=\'?\', ~'.replace('?', truonghoc);
                query = query.replace('~', add);
                add = '`Địa Điểm`= null, ~';
                query = query.replace('~', add);
            } else if (diadiem != this.state.oldvalue['Địa Điểm']) {
                let add = '`Địa Điểm`=\'?\', ~'.replace('?', diadiem);
                query = query.replace('~', add);
                add = '`Trường`= null, ~';
                query = query.replace('~', add);
            }
            query = query.replace(', ~', '');

            this.props.socket.emit('gui-query-den-database', query, 'sua', {
                isReload: true
            });
        } else {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Không thể xác định được hành động!',
                notifyType: 'warning',
            })
        }

        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = '';
        title = $('#lable_button_nexttoicon').attr('value') + ' - ' + $('#lable_button_nexttoicon')[0].innerText;

        return (
            <div className={style.formstyle}>
                <div className="form_body" style={{'width': '1100px'}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>{this.state.title}</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div>
                                <h2 style={{'margin': '0', 'text-align': 'center'}}>
                                    {title}
                                </h2>
                            </div>
                            <div>
                                <label for="Ngày Thực Hiện">Ngày Thực Hiện: </label>
                                <input type="date" name="Ngày Thực Hiện" ref='ngaythuchien'/>
                            </div>
                        </div>
                            <div className="unsetdivformstyle">
                                <label for="Trường Học">Trường Học: </label>
                                <Select
                                    name="Trường Học"
                                    placeholder="--- Chọn Trường Phát Tờ Rơi Nếu Có ---"
                                    value={this.state.truonghoc}
                                    options={this.state.danhsachtruonghoc}
                                    onChange={this.onChangeTruongHoc.bind(this)}
                                />
                            </div>
                        <div className="divformstyle">
                            <div>
                                <label for="Số Lượng">Số Lượng: </label>
                                <input type="number" name="Số Lượng" ref="soluong"/>
                            </div>
                        </div>
                        <div>
                            <input className={mystyle.mapsearch} id="googleapi-search-input" type="text" name="" ref='search'/>
                            <GoogleMap getMe={me => this.googlemap = me} oldlocation={this.state.oldlocation}/>
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
}) (DangKyMonHoc)

