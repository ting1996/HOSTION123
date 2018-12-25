import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import Tien from '../Tien';

let time_countdown2 = 0;
function thongbaothanhcong() {
    $('.successed_function').show();
    if ( time_countdown2 <= 0 ) {
        time_countdown2 = 2;
        var timer2 = setInterval(function() {
            time_countdown2--;
            if (time_countdown2 < 0) {
                clearInterval(timer2);
                $('.successed_function').hide();
            }
        }, 500);
    } else {
        time_countdown2 = 2;
    }
}

class QuanLyMonHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            danhsachquanly: [],
            danhsachmonhoc: [],
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    changeSize () {
        if (window.innerHeight < this.refs.body.offsetHeight) {
            this.refs.background.style.paddingTop = '0px';
        } else {
            this.refs.background.style.paddingTop = ((window.innerHeight - this.refs.body.offsetHeight) / 2) + 'px';
        }
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
                    case 'quanlymonhoc_laydanhsachmonhoc':                    
                        this.setState({
                            danhsachmonhoc: rows,
                        })
                        break;
                    case 'quanlymonhoc_laydanhsachquanly':
                        this.setState({
                            danhsachquanly: rows,
                        })
                        break;
                    case 'quanlymonhoc_themmonhoc':
                        let query;
                        let mamon = dulieuguive.mamon;
                        let tenmon = dulieuguive.tenmon;
                        let loaiquanly = dulieuguive.loaiquanly;
                        let coso = dulieuguive.coso;
                        switch (dulieuguive.step) {
                            case 1:
                                query = 'ALTER TABLE `quanlyhocsinh`.`DANGKIMONHOC` ADD COLUMN `?` TINYINT(4) NULL DEFAULT \'0\'';
                                query = query.replace('?', mamon);
                                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                                    fn: 'quanlymonhoc_themmonhoc',
                                    step: 2,
                                    mamon: mamon,
                                    tenmon: tenmon,
                                    loaiquanly: loaiquanly,
                                });
                                break;
                            case 2:
                                query = 'SELECT * FROM quanlyhocsinh.COSO';
                                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                                    fn: 'quanlymonhoc_themmonhoc',
                                    step: 3,
                                    mamon: mamon,
                                    tenmon: tenmon,
                                    loaiquanly: loaiquanly,
                                });
                                break;
                            case 3:
                                for (var v of rows) {
                                    query = 'Drop TRIGGER quanlyhocsinh.tg_danhsachhocsinhtronglop_?_them';
                                    query = query.replace('?', v['Cơ Sở'].toLowerCase());
                                    this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                                        fn: 'quanlymonhoc_themmonhoc',
                                        step: 4,
                                        mamon: mamon,
                                        tenmon: tenmon,
                                        loaiquanly: loaiquanly,
                                        coso: v['Cơ Sở'],
                                        ignoringError: true,
                                    });
                                }
                                break;
                            case 4:
                                let str = 'WHEN a = \'?\' THEN BEGIN UPDATE quanlyhocsinh.DANGKIMONHOC SET `?` = \'0\' WHERE `User ID`= NEW.`User ID`; END; ';
                                let cmt = '';
                                cmt += str.replace(/\?/g, mamon);
                                this.state.danhsachmonhoc.map( (e, i) => {
                                    cmt += str.replace(/\?/g, e['Mã Môn Học']);
                                })

                                query = 'CREATE TRIGGER quanlyhocsinh.tg_danhsachhocsinhtronglop_?_them '+
                                'BEFORE INSERT ON quanlyhocsinh.DANHSACHHOCSINHTRONGLOP_? '+
                                'FOR EACH ROW '+
                                'BEGIN '+
                                'DECLARE a VARCHAR(5) DEFAULT \'0\'; '+
                                'SET SQL_SAFE_UPDATES = 0; '+
                                'SET a = (SELECT `Mã Môn Học` FROM quanlyhocsinh.LOPHOC_? WHERE `Mã Lớp` = NEW.`Mã Lớp`); '+
                                'SET a = LEFT(a, 2); '+
                                'CASE '+
                                cmt +
                                'END CASE; '+
                                'END';
                                query = query.replace('?', coso.toLowerCase());
                                query = query.replace('?', coso);
                                query = query.replace('?', coso);
                                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                                    fn: 'quanlymonhoc_themmonhoc',
                                    step: 5,
                                });
                                break;
                            case 5:
                                query = 'SELECT * FROM quanlyhocsinh.MONHOC';
                                this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                                    fn: 'quanlymonhoc_laydanhsachmonhoc' 
                                });
                                thongbaothanhcong();
                                this.refs.mamon.value = null;
                                this.refs.tenmon.value = null;
                                this.refs.btnthem.disabled = false;
                                break;
                            default:                                
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    componentDidMount () {
        var query;
        var that = this;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        query = 'SELECT * FROM quanlyhocsinh.MONHOC_!\?!';
        query = query.replace('!\?!', $('.khuvuc').attr('value'));
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
            fn: 'quanlymonhoc_laydanhsachmonhoc'
        });
        query = 'SELECT * FROM quanlyhocsinh.LOAIQUANLY WHERE `Loại Quản Lý` LIKE \'%Bộ Môn%\'';
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'quanlymonhoc_laydanhsachquanly'
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }
    
    onChange () {
        this.refs.mamon.value = this.refs.mamon.value.toUpperCase();
    }

    them () {
        let isFail = false;

        let ma_mon = this.refs.mamon.value.replace(/ /g, '');
        if ( ma_mon == '' ) {
            this.refs.mamon.style.borderColor = 'red';
            isFail = true;
        } else if (ma_mon.length < 2) {
            this.refs.mamon.style.borderColor = 'red';
            isFail = true;
        } else if (true) {
            this.refs.mamon.style.borderColor = 'rgb(204, 204, 204)';
            for (let value of this.state.danhsachmonhoc) {
                if (value['Mã Môn Học'] == ma_mon)
                {
                    isFail = true;
                    this.refs.mamon.style.borderColor = 'red';
                    break;
                }
            }
        }

        let ten_mon = this.refs.tenmon.value.replace(/ /g, '')
        if ( ten_mon == '' ) {
            isFail = true;
        }
        
        if (!isFail) {
            let query = 'INSERT INTO `quanlyhocsinh`.`MONHOC` (`Mã Môn Học`, `Tên Môn`, `Quản Lý`) VALUES (\'?\', \'?\', \'?\')';
            query = query.replace('?', this.refs.mamon.value);
            query = query.replace('?', this.refs.tenmon.value);
            query = query.replace('?', this.refs.loaiquanly.value);
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                fn: 'quanlymonhoc_themmonhoc',
                step: 1,
                mamon: this.refs.mamon.value,
                tenmon: this.refs.tenmon.value,
                loaiquanly: this.refs.loaiquanly.value,
            });
            this.refs.btnthem.disabled = true;
        } else {
            if (ten_mon == '') {
                this.refs.tenmon.style.borderColor = 'red';
            } else {
                this.refs.tenmon.style.borderColor = 'rgb(204, 204, 204)';
            }
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        var that = this;
        var xhtml =
        <div style={{
            'height': '500px',
            'overflow-y': 'scroll',
            'overflow-x': 'hidden',
            'padding': '0',
        }}>
            {this.state.danhsachmonhoc.map((e, i) => {
                let pricesList = e['Bảng Giá'].split(',');
                let _price = null;
                if (pricesList != null) {
                    _price = pricesList.map((val, ind) => {
                        let _val = val.split(':')[0];
                        return (
                            <Tien
                                label={'Giá ' + (ind + 1) + ':'}
                                value={_val}
                                spacechar={'.'}
                                canInput={true}
                                style={{
                                    'padding': '0',
                                }}
                            />
                        )
                    })
                }

                return (                    
                    <div key={i} style={{
                        'border-bottom': '3px dashed #888',
                        'padding': '0',
                    }}>
                        <div>
                            {e['Mã Môn Học'] + ' - ' + e['Tên Môn']}
                        </div>
                        <div>
                            {e['Quản Lý']}
                        </div>
                        <div style={{
                            'background': 'lightseagreen',
                        }}>
                            {_price}
                        </div>
                    </div>
                )
            })}           
        </div>

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body">
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Quản Lý Môn Học</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div style={{
                                'padding': '0',
                            }}>
                                {xhtml}
                            </div>
                            {/* Thêm môn:
                            <input 
                                type="text" 
                                maxlength="2" 
                                ref="mamon" 
                                onChange={this.onChange.bind(this)}
                                style={{
                                    "width":"50px",
                                }}
                            />
                            <input 
                                type="text" 
                                maxlength="100" 
                                ref="tenmon"
                                style={{
                                    "width":"175px",
                                }}
                            />
                            <select 
                                ref="loaiquanly"
                                style={{
                                    "width":"175px",
                                }}
                            > 
                                {this.state.danhsachquanly.map( (e, i) => 
                                    <option key={i}>{e["Loại Quản Lý"]}</option>
                                )}
                            </select>
                            <button type="button" onClick={this.them.bind(this)} ref="btnthem">Thêm</button>  */}
                        </div>
                    </div>
                    <div className="footer">
                        {/* <input style={{
                            'right': '105px',
                        }} type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/> */}
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
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
  }) (QuanLyMonHoc);
