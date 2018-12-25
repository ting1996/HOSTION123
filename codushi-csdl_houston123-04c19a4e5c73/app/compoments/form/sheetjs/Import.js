import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
import mystyle from './style.css';
var ReactDOM = require('react-dom');
var XLSX = require('xlsx');

import ProgressBar from '../ProgressBar';

class ImportSheets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDrag: false,
            fileName: null,
            file: null,
            count: 0,
            total: 0,
            listFails: [],
            isDisabled: false,
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

    callBackDataFormDatabase (rows, hanhdong, dulieuguive, loi) {
        let query = '';
        let khuvuc = $('.khuvuc').attr('value');
        let tenbang = this.props.menuSelected;
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'sheetjs_import_check':                        
                        if (rows.length > 0) {
                            this.setState({listFails: this.state.listFails.concat({
                                content: dulieuguive.index + ':' + rows.length,
                                data: rows,
                            })});
                        } else {
                            switch (tenbang) {
                                case 'mardatatong':
                                    let row = dulieuguive.data;
                                    query = 'INSERT INTO `DATA_TRUONGTIEMNANG` (`Họ Và Tên`, `Lớp`, `Số Điện Thoại`, `Ngày Sinh`, `Địa Chỉ`, `Họ Và Tên (NT1)`, `Số Điện Thoại (NT1)`, `Nghề Nghiệp (NT1)`, `Họ Và Tên (NT2)`, `Số Điện Thoại (NT2)`, `Nghề Nghiệp (NT2)`, `Tên Trường`, `Nguồn`, `Ngày Nhập`, `Mã Nhân Viên`, `Ghi Chú`, `Cơ Sở`, `isBusy`, `isOLD`, `isDeactivate`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'0\', \'0\', \'0\');'
                                    query = query.replace('!\?!', row['Họ Và Tên']);
                                    query = query.replace('!\?!', row['Lớp']);
                                    query = query.replace('!\?!', row['Số Điện Thoại']);
                                    query = query.replace('!\?!', row['Ngày Sinh']);
                                    query = query.replace('!\?!', row['Địa Chỉ']);
                                    query = query.replace('!\?!', row['Họ Và Tên (NT1)']);
                                    query = query.replace('!\?!', row['Số Điện Thoại (NT1)']);
                                    query = query.replace('!\?!', row['Nghề Nghiệp (NT1)']);
                                    query = query.replace('!\?!', row['Họ Và Tên (NT2)']);
                                    query = query.replace('!\?!', row['Số Điện Thoại (NT2)']);
                                    query = query.replace('!\?!', row['Nghề Nghiệp (NT2)']);
                                    query = query.replace('!\?!', row['Tên Trường']);
                                    query = query.replace('!\?!', row['Nguồn']);
                                    let date = new Date();
                                    query = query.replace('!\?!', date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2));
                                    query = query.replace('!\?!', row['Mã Nhân Viên']);
                                    query = query.replace('!\?!', row['Ghi Chú']);
                                    query = query.replace('!\?!', khuvuc);
                                    query = query.replace(/\''/g, 'null');
                                    query = query.replace(/\'undefined'/g, 'null');

                                    this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                        fn: 'sheetjs_import_import',
                                        ignoringError: true,
                                        index: dulieuguive.index,
                                        query: query,
                                    });                                    
                                    break;
                                default:
                            }
                        }
                        this.setState({count: this.state.count + 1,})
                        break;
                    default:
                }
                
            }
        }

        if (hanhdong == 'loi-cu-phap') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'sheetjs_import_check':                        
                        this.setState({listFails: this.state.listFails.concat({
                            content: dulieuguive.index,
                            query: dulieuguive.query,
                            loi: dulieuguive.loi,
                        })});
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
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.count != this.state.count) {
            try {
                let percent = Math.floor((this.state.count / this.state.total) * 100);
                this.refs.progressbar.value(percent);
            } catch (e) {
                
            }
            if (this.state.count >= this.state.total) {
                this.setState({
                    isDisabled: false,
                })
                let content = 'Có !\?! dữ liệu được nhập vào bảng !\?!!';
                content = content.replace('!\?!', this.state.total - this.state.listFails.length);
                content = content.replace('!\?!', this.state.label);

                this.props.dispatch({
                    type: 'ALERT_NOTIFICATION_ADD',
                    content: content,
                    notifyType: 'information',
                })
                this.close();
            }
        }
    }

    render () {
        let styleform = mystyle.form;
        if (this.state.isDrag) {
            styleform += ' ' + mystyle.is_drag_over;
        }

        let fileName = <span><strong className={mystyle.choose}>Chọn file</strong> hoặc kéo thả vào đây.</span>
        if (this.state.file != null) {
            fileName = <span>{this.state.file.name}</span>
        }

        let status = <i class="fa fa-upload fa-3x" aria-hidden="true"></i>;
        if (this.state.isDisabled) {
            status = <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>;
            fileName = <span>Đang xử lý...</span>
        }
        
        return (
            <div className={style.formstyle}>
                <div className="form_body">
                    <div className="header">
                        <h2>Nhập Dữ Liệu Từ File</h2>
                    </div>
                    <div className="body">
                        <div className="unsetdivformstyle">
                            <div 
                                className={styleform}
                                onDrag={this.onDragFile.bind(this)}
                                onDragStart={this.onDragFile.bind(this)}
                                onDragOver={this.onDragEnterFile.bind(this)}
                                onDragEnter={this.onDragEnterFile.bind(this)}
                                onDragEnd={this.onDragLeaveFile.bind(this)}
                                onDragLeave={this.onDragLeaveFile.bind(this)}
                                onDrop={this.onDropFile.bind(this)}
                            >
                                <div style={{"color": "#0f3c4b70"}}>
                                    {status}<br/>
                                </div>
                                <input className={mystyle.input} type="file" ref="myfile" onChange={this.onChangeFile.bind(this)} disabled={this.state.isDisabled}/><br/>
                                <label for="file" className={mystyle.selectfile} onClick={this.onClickChooseFile.bind(this)} disabled={this.state.isDisabled}>{fileName}</label>
                            </div>
                        </div>
                        <div className="divformstyle">
                            <div>
                                <ProgressBar default={0} ref="progressbar"/>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát" disabled={this.state.isDisabled}/>
                        <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý" disabled={this.state.isDisabled}/>
                    </div>
                </div>
                <div className="daithem">
                </div>
            </div>
        )
    }

    onDragFile (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    onDragEnterFile (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!this.state.isDrag) {
            this.setState({
                isDrag: true,
            })
        }
    }

    onDragLeaveFile (e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.isDrag) {
            this.setState({
                isDrag: false,
            })
        }
    }

    onDropFile (e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            isDrag: false,
        })

        if (!this.state.isDisable) {
            let files = e.dataTransfer.files;
            if (files.length > 1) {
                this.props.dispatch({
                    type: 'ALERT_NOTIFICATION_ADD',
                    content: 'Lưu ý chỉ kéo thả một file duy nhất!',
                    notifyType: 'warning',
                })
            } else {
                if (files[0].name.split('.')[1] != 'xlsx') {
                    this.props.dispatch({
                        type: 'ALERT_NOTIFICATION_ADD',
                        content: 'Chỉ hỗ trợ nhập dữ liệu từ file *.xlsx!',
                        notifyType: 'warning',
                    })
                } else {
                    this.setState({
                        file: files[0],
                    })
                }
            }
        }
    }

    onClickChooseFile () {
        this.refs.myfile.click();
    }

    onChangeFile (e) {
        let files = e.target.files;
        if (files.length > 1) {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Lưu ý chỉ chọn một file duy nhất!',
                notifyType: 'warning',
            })
        } else {
            if (files[0].name.split('.')[1] != 'xlsx') {
                this.props.dispatch({
                    type: 'ALERT_NOTIFICATION_ADD',
                    content: 'Chỉ hỗ trợ nhập dữ liệu từ file *.xlsx!',
                    notifyType: 'warning',
                })
            } else {
                this.setState({
                    file: files[0],
                })
            }
        }
    }
    
    dongy () {
        let tenbang = this.props.menuSelected;
        switch (tenbang) {
            case 'mardatatong':
                let that = this;
                let file = this.state.file;
                if (file != null) {
                    let reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = function(e) {
                        let data = new Uint8Array(e.target.result);
                        let wb = XLSX.read(data, {type:'array'});
                        let total = 0;
                        for (let variable in wb.Sheets) {
                            if (wb.Sheets.hasOwnProperty(variable)) {
                                if (variable == $('.khuvuc').attr('value')) {
                                    let ws = wb.Sheets[variable];
                                    let data_add = XLSX.utils.sheet_to_json(ws);
                                    if (data_add.length > 0) {
                                        total += data_add.length;
                                        that.setState({
                                            total: total,
                                            isDisabled: true,
                                        })
                                        let count = 1;
                                        for (let row of data_add) {
                                            count = count + 1;
                                            switch (tenbang) {
                                                case 'mardatatong':
                                                    that.themmardatatong(row, count);
                                                    break;
                                                default:
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            default:
                this.props.dispatch({
                    type: 'ALERT_NOTIFICATION_ADD',
                    content: 'Hệ thống chưa hỗ trợ nhập file excel cho bảng dữ liệu này!',
                    notifyType: 'warning',
                })
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    themmardatatong (row, index) {
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
            let query = 'SELECT * FROM DATA_TRUONGTIEMNANG ' +
            'WHERE (' + querycheck +  ') ';
    
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn: 'sheetjs_import_check',
                data: row,
                index: index,
            });
        } else {
            this.setState({count: this.state.count + 1,})
        }
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (ImportSheets);
