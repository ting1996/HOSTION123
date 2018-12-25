import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';
var ReactDOM = require('react-dom');
var XLSX = require('xlsx');

function Noofmonths(date1, date2) {
    var Nomonths;
    Nomonths= (date2.getFullYear() - date1.getFullYear()) * 12;
    Nomonths-= date1.getMonth() + 1;
    Nomonths+= date2.getMonth() +1; // we should add + 1 to get correct month number
    return Nomonths <= 0 ? 0 : Nomonths;
}

function lamtron (number) {
    let phanngan = Math.floor(number / 1000) * 1000;
    let phandu = number - phanngan;

    if (phandu >= 500) {
        phanngan = phanngan + 1000;
    }

    return phanngan;
}
class Export extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            column: [],
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);        
    }

    callBackDataFormDatabase ( rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'sheetjs-xuatexcels-getdata':                                        
                        if (rows.length <= 0) {
                            this.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Không có dữ liệu để xuất tệp!',
                                notifyType: 'warning',
                            })
                            return;
                        }

                        let wb = XLSX.utils.book_new();
                        wb.Props = {
                            Title: 'Houston123',
                            Subject: 'Houston123',
                            Author: 'https://www.houston123.edu.vn',
                            CreateDate: new Date(),
                        }

                        let ws_data = [];
                        let header = [];                        
                        if (dulieuguive.tablename == null) {
                            wb.SheetNames.push(this.props.tablename);
                            for (let val in rows[0]) {
                                header.push(val)
                            }
                            ws_data.push(header);
                            for (let value of rows) {
                                let row = [];                            
                                switch (this.props.menuSelected) {
                                    case 'hoadon':
                                    case 'hoadonhuy': {
                                        let _hdcontent = value['Nội Dung'];
                                        let monhoc = [];
                                        if (value['Nội Dung'].startsWith('@@@')) {
                                            _hdcontent = _hdcontent.substr(3, _hdcontent.length);
                                            _hdcontent = _hdcontent.split(',');
                                            for (let content of _hdcontent) {
                                                if (content != '') {
                                                    content = content.split(':');
                                                    this.props.moreTablesInfo.chuongtrinhkhac.map(v => {
                                                        if (v.id == content[0]) {
                                                            monhoc.push(v.name);
                                                        }
                                                    })
                                                }
                                            }
                                        } else {
                                            _hdcontent = _hdcontent.split(',');
                                            for (let content of _hdcontent) {
                                                if (content != '') {
                                                    content = content.split(':');
                                                    if (content[3] != null) {
                                                        this.props.moreTablesInfo.chuongtrinhhocbosung.map(v => {
                                                            if (v.ID == content[3] && monhoc.indexOf(v['Tên Chương Trình']) == -1) {
                                                                monhoc.push(v['Tên Chương Trình']);
                                                            }
                                                        })                                                
                                                    } else {
                                                        this.props.moreTablesInfo.danhsachmonhoc.map(v => {
                                                            if (v.mamon == content[0]) {
                                                                monhoc.push(v.name);
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                        value['Nội Dung'] = monhoc.join(', ');
                                    } break;
                                    case 'hocsinh':
                                    case 'hocsinhnghi': {
                                        if (value['Môn Học Đã Đăng Ký'] != null) {
                                            let monhoc = [];
                                            let list = JSON.parse(value['Môn Học Đã Đăng Ký']);
                                            if (list != null) {
                                                for (let key in list) {
                                                    if (list.hasOwnProperty(key)) {
                                                        let mh = list[key];
                                                        if (mh.idchuongtrinhhoc != null) {
                                                            this.props.moreTablesInfo.chuongtrinhhocbosung.map(v => {
                                                                if (v.ID == mh.idchuongtrinhhoc) {
                                                                    mh.name = v['Tên Chương Trình'];
                                                                }
                                                            })
                                                        }
                
                                                        if (mh.idchuongtrinhhoc != null && mh.trongoi == true) {
                                                            if (monhoc.indexOf(mh.name) == -1) {
                                                                monhoc.push(mh.name);
                                                            }
                                                        } else {
                                                            this.props.moreTablesInfo.danhsachmonhoc.map(v => {
                                                                if (mh.idchuongtrinhhoc != null) {
                                                                    if (v.mamon == mh.mamon && monhoc.indexOf(v.name + ' (' + mh.name + ')') == -1) {
                                                                        monhoc.push(v.name + ' (' + mh.name + ')');
                                                                    }
                                                                } else {
                                                                    if (v.mamon == mh.mamon && monhoc.indexOf(v.name) == -1) {
                                                                        monhoc.push(v.name);
                                                                    }
                                                                }                                                
                                                            })
                                                        }
                                                    }
                                                }
                                            };
                                            value['Môn Học Đã Đăng Ký'] = monhoc.join(', ');
                                        }
                                    } break;
                                    default:
                                }
                                for (let val in value) {
                                    if (value.hasOwnProperty(val)) {
                                        if (val != null && val.indexOf('Ngày') == 0) {
                                            if (value[val] != null && value[val] != '') {
                                                let date = new Date(value[val]); 
                                                value[val] = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
                                            }
                                        }
                                        row.push(value[val]);
                                    }
                                }
                                ws_data.push(row);
                            }
                        } else {
                            wb.SheetNames.push(dulieuguive.tablename);
                            switch (dulieuguive.table) {
                                case 'lophoc_bangdiem': {
                                    let bangdiem = {}                                    
                                    for (let d of rows[0]) {
                                        if (bangdiem[d['User ID']] == null) {
                                            bangdiem[d['User ID']] = {};
                                        }
                                        let temp = bangdiem[d['User ID']];
                                        temp['User ID'] = d['User ID'];
                                        temp['Họ Và Tên'] = d['Họ Và Tên'];
                                        temp['Lớp'] = d['Lớp'];
                                        if (temp.score == null) {
                                            temp.score = {};
                                        }
                                        if (temp.score[d['subject']] == null) {
                                            temp.score[d['subject']] = {};
                                        }
                                        try {
                                            let score = JSON.parse(d.score);
                                            if (!Array.isArray(score.thucte)) {
                                                score.thucte = [{d: score.thucte}]
                                            }
                                            if (temp.score[d['subject']].thucte == null) {
                                                temp.score[d['subject']].thucte = score.thucte; 
                                            } else {
                                                temp.score[d['subject']].thucte = temp.score[d['subject']].thucte.concat(score.thucte);
                                            }
                                            if (temp.score[d['subject']].chitieu == null) {
                                                temp.score[d['subject']].chitieu = score.chitieu; 
                                            } else {
                                                temp.score[d['subject']].chitieu += ', ' + score.chitieu; 
                                            }
                                        } catch (error) {
                                            
                                        }
                                        try {
                                            let tempcontent = d.content
                                            tempcontent = tempcontent.replace(/\n/g, '\\n');
                                            tempcontent = tempcontent.replace(/\r/g, '\\r');
                                            tempcontent = JSON.parse(tempcontent);
                                            if (temp.score[d['subject']].nhanxet == null) {
                                                temp.score[d['subject']].nhanxet = tempcontent.nhanxet; 
                                            } else {
                                                temp.score[d['subject']].nhanxet += ', ' + tempcontent.nhanxet; 
                                            }
                                            if (temp.score[d['subject']].giaiphap == null) {
                                                temp.score[d['subject']].giaiphap = tempcontent.giaiphap; 
                                            } else {
                                                temp.score[d['subject']].giaiphap += ', ' + tempcontent.giaiphap; 
                                            }
                                        } catch (error) {
                                        }
                                        
                                        // console.log(temp);
                                    }
                                    
                                    header.push('User ID');
                                    header.push('Họ Và Tên');
                                    header.push('Lớp');
                                    for (let i of rows[1]) {
                                        if (i.scoreType == 1) {
                                            header.push('Nhận xét định kỳ _ ' + i.name);
                                            header.push('Nghe (chữ) _ ' + i.name);
                                            header.push('Nói (chữ) _ ' + i.name);
                                            header.push('Đọc (chữ) _ ' + i.name);
                                            header.push('Viết (chữ) _ ' + i.name);
                                        } else {
                                            header.push('Nhận xét định kỳ _ ' + i.name);
                                            header.push('Điểm (chữ) _ ' + i.name);
                                        }
                                    }                                    
                                    ws_data.push(header);

                                    for (let key in bangdiem) {
                                        if (bangdiem.hasOwnProperty(key)) {
                                            let element = bangdiem[key];
                                            let row = [];
                                            row.push(element['User ID']);
                                            row.push(element['Họ Và Tên']);                                            
                                            row.push(element['Lớp']);
                                            for (let i of rows[1]) {
                                                let score = element.score[i.mamon];
                                                if (i.scoreType == 1) {
                                                    if (score == null) {
                                                        row.push('');
                                                        row.push('');
                                                        row.push('');
                                                        row.push('');
                                                        row.push('');
                                                    } else {
                                                        row.push(score.nhanxet);                                                        
                                                        for (let i2 = 0; i2 < 4; i2++) {
                                                            try {
                                                                let d = score.thucte[i2].d;
                                                                if (!isNaN(d)) {
                                                                    switch (true) {
                                                                        case d >= 9:
                                                                            d = 'A'
                                                                            break;
                                                                        case d < 9 && d >= 7:
                                                                            d = 'B'
                                                                            break;
                                                                        case d < 7 && d >= 5:
                                                                            d = 'C'
                                                                            break;
                                                                        case d < 5:
                                                                            d = 'F'
                                                                            break;
                                                                    }
                                                                }
                                                                row.push(d);
                                                            } catch (error) {
                                                                row.push('');
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    if (score == null) {
                                                        row.push('');
                                                        row.push('');
                                                    } else {
                                                        let diem;
                                                        row.push(score.nhanxet);                                                        
                                                        diem = '';
                                                        for (let i2 of score.thucte) {
                                                            let d = i2.d;
                                                            if (!isNaN(d)) {
                                                                switch (true) {
                                                                    case d >= 9:
                                                                        d = 'A'
                                                                        break;
                                                                    case d < 9 && d >= 7:
                                                                        d = 'B'
                                                                        break;
                                                                    case d < 7 && d >= 5:
                                                                        d = 'C'
                                                                        break;
                                                                    case d < 5:
                                                                        d = 'F'
                                                                        break;
                                                                }
                                                                diem += d + ', ';
                                                            }
                                                        }
                                                        row.push(diem);
                                                    }
                                                }
                                            }
                                            ws_data.push(row);
                                        }
                                    }
                                } break;                                
                                case 'hoadon_nohocphi': {
                                    for (let key in rows[0]) {
                                        header.push(key);
                                    }
                                    ws_data.push(header);
                                    
                                    for (let value of rows) {
                                        let hoadon = [];
                                        this.props.data[1].map(v => {
                                            if (v['User ID'] == value['User ID']) {
                                                hoadon.push(v);
                                            }
                                        });
                                        hoadon.sort((a, b) => {
                                            a = new Date(a['Cuối Chu Kỳ']);
                                            b = new Date(b['Cuối Chu Kỳ']);
                                            if (a > b) {
                                                return -1;
                                            }
                                            if (a < b) {
                                                return 1;
                                            }
                                            return 0;                                
                                        });                           
                                        
                                        let monhoc = [];
                                        let list = JSON.parse(value['Môn Học Đã Đăng Ký']);
                                        let monhocdadangky = [];
                                        if (list != null) {
                                            for (let key in list) {
                                                if (list.hasOwnProperty(key)) {
                                                    let mh = list[key];
                                                    if (mh.idchuongtrinhhoc != null) {
                                                        this.props.moreTablesInfo.chuongtrinhhocbosung.map(v => {
                                                            if (v.ID == mh.idchuongtrinhhoc) {
                                                                mh.name = v['Tên Chương Trình'];
                                                            }
                                                        })
                                                    }

                                                    if (mh.idchuongtrinhhoc != null && mh.trongoi == true) {
                                                        if (monhoc.indexOf(mh.name) == -1) {
                                                            monhoc.push(mh.name);
                                                            monhocdadangky.push(mh.idchuongtrinhhoc.toString());
                                                        }
                                                    } else {
                                                        this.props.moreTablesInfo.danhsachmonhoc.map(v => {
                                                            if (mh.idchuongtrinhhoc != null) {
                                                                if (v.mamon == mh.mamon && monhoc.indexOf(v.name + ' (' + mh.name + ')') == -1) {
                                                                    monhoc.push(v.name + ' (' + mh.name + ')');
                                                                    monhocdadangky.push(mh.mamon);
                                                                }
                                                            } else {
                                                                if (v.mamon == mh.mamon && monhoc.indexOf(v.name) == -1) {
                                                                    monhoc.push(v.name);                                                        
                                                                    monhocdadangky.push(mh.mamon);
                                                                }
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                        
                                        let monhocdadongtien = [];
                                        let monhocvachukycuoi = [];
                                        for (let hd of hoadon) {
                                            try {
                                                let noidung = hd['Nội Dung'].split(',');                                    
                                                let isTotal = [];
                                                for (let i of noidung) {
                                                    i = i.split(':');
                                                    if (i.length > 1) {
                                                        if (i[3] == null) {
                                                            if (monhocdadangky.indexOf(i[0]) != -1
                                                            && monhocdadongtien.indexOf(i[0]) == -1) {
                                                                monhocdadongtien.push(i[0]);
                                                                monhocvachukycuoi.push({id: i[0], ngayketthuc: new Date(hd['Cuối Chu Kỳ']), price: i[1]});
                                                            }
                                                        } else {
                                                            if (isTotal.indexOf(i[3]) == -1) {
                                                                isTotal.push(i[3]);
                                                                if (monhocdadangky.indexOf(i[3]) != -1
                                                                && monhocdadongtien.indexOf(i[3]) == -1) {
                                                                    monhocdadongtien.push(i[3]);
                                                                    monhocvachukycuoi.push({id: i[3], ngayketthuc: new Date(hd['Cuối Chu Kỳ']), price: i[4]});
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            } catch (error) {                                    
                                            }
                                        }

                                        let ngaytoihan = [];                            
                                        let tongthutamtinh = 0;
                                        let checkMH = true;
                                        for (let i of monhocvachukycuoi) {
                                            checkMH = false;
                                            let date = ("0" + i.ngayketthuc.getDate()).slice(-2) + '/' + ("0" + (i.ngayketthuc.getMonth() + 1)).slice(-2) + '/' + i.ngayketthuc.getFullYear();
                                            if (ngaytoihan.indexOf(date) == -1) {
                                                ngaytoihan.push(date);
                                            }

                                            let thanhtien = 0;
                                            if (isNaN(i.id)) {
                                                for (let j of this.props.moreTablesInfo.bieuphimonhoc) {
                                                    if (j['Mã Môn Học'] == i.id) {
                                                        if (isNaN(j['Bảng Giá'])) {
                                                            let bg = j['Bảng Giá'].split(',');
                                                            let bg_check = false;
                                                            for (let b of bg) {
                                                                b = b.split(':');
                                                                if (Number(b[0]) == Number(j.price)) {
                                                                    thanhtien = Number(b[0]);
                                                                    bg_check = true;
                                                                }
                                                            }
                                                            if (!bg_check) {
                                                                let _b = bg[0].split(':');
                                                                thanhtien = Number(_b[0]);
                                                            }
                                                        } else {
                                                            thanhtien = Number(j['Bảng Giá']);
                                                        }
                                                    }
                                                }
                                            } else {
                                                for (let j of this.props.moreTablesInfo.chuongtrinhhocbosung) {
                                                    if (j.ID.toString() == i.id) {
                                                        thanhtien = Number(j['Trọn Gói']);
                                                    }
                                                }
                                            }

                                            if (this.props.options.additionalConditional != null
                                            && this.props.options.additionalConditional.chotdenngay != null) {
                                                let ngbd = new Date(i.ngayketthuc);
                                                let ngkt = new Date(i.ngayketthuc);
                                                ngkt.setMonth(ngkt.getMonth() + 1);
                                                let songay = (ngkt - ngbd) / 86400000;

                                                let ngaychot = new Date(this.props.options.additionalConditional.chotdenngay);
                                                let a = ngaychot - i.ngayketthuc;
                                                let th = Noofmonths(i.ngayketthuc, ngaychot);
                                                let check = new Date(i.ngayketthuc);
                                                
                                                if (a > 0) {
                                                    let t = 0;
                                                    for (let i = 0; i < th; i++) {
                                                        let ng = (ngaychot - check) / 86400000;
                                                        check.setMonth(check.getMonth() + 1);
                                                        if (check < ngaychot) {
                                                            t += thanhtien;
                                                        } else {
                                                            t += lamtron(Number((thanhtien / songay) * ng));
                                                        }
                                                    }
                                                    tongthutamtinh += t;
                                                }
                                            } else {
                                                tongthutamtinh += thanhtien;
                                            }
                                        }
                                        if (checkMH) {
                                            tongthutamtinh = null;
                                        }

                                        value['Ngày Tới Hạn'] = ngaytoihan.join(', ');
                                        value['Môn Học Đã Đăng Ký'] = monhoc.join(', ');
                                        value['Tổng Thu Tạm Tính'] = tongthutamtinh;
                                        let r = [];
                                        for (let i of header) {
                                            r.push(value[i]);
                                        }
                                        ws_data.push(r);
                                    }
                                } break;
                            }
                        }
                        
                        let ws = XLSX.utils.aoa_to_sheet(ws_data);
                        if (dulieuguive.tablename == null) {
                            wb.Sheets[this.props.tablename] = ws;
                        } else {
                            wb.Sheets[dulieuguive.tablename] = ws;
                        }
                        let filename = $('.khuvuc').attr('value') + '_' +  this.props.tablename + '_' + new Date().toLocaleDateString('en-GB') + '.xlsx';
                        let wbout = XLSX.writeFile(wb, filename, {bookType: 'xlsx', type: 'binary'});
                    default:                        
                }
                
            }
        }  
    }

    componentDidMount () {
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);

        let column = this.props.column;
        switch (this.props.menuSelected) {
            case 'hocsinh':
            case 'hocsinhnghi': {
                column.push({label: 'Môn Học Đã Đăng Ký', value: 'tb1.`monhoc` AS `Môn Học Đã Đăng Ký`'});                
            } break;
            case 'hoadonnohocphi': {
                column = [];
                column.push({
                    label: 'Xuất Nợ Học Phí',
                    isButton: true,
                    fn: () => {
                        let query = 'SELECT USERS.`ID`, ' +
                        'USERS.`User ID`, ' +
                        // 'USERS.`Hình Ảnh`, ' +
                        'USERS.`Họ Và Tên`, ' +
                        'USERS.`Lớp`, ' +
                        'USERS.`Tên Trường`, ' +                
                        'USERS.`Số Điện Thoại`, ' +
                        'dkmh.`monhoc` AS `Môn Học Đã Đăng Ký`, ' +
                        'tb.`Cuối Chu Kỳ` AS `Ngày Tới Hạn`, ' +
                        'tb.`Nội Dung` AS `Tổng Thu Tạm Tính`, ' +
                        'USERS.`Cơ Sở` ' +
                        'FROM USERS ' +
                        'LEFT JOIN (SELECT `User ID` as userid, monhoc FROM DANGKIMONHOC) as dkmh ON dkmh.`userid` = USERS.`User ID` ' +
                        'LEFT JOIN (SELECT tb1.`User ID` as userid, tb1.`Cuối Chu Kỳ`, tb1.`Nội Dung` ' +
                            'FROM (SELECT * FROM BIENLAIHOCPHI WHERE `Ngày Hủy Phiếu` IS NULL AND `Nội Dung` NOT LIKE \'@@@%\') AS tb1 ' +
                            'LEFT JOIN (SELECT * FROM BIENLAIHOCPHI WHERE `Ngày Hủy Phiếu` IS NULL AND `Nội Dung` NOT LIKE \'@@@%\') AS tb2 ' +
                            'ON (tb1.`User ID` = tb2.`User ID` ' +
                            'AND tb2.`Cuối Chu Kỳ` > tb1.`Cuối Chu Kỳ`) ' +
                            'WHERE tb2.`Cuối Chu Kỳ` IS NULL) as tb ' +
                        'ON (tb.`userid` = USERS.`User ID`) ' +
                        'WHERE USERS.`Cơ Sở` = \'!\?!\' ' +
                        'AND USERS.`Chính Thức` = \'1\' ' +
                        'AND (USERS.`Ngày Nghỉ Học` IS NULL OR USERS.`Ngày Nghỉ Học` > CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\')) ' +
                        'ORDER BY USERS.`ID` ASC; ';
                        query = query.replace('!\?!', this.props.userInfo.branch);
                        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                            fn: 'sheetjs-xuatexcels-getdata',
                            tablename: 'No Hoc Phi',
                            table: 'hoadon_nohocphi'
                        })
                    }
                });
            } break;
            case 'lophoc': {
                column.push({
                    label: 'Bảng Điểm',
                    isButton: true,
                    fn: () => {
                        let query = 'SELECT USERS.`User ID`, USERS.`Họ Và Tên`, USERS.`Lớp`, tb1.* ' +
                        'FROM USERS ' +
                        'LEFT JOIN (SELECT SCORESHEETS.userID, ' +
                        'SCORESHEETS.`score` as score, ' +
                        'SCORESHEETS.`content` as content, ' +
                        'LOPHOC.`Mã Môn Học` as subject, ' +
                        'LOPHOC.`Mã Giáo Viên` as teacherCode, ' +
                        'SCORESHEETS.`classID` as classID ' +
                        'FROM SCORESHEETS ' +
                        'LEFT JOIN LOPHOC ON `Mã Lớp` = `classID` ' +
                        'WHERE `month` = MONTH(CONVERT_TZ(CURRENT_DATE(), @@session.time_zone,\'+07:00\')) ' +
                        'AND `year` = YEAR(CONVERT_TZ(CURRENT_DATE(), @@session.time_zone,\'+07:00\'))) ' +
                        'as tb1 ON tb1.userID = USERS.`User ID` ' +
                        'WHERE `Cơ Sở` = \'!\?!\' ' +
                        'AND `Chính Thức` = \'1\' ' +
                        'AND (`Ngày Nghỉ Học` IS NULL OR `Ngày Nghỉ Học` > CONVERT_TZ(NOW(), @@session.time_zone,\'+07:00\')); ';
                        query = query.replace('!\?!', this.props.userInfo.branch);
                        query += 'SELECT * FROM DANHSACHMONHOC ' +
                        'WHERE EXISTS(SELECT * FROM LOPHOC ' +
                        'WHERE LOPHOC.`Mã Môn Học` = DANHSACHMONHOC.`mamon` ' +
                        'AND LOPHOC.`branch` = \'!\?!\' ' + 
                        'AND CONVERT_TZ(CURDATE(), @@session.time_zone,\'+07:00\') <= LOPHOC.`Ngày Kết Thúc`); '
                        query = query.replace('!\?!', this.props.userInfo.branch);
                        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                            fn: 'sheetjs-xuatexcels-getdata',
                            tablename: 'Bang Diem',
                            table: 'lophoc_bangdiem'
                        })
                    }
                });
            } break;
            default:
        }
        this.setState({
            column: column,
        })
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    dongy () {
        let column = this.state.column;
        let query = 'SELECT ';
        let checkfail = true;
        for (let value of column) {
            if (value.checked
            && value.value == value.label
            && value.value != null) {
                query += '`?`, '.replace('?', value.value);
                checkfail = false;
            } else if (value.checked && value.value != null) {
                query += value.value + ', ';
                checkfail = false;
            }
        }
        if ((query.lastIndexOf(', ') + ', '.length) == query.length) {
            query = query.substr(0, query.lastIndexOf(', '));
        }

        if (checkfail) {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Vui lòng chọn cột dữ liệu để xuất tệp!',
                notifyType: 'warning',
            })
            return;
        }

        query += this.props.from;        
        
        this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
            fn: 'sheetjs-xuatexcels-getdata',
        })
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div className={style.formstyle}>
                <div className="form_body">
                    <div className="header">
                        <h2>Xuất dữ liệu ra file Excel</h2>
                    </div>
                    <div className="body">
                        <div className='divformstyle'>
                            <div>
                                <fieldset style={{"padding": "0", }}>
                                    <legend>Chọn cột dữ liệu muốn xuất: </legend>
                                    <div style={{
                                        "max-height": "200px",
                                        "overflow-y": "auto",
                                        "padding-top": "10px",
                                        "padding-bottom": "10px",
                                        "padding-left": "0px",
                                        "padding-right": "0px",}}>
                                        {this.state.column.map((e, i) => {
                                            if (e.value != null) {
                                                return (    
                                                    <div>
                                                        <input 
                                                            type="checkbox" 
                                                            value={e.label} 
                                                            checked={e.checked} 
                                                            onChange={this.onCheckColumn.bind(this, e.value)}
                                                            style={{'width':'auto'}}/>
                                                        <span>{e.label}</span>
                                                    </div>
                                                )
                                            }
                                        })}
                                    </div>
                                </fieldset>
                            </div>
                            <div>
                                <div style={{
                                    border: '1px solid #888',
                                    margin: '2px',
                                    padding: '5px',
                                }}>
                                    {this.state.column.map((e, i) => {
                                        if (e.isButton) {
                                            return (
                                                <input
                                                    type="button"
                                                    value={e.label}
                                                    style={{'margin': '0'}}
                                                    onClick={() => {
                                                        try {
                                                            e.fn();
                                                        } catch (error) {
                                                            
                                                        }
                                                    }}
                                                />
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                            <div>
                                <input type="button" value="Chọn Tất Cả" style={{'margin': '0'}} onClick={this.onClickAllCheck.bind(this)}/>
                                <input type="button" value="Hủy Tất Cả" style={{'margin': '0'}} onClick={this.onClickAllUncheck.bind(this)}/>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <input type="button" onClick={this.close.bind(this)} value="Thoát"/>
                        <input type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
                    </div>
                </div>
            </div>
        )
    }

    onCheckColumn (e) {
        let column = this.state.column;
        for (let value of column) {
            if (value.value == e) {
                if (value.checked) {
                    value.checked = false;                
                } else {
                    value.checked = true;
                }
                break;
            }
        }
        this.setState({
            column
        })
    }

    onClickAllCheck () {
        let column = this.state.column;
        for (let value of column) {
            value.checked = true;
        }
        this.setState({
            column
        })
    }

    onClickAllUncheck () {
        let column = this.state.column;
        for (let value of column) {
            value.checked = false;
        }
        this.setState({
            column
        })
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
      userInfo: state.userinformation,
    };
}) (Export);
