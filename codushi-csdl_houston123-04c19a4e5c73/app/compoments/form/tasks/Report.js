import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
import ProgressBar from '../ProgressBar';

class Report extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            percent: 0,
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
                    case 'task_report_loadtask':
                        this.setState({
                            data: rows[0],
                        })
                        break;
                    case 'task_report_readreport':
                        if (rows[0] != null) {
                            this.refs.baocao.value = rows[0]['Content'];
                            this.refs.files.value  = rows[0]['Files']
                            this.setState({
                                percent: rows[0]['mucdohoanthanh'],
                            })
                            this.refs.progressbar.value(rows[0]['mucdohoanthanh']);
                        }
                        break;
                    case 'task_report_successfull':
                        this.close();
                        break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        let query;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        if (this.props.TaskID != null) {
            query = 'SELECT TASKS.*, `QUANLY`.`Họ Và Tên` AS `Người giao việc`, `LOAICONGVIEC`.`ten` AS `Loại công việc` ' +
            'FROM quanlyhocsinh.TASKS ' +
            'LEFT JOIN `QUANLY` ON `QUANLY`.`Mã Quản Lý` = `TASKS`.`From` ' +
            'LEFT JOIN `LOAICONGVIEC` ON `TASKS`.`Level` = `LOAICONGVIEC`.`ma` ' +
            'WHERE TASKS.`ID` = \'!\?!\'';
            query = query.replace('!\?!', this.props.TaskID);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'task_report_loadtask',
            });
        }

        if (this.props.viewID != null) {
            query = 'SELECT * FROM quanlyhocsinh.REPORTTASKS ' +
            'WHERE REPORTTASKS.`ID` = \'!\?!\'';
            query = query.replace('!\?!', this.props.viewID);
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'task_report_readreport',
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    dongy () {
        let fail = false;
        this.refs.baocao.style.borderColor = 'rgb(204, 204, 204)';

        let baocao = this.refs.baocao.value.trim();
        let files = this.refs.files.value.trim();
        let mucdohoanthanh = this.refs.mucdo.value;
        let date = new Date();
        let time = new Date().toLocaleTimeString('en-GB');
        let ngaybaocao = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + ' ' + time;

        if (baocao == '') {
            this.refs.baocao.style.borderColor = 'red';
            fail = true;
        }

        if (!fail) {
            let query = 'INSERT INTO `quanlyhocsinh`.`REPORTTASKS` (`maNhanVien`, `taskID`, `Content`, `Files`, `mucdohoanthanh`, `ngaybaocao`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\'); '
            query = query.replace('!\?!', $('#lable_button_nexttoicon').attr('value'));
            query = query.replace('!\?!', this.props.TaskID);
            query = query.replace('!\?!', baocao);
            query = query.replace('!\?!', files);
            query = query.replace('!\?!', mucdohoanthanh);
            query = query.replace('!\?!', ngaybaocao);            
            query = query.replace(/\'null'/g, 'null');
            query = query.replace(/\''/g, 'null');

            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'task_report_successfull',
                isReload: true,
                isSuccess: true,
                // isReloadNotification: isReloadNotification,
                // listIDsReloadNotification: IDs,
            });
        }
    }

    close () {
        try {
            this.props.close();
        } catch (e) {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        }
    }

    render () {
        let data = this.state.data;
        let _nguoigiaoviec = data['Người giao việc'];
        let btnOK = <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
        let disablebtn = false;
        if (this.props.viewID != null) {
            disablebtn = true;
            btnOK = '';
        }

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width': '700px'}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Báo Cáo Công Việc</h2>
                    </div>
                    <div className="body">
                        <div className="divformstyle">
                            <h2 style={{'margin': '0', 'margin-bottom': '5px'}}>
                                {data['Title']}
                            </h2>
                            <div>
                                {_nguoigiaoviec}
                            </div>
                            <div>
                                <label for="">Nội dung công việc: </label>
                                <textarea 
                                    rows="4" 
                                    cols="50" 
                                    style={{'height' : '200px'}} 
                                    value={data['Content']}
                                    disabled={true}
                                    className="read_only"
                                ></textarea>
                            </div>
                            <div>
                                <label for="">Yêu cầu báo cáo: </label>
                                <textarea 
                                    rows="4" 
                                    cols="50" 
                                    style={{'height' : '60px'}} 
                                    value={data['yeucaubaocao']}
                                    disabled={true}
                                    className="read_only"
                                ></textarea>
                            </div>
                            <div>
                                <label for="">Văn bản chỉ đạo: </label>
                                <a></a>
                            </div>
                            <div style={{
                                'border-top': '3px dashed #888',
                            }}>
                                <label for="">Nội dung báo cáo: </label>
                                <textarea 
                                    ref="baocao"
                                    rows="4" 
                                    cols="50" 
                                    style={{'height' : '200px'}}
                                    disabled={disablebtn}
                                ></textarea>
                            </div>
                            <div>
                                <label for="">Đường dẫn files: </label>
                                <textarea 
                                    ref="files"
                                    rows="4" 
                                    cols="50" 
                                    style={{'height' : '70px'}}
                                    disabled={disablebtn}
                                ></textarea>
                            </div>
                            <div>                                
                                <label for="" >Mức độ hoàn thành công việc: </label>
                                <input
                                    value={this.state.percent}
                                    type="number"
                                    ref="mucdo"
                                    min="0"
                                    max="100"
                                    onChange={this.onChangeRange.bind(this)}
                                    style={{
                                        'width': 'auto',                                        
                                    }}
                                    disabled={disablebtn}
                                />                                    
                                <ProgressBar ref="progressbar"/>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        {btnOK}
                    </div>
                </div>
            </div>
        )
    }

    onChangeRange (e) {
        let val = e.target.value
        if (isNaN(val) || val == '') {
            val = 0;
        } else if (val > 100) {
            val = 100;
        }
        this.setState({
            percent: val,
        })
        this.refs.progressbar.value(val);
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (Report);
