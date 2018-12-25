import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
var ReactDOM = require('react-dom');

import {Bar, Line, Pie, Chart} from 'react-chartjs-2';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            maxValue: 0,
            date: new Date(),
            chartData: {
                labels: [],
                datasets: [
                    {
                        label: "Tổng số học sinh gọi trong ngày",
                        backgroundColor: "rgba(255, 77, 77, 0.6)",
                        borderColor: "rgba(255, 77, 77, 1)",
                        borderWidth: 1,
                        data: [],
                    },
                    {
                        label: "Cuộc gọi thành công",
                        backgroundColor: "rgba(77, 121, 255, 0.6)",
                        borderColor: "rgba(77, 121, 255, 1)",
                        borderWidth: 1,
                        data: []
                    },
                    {
                        label: "Phụ huynh có nhu cầu",
                        backgroundColor: "rgba(0, 204, 0, 0.6)",
                        borderColor: "rgba(0, 204, 0, 1)",
                        borderWidth: 1,
                        data: []
                    },
                    {
                        label: "Phụ huynh hứa lên trung tâm",
                        backgroundColor: "rgba(255, 153, 51, 0.6)",
                        borderColor: "rgba(255, 153, 51, 1)",
                        borderWidth: 1,
                        data: []
                    },
                    {
                        label: "Phụ huynh đã lên trung tâm",
                        backgroundColor: "rgba(244, 56, 210, 0.6)",
                        borderColor: "rgba(244, 56, 210, 1)",
                        borderWidth: 1,
                        data: []
                    },
                    // {
                    //     label: "Phụ huynh có nhu cầu \n(Tổng tuần: )",
                    //     backgroundColor: "green",
                    //     data: []
                    // },
                    // {
                    //     label: "Phụ huynh hứa lên trung tâm \n(Tổng tuần: )",
                    //     // backgroundColor: "green",
                    //     data: [],
                    //     type: 'line'
                    // },
                ]        
            },
            listNhanVien: [],
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
        let chartData = this.state.chartData;
        let query = '';
        let date = this.state.date;
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'home-homepage-listdanhsachnhanvien': {
                        let labels = [];
                        let manhanvien = '';
                        for (let row of rows) {
                            labels.push(row['Họ Và Tên']);
                            manhanvien += '`Mã Nhân Viên` = \'!\?!\' OR '.replace('!\?!', row['Mã Quản Lý']);
                        }
                        chartData.labels = labels;
                        for (let datashet of chartData.datasets) {
                            datashet.data = [];
                        }
                        if (manhanvien != '') {
                            manhanvien = manhanvien.substring(0, manhanvien.length - ' OR '.length);
                            query = 'SELECT COUNT(tb.`ID-DATA`) AS `totalAmount`, tb.`Mã Nhân Viên`  ' +
                            'FROM (SELECT DISTINCT CALLDATA.`ID-DATA`, CALLDATA.`Mã Nhân Viên` ' +
                            'FROM quanlyhocsinh.CALLDATA ' +
                            'WHERE (!\?!) AND (!\?!)) AS tb ' +
                            'GROUP BY tb.`Mã Nhân Viên`; ';
                            query += 'SELECT COUNT(`ID`) AS `totalAmount`, CALLDATA.`Mã Nhân Viên` FROM quanlyhocsinh.CALLDATA ' +
                            'WHERE (!\?!) ' +
                            'AND (!\?!) ' +
                            'AND `Tình Trạng Cuộc Gọi` = \'Cuộc gọi thành công\' ' +
                            'GROUP BY `Mã Nhân Viên`; ';
                            query += 'SELECT COUNT(`ID`) AS `totalAmount`, CALLDATA.`Mã Nhân Viên` FROM quanlyhocsinh.CALLDATA ' +
                            'WHERE (!\?!) ' +
                            'AND (!\?!) ' +
                            'AND `Tình Trạng Cuộc Gọi` = \'Cuộc gọi thành công\' ' +
                            'AND `Loại Nhu Cầu` = \'Phụ Huynh Có Nhu Cầu\' ' +
                            'GROUP BY `Mã Nhân Viên`; ';
                            query += 'SELECT COUNT(`ID`) AS `totalAmount`, CALLDATA.`Mã Nhân Viên` FROM quanlyhocsinh.CALLDATA ' +
                            'WHERE (!\?!) ' +
                            'AND (!\?!) ' +
                            'AND `Tình Trạng Cuộc Gọi` = \'Cuộc gọi thành công\' ' +
                            'AND `Loại Thái Độ` = \'Phụ Huynh Hẹn Lên Trung Tâm\' ' +
                            'GROUP BY `Mã Nhân Viên`; ';
                            query += 'SELECT COUNT(tb3.`ID-DATA`) AS `totalAmount`, tb3.`Mã Nhân Viên` ' +
                            'FROM ((SELECT tb1.* ' +
                            'FROM (SELECT * FROM CALLDANGKYHANGNGAY WHERE `fromCallDataTong` = \'1\' AND `Tình Trạng Cuộc Gọi` = \'Cuộc gọi thành công\') as tb1 ' +
                            'LEFT OUTER JOIN (SELECT * FROM CALLDANGKYHANGNGAY WHERE `fromCallDataTong` = \'1\' AND `Tình Trạng Cuộc Gọi` = \'Cuộc gọi thành công\') as tb2 ' +
                            'ON tb2.`ID-DATA` = tb1.`ID-DATA` ' +
                            'AND tb2.`ID` > tb1.`ID` ' +
                            'WHERE tb2.`ID` IS NULL) as tb3) ' +
                            'LEFT JOIN (SELECT `ID`, `Ngày Đăng Ký` FROM DATADANGKYHANGNGAY) as tb4 ON tb4.`ID` = tb3.`ID-DATA` ' +
                            'WHERE (!\?!) ' +
                            'AND (!\?!) ' +
                            'GROUP BY tb3.`Mã Nhân Viên`; ';

                            let dang = this.refs.dang.value;
                            let ngaygoi = '';
                            let ngaydangky = '';
                            switch (dang) {
                                case 'ngay': {
                                    ngaygoi = '`Ngày Gọi` LIKE \'%!\?!%\'';
                                    ngaydangky = 'tb4.`Ngày Đăng Ký` LIKE \'%!\?!%\'';
                                    ngaygoi = ngaygoi.replace('!\?!', date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2));
                                    ngaydangky = ngaydangky.replace('!\?!', date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2));
                                } break;
                                case 'tuan': {
                                    let cur = new Date(this.state.date);
                                    let first = cur.getDate() - cur.getDay();
                                    cur.setDate(first);
                                    let firstday = new Date(cur);
                                    cur.setDate(cur.getDate() + 6);
                                    let lastday = new Date(cur);                    
                                    ngaygoi = 
                                    '`Ngày Gọi` >= \'!\?! 00:00:00\' AND `Ngày Gọi` <= \'!\?! 23:59:59\'';
                                    ngaygoi = ngaygoi.replace('!\?!', firstday.getFullYear() + '-' + ("0" + (firstday.getMonth() + 1)).slice(-2) + '-' + ("0" + firstday.getDate()).slice(-2));
                                    ngaygoi = ngaygoi.replace('!\?!', lastday.getFullYear() + '-' + ("0" + (lastday.getMonth() + 1)).slice(-2) + '-' + ("0" + lastday.getDate()).slice(-2));
                                    ngaydangky = 
                                    'tb4.`Ngày Đăng Ký` >= \'!\?!\' AND tb4.`Ngày Đăng Ký` <= \'!\?!\'';
                                    ngaydangky = ngaydangky.replace('!\?!', firstday.getFullYear() + '-' + ("0" + (firstday.getMonth() + 1)).slice(-2) + '-' + ("0" + firstday.getDate()).slice(-2));
                                    ngaydangky = ngaydangky.replace('!\?!', lastday.getFullYear() + '-' + ("0" + (lastday.getMonth() + 1)).slice(-2) + '-' + ("0" + lastday.getDate()).slice(-2));
                                } break;
                                case 'thang': {
                                    let cur2 = new Date(this.state.date);
                                    let firstmonth = new Date(cur2.getFullYear(), cur2.getMonth(), 1);
                                    let lastmonth = new Date(cur2.getFullYear(), cur2.getMonth() + 1, 0);
                                    ngaygoi = 
                                    '`Ngày Gọi` >= \'!\?! 00:00:00\' AND `Ngày Gọi` <= \'!\?! 23:59:59\'';
                                    ngaygoi = ngaygoi.replace('!\?!', firstmonth.getFullYear() + '-' + ("0" + (firstmonth.getMonth() + 1)).slice(-2) + '-' + ("0" + firstmonth.getDate()).slice(-2));
                                    ngaygoi = ngaygoi.replace('!\?!', lastmonth.getFullYear() + '-' + ("0" + (lastmonth.getMonth() + 1)).slice(-2) + '-' + ("0" + lastmonth.getDate()).slice(-2));
                                    ngaydangky = 
                                    'tb4.`Ngày Đăng Ký` >= \'!\?!\' AND tb4.`Ngày Đăng Ký` <= \'!\?!\'';
                                    ngaydangky = ngaydangky.replace('!\?!', firstmonth.getFullYear() + '-' + ("0" + (firstmonth.getMonth() + 1)).slice(-2) + '-' + ("0" + firstmonth.getDate()).slice(-2));
                                    ngaydangky = ngaydangky.replace('!\?!', lastmonth.getFullYear() + '-' + ("0" + (lastmonth.getMonth() + 1)).slice(-2) + '-' + ("0" + lastmonth.getDate()).slice(-2));
                                } break;
                                default:
                                    break;
                            }                            
                            query = query.replace('!\?!', ngaygoi);
                            query = query.replace('!\?!', manhanvien);
                            query = query.replace('!\?!', ngaygoi);
                            query = query.replace('!\?!', manhanvien);
                            query = query.replace('!\?!', ngaygoi);
                            query = query.replace('!\?!', manhanvien);
                            query = query.replace('!\?!', ngaygoi);
                            query = query.replace('!\?!', manhanvien);
                            query = query.replace('!\?!', ngaydangky);
                            query = query.replace('!\?!', manhanvien);
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn : 'home-homepage-countdata',
                            });
                        }

                        this.setState({
                            chartData: chartData,
                            listNhanVien: rows,
                        })
                    } break;
                    case 'home-homepage-countdata': {
                        let listTongSoHocSinhGoiTongNgay = [];
                        let listCuocGoiThanhCong = [];
                        let listPhuHuynhCoNhuCau = [];
                        let listPhuHuynhHenLenTT = [];
                        let listPhuHuynhDaLenTT = [];
                        let max = 0;
                        for (let nhanvien of this.state.listNhanVien) {
                            let score0 = 0;
                            for (let row of rows[0]) {
                                if (row['Mã Nhân Viên'] == nhanvien['Mã Quản Lý']) {
                                    score0 = row['totalAmount'];
                                    break;
                                }
                            }
                            listTongSoHocSinhGoiTongNgay.push(score0);
                            if (score0 > max) {
                                max = score0;
                            }

                            let score1 = 0;
                            for (let row of rows[1]) {
                                if (row['Mã Nhân Viên'] == nhanvien['Mã Quản Lý']) {
                                    score1 = row['totalAmount'];
                                    break;
                                }                                
                            }
                            listCuocGoiThanhCong.push(score1);
                            if (score1 > max) {
                                max = score1;
                            }

                            let score2 = 0;
                            for (let row of rows[2]) {
                                if (row['Mã Nhân Viên'] == nhanvien['Mã Quản Lý']) {
                                    score2 = row['totalAmount'];
                                    break;
                                }
                            }
                            listPhuHuynhCoNhuCau.push(score2);
                            if (score2 > max) {
                                max = score2;
                            }

                            let score3 = 0;
                            for (let row of rows[3]) {
                                if (row['Mã Nhân Viên'] == nhanvien['Mã Quản Lý']) {
                                    score3 = row['totalAmount'];
                                    break;
                                }
                            }
                            listPhuHuynhHenLenTT.push(score3);
                            if (score3 > max) {
                                max = score3;
                            }

                            let score4 = 0;
                            for (let row of rows[4]) {
                                if (row['Mã Nhân Viên'] == nhanvien['Mã Quản Lý']) {
                                    score4 = row['totalAmount'];
                                    break;
                                }
                            }
                            listPhuHuynhDaLenTT.push(score4);
                            if (score4 > max) {
                                max = score4;
                            }
                        }
                        chartData.datasets[0].data = listTongSoHocSinhGoiTongNgay;
                        chartData.datasets[1].data = listCuocGoiThanhCong;
                        chartData.datasets[2].data = listPhuHuynhCoNhuCau;
                        chartData.datasets[3].data = listPhuHuynhHenLenTT;
                        chartData.datasets[4].data = listPhuHuynhDaLenTT;                        
                        this.setState({
                            chartData: chartData,
                            maxValue: max + 1,
                        })
                    } break;
                    default:
                        
                }
                
            }
        }  
    }

    componentDidMount () {
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.load(this.props.branch);
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.branch != null
        && prevProps.branch != this.props.branch) {
            this.load(this.props.branch);
        }

        if (prevState.date != this.state.date) {
            this.load(this.props.branch);
        }
    }

    load (branch) {
        if (branch != null) {
            let date = this.state.date;
            let query = 'SELECT * FROM QUANLY ' +
            'WHERE (`Cơ Sở` = \'!\?!\' OR `Cơ Sở` LIKE \'%!\?!,%\' OR `Cơ Sở` LIKE \'%,!\?!%\' OR `Cơ Sở` = \'ALL\') ' +
            'AND `Ngày Nghỉ` IS NULL ' +
            'AND ( ' +
                'EXISTS(SELECT * FROM CALLDATA WHERE  ' +
                    '(!\?!) ' +
                    'AND QUANLY.`Mã Quản Lý` = CALLDATA.`Mã Nhân Viên` ' +
                ') ' +
                'OR ' +
                'EXISTS( ' +
                    'SELECT tb3.* ' +
                    'FROM ((SELECT tb1.* ' +
                    'FROM (SELECT * FROM CALLDANGKYHANGNGAY WHERE `fromCallDataTong` = \'1\' AND `Tình Trạng Cuộc Gọi` = \'Cuộc gọi thành công\') as tb1 ' +
                    'LEFT OUTER JOIN (SELECT * FROM CALLDANGKYHANGNGAY WHERE `fromCallDataTong` = \'1\' AND `Tình Trạng Cuộc Gọi` = \'Cuộc gọi thành công\') as tb2 ' +
                    'ON tb2.`ID-DATA` = tb1.`ID-DATA` ' +
                    'AND tb2.`ID` > tb1.`ID` ' +
                    'WHERE tb2.`ID` IS NULL) as tb3) ' +
                    'LEFT JOIN (SELECT `ID`, `Ngày Đăng Ký` FROM DATADANGKYHANGNGAY) as tb4 ON tb4.`ID` = tb3.`ID-DATA` ' +
                    'WHERE QUANLY.`Mã Quản Lý` = tb3.`Mã Nhân Viên` ' +
                    'AND (!\?!) ' +
                ') ' +
            '); ';
            query = query.replace('!\?!', branch);
            query = query.replace('!\?!', branch);
            query = query.replace('!\?!', branch);
            let dang = this.refs.dang.value;
            switch (dang) {
                case 'ngay': { 
                    query = query.replace('!\?!', '`Ngày Gọi` LIKE \'%' + date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + '%\'');
                    query = query.replace('!\?!', 'tb4.`Ngày Đăng Ký` LIKE \'%' + date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + '%\'');
                } break;
                case 'tuan': {
                    let cur = new Date(this.state.date);
                    let first = cur.getDate() - cur.getDay();
                    cur.setDate(first);
                    let firstday = new Date(cur);
                    cur.setDate(cur.getDate() + 6);
                    let lastday = new Date(cur);                    
                    let ngaygoi = 
                    '`Ngày Gọi` >= \'!\?! 00:00:00\' AND `Ngày Gọi` <= \'!\?! 23:59:59\'';
                    ngaygoi = ngaygoi.replace('!\?!', firstday.getFullYear() + '-' + ("0" + (firstday.getMonth() + 1)).slice(-2) + '-' + ("0" + firstday.getDate()).slice(-2));
                    ngaygoi = ngaygoi.replace('!\?!', lastday.getFullYear() + '-' + ("0" + (lastday.getMonth() + 1)).slice(-2) + '-' + ("0" + lastday.getDate()).slice(-2));
                    let ngaydangky = 
                    'tb4.`Ngày Đăng Ký` >= \'!\?!\' AND tb4.`Ngày Đăng Ký` <= \'!\?!\'';
                    ngaydangky = ngaydangky.replace('!\?!', firstday.getFullYear() + '-' + ("0" + (firstday.getMonth() + 1)).slice(-2) + '-' + ("0" + firstday.getDate()).slice(-2));
                    ngaydangky = ngaydangky.replace('!\?!', lastday.getFullYear() + '-' + ("0" + (lastday.getMonth() + 1)).slice(-2) + '-' + ("0" + lastday.getDate()).slice(-2));
                    query = query.replace('!\?!', ngaygoi);
                    query = query.replace('!\?!', ngaydangky);
                } break;
                case 'thang': {
                    let cur2 = new Date(this.state.date);
                    let firstmonth = new Date(cur2.getFullYear(), cur2.getMonth(), 1);
                    let lastmonth = new Date(cur2.getFullYear(), cur2.getMonth() + 1, 0);
                    let ngaygoi2 = 
                    '`Ngày Gọi` >= \'!\?! 00:00:00\' AND `Ngày Gọi` <= \'!\?! 23:59:59\'';
                    ngaygoi2 = ngaygoi2.replace('!\?!', firstmonth.getFullYear() + '-' + ("0" + (firstmonth.getMonth() + 1)).slice(-2) + '-' + ("0" + firstmonth.getDate()).slice(-2));
                    ngaygoi2 = ngaygoi2.replace('!\?!', lastmonth.getFullYear() + '-' + ("0" + (lastmonth.getMonth() + 1)).slice(-2) + '-' + ("0" + lastmonth.getDate()).slice(-2));
                    let ngaydangky2 = 
                    'tb4.`Ngày Đăng Ký` >= \'!\?!\' AND tb4.`Ngày Đăng Ký` <= \'!\?!\'';
                    ngaydangky2 = ngaydangky2.replace('!\?!', firstmonth.getFullYear() + '-' + ("0" + (firstmonth.getMonth() + 1)).slice(-2) + '-' + ("0" + firstmonth.getDate()).slice(-2));
                    ngaydangky2 = ngaydangky2.replace('!\?!', lastmonth.getFullYear() + '-' + ("0" + (lastmonth.getMonth() + 1)).slice(-2) + '-' + ("0" + lastmonth.getDate()).slice(-2));
                    query = query.replace('!\?!', ngaygoi2);
                    query = query.replace('!\?!', ngaydangky2);
                } break;
                default:
                    break;
            }
            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                fn : 'home-homepage-listdanhsachnhanvien',
            });
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('home-react'));
    }

    render () {
        let date = new Date();
        if (this.props.branch == null) {
            return <div></div>;
        }
        return (
            <div className={style.body}>
                <div 
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >                    
                    Dạng thống kê: 
                    <div>
                        <select ref="dang" onChange={() => {this.load(this.props.branch);}}>
                            <option value="ngay">Ngày</option>
                            <option value="tuan">Tuần</option>
                            <option value="thang">Tháng</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="date"
                            value={this.state.date.getFullYear() + '-' + ("0" + (this.state.date.getMonth() + 1)).slice(-2) + '-' + ("0" + this.state.date.getDate()).slice(-2)}
                            max={date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2)}
                            onChange={(v) => {
                                let value = v.target.value;
                                if (value != '') {
                                    this.setState({date: new Date(value)});
                                }
                            }}
                        />
                    </div>
                </div>
                <Bar
                    ref="chartjs_bar"
                    data={this.state.chartData}
	                height={350}
                    options={{
                        onClick: this.onClickChart.bind(this),
                        maintainAspectRatio: false,
                        title:{
                            display: true,
                            text: 'Thống kê ngày ?'.replace('?', ("0" + this.state.date.getDate()).slice(-2) + '-' + ("0" + (this.state.date.getMonth() + 1)).slice(-2) + '-' + this.state.date.getFullYear()),
                            fontSize: 16,
                        },
                        legend:{
                            display: true,
                            position:'top',
                        },
                        barValueSpacing: 20,
                        scales: {
                          yAxes: [{
                            ticks: {
                              min: 0,
                              max: this.state.maxValue,
                            }
                          }]
                        }
                    }}
                />
            </div>
        )
    }

    onClickChart (event, element) {
        // console.log(event);
        // console.log(element);

        // let click_elemt = null;
        // for (let elem of element) {
        //     if (event.y <= elem._view.y && event.x <= elem._view.x) {
        //         click_elemt = elem;
        //     }
        // }

        // console.log(click_elemt);

        // var activePoint = this.refs.chartjs_bar[0].getElementAtEvent(event)[0];
        // var data = activePoint._chart.data;
        // var datasetIndex = activePoint._datasetIndex;
        // var label = data.datasets[datasetIndex].label;
        // var value = data.datasets[datasetIndex].data[activePoint._index];
        // console.log(label, value);
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (HomePage);
