import React from 'react';
import { connect } from 'react-redux';
import style from '../../style.css';
var ReactDOM = require('react-dom');

class SpecialTools extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
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
        let query = '';
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'specialtools_setalluser':
                        $('.loading2').show();
                        for (let val of rows) {
                            query = 'UPDATE `quanlyhocsinh`.`DANGKIMONHOC` SET ~ WHERE `User ID`=\'?\'';
                            query = query.replace('?', val['User ID']);
                            for (let key in val) {
                                if (key != 'User ID') {
                                    query = query.replace('~', '`' + key + '` = 1, ~');
                                }
                            }
                            query = query.replace(', ~', '');
                            this.props.socket.emit('gui-query-den-database', query, 'them', {isReload: false});
                        }
                        $('.loading2').hide();
                        break;
                    case 'specialtools_loctrung_count':
                        let length = rows[0].count
                        for (var i = 26001; i <= length; i++) {
                            query = 'SELECT * FROM quanlyhocsinh.DATA_TRUONGTIEMNANG WHERE `ID` = \'!\?!\''.replace('!\?!', i);
                            this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn : 'specialtools_loctrung_check',
                            });
                        }
                        break;
                    case 'specialtools_loctrung_check':
                        this.themdulieutruongtiemnang (rows[0])
                        break;
                    case 'specialtools_loctrung_checked':
                        if (rows != null && rows.length > 0) {
                            for (let row of rows) {
                                query = 'SELECT * FROM quanlyhocsinh.CALLDATA WHERE `ID-DATA` = \'!\?!\';'.replace('!\?!', row['ID']);
                                this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                                    fn: 'specialtools_loctrung_deleteifnotexists',
                                    index: row['ID'],
                                    parentIndex: dulieuguive.index,
                                });
                            }
                        }
                        break;
                    case 'specialtools_loctrung_deleteifnotexists':
                        if (rows == null || rows.length <= 0) {
                            query = 'DELETE FROM `quanlyhocsinh`.`DATA_TRUONGTIEMNANG` WHERE `ID` = \'!\?!\''.replace('!\?!', dulieuguive.index);
                            this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                            });
                            console.log(dulieuguive.index);
                        } else {
                            query = 'DELETE FROM `quanlyhocsinh`.`DATA_TRUONGTIEMNANG` WHERE `ID` = \'!\?!\''.replace('!\?!', dulieuguive.parentIndex);
                            this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                            });
                            console.log(dulieuguive.parentIndex);
                        }
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    themdulieutruongtiemnang (row) {
        if (row != null) {
            let querycheck = '';
            let sodienthoai = row['Số Điện Thoại'];
            if (sodienthoai != null && sodienthoai != '' && sodienthoai.length >= 8) {
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoai);
                if (sodienthoai[0] == '0') {
                    querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoai.substring(1, sodienthoai.length));;
                }
            }
    
            let sodienthoaint1 = row['Số Điện Thoại (NT1)'];
            if (sodienthoaint1 != null && sodienthoaint1 != '' && sodienthoaint1.length >= 8) {
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint1);
                if (sodienthoaint1[0] == '0') {
                    querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint1.substring(1, sodienthoaint1.length));;
                }
            }
    
            let sodienthoaint2 = row['Số Điện Thoại (NT2)'];
            if (sodienthoaint2 != null && sodienthoaint2 != '' && sodienthoaint2.length >= 8) {
                querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint2);
                if (sodienthoaint2[0] == '0') {
                    querycheck += '`Số Điện Thoại` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT1)` LIKE \'%!\?!%\' OR `Số Điện Thoại (NT2)` LIKE \'%!\?!%\' OR '.replace(/\!\?!/g, sodienthoaint2.substring(1, sodienthoaint2.length));;
                }
            }
                    
            if (querycheck != '') {
                querycheck = querycheck.substring(0, querycheck.length - ' OR '.length);
                let query = 'SELECT * FROM quanlyhocsinh.DATA_TRUONGTIEMNANG ' +
                'WHERE (' + querycheck +  ') AND `Họ Và Tên` = \'!\?!\' AND `ID` != \'!\?!\'';
                query = query.replace('!\?!', row['Họ Và Tên']);
                query = query.replace('!\?!', row['ID']);
        
                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                    fn: 'specialtools_loctrung_checked',
                    index: row['ID'],
                });
            }
        }
    }

    componentDidMount () {
        let query;
        let that = this;
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    dangkyall () {
        let query = 'SELECT * FROM quanlyhocsinh.DANGKIMONHOC';
        this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'specialtools_setalluser',
        });
    }

    loctrungdatatong () {
        let query = 'SELECT COUNT(*) AS count FROM quanlyhocsinh.DATA_TRUONGTIEMNANG';
        this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'specialtools_loctrung_count',
        });
    }

    dongy () {

    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div className={style.formstyle}>
                <div className="form_body">
                    <div className="header">
                        <h2>Special Tools</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <div>
                                <input type="submit" name="Đăng ký môn học tất cả học sinh" value="Đăng ký môn học tất cả học sinh" onClick={this.dangkyall.bind(this)}/>
                            </div>
                            <div>
                                <input type="submit" name="Lọc Trùng DATA Tổng" value="Lọc Trùng DATA Tổng" onClick={this.loctrungdatatong.bind(this)}/>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        {/* <input style={{
                            'right': '105px',
                        }} type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/> */}
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
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
  }) (SpecialTools);
