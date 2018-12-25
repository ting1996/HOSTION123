import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
// import store from 'store';
import style from '../style.css';
import Button from '../elements/Button';
import mystyle from './style.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEdit,
    faEye,
} from '@fortawesome/free-solid-svg-icons';

class HappinessScore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: null,

            listHSNghi: null,
            listChiTieuDiemSo: null,
            isHocchudong: false,
            listKyLuat: null,
            listPhanAnhTuPhuHuynh: null,
            totalHS: 0,

            viewHSNghi: false,
            viewChiTieuDiemSo: false,
            viewKyLuat: false,
            viewPhanAnh: false,
            totalHSPhanAnh: 0,
            viewHSYeuThich: false,
            view: null,

            btnAllDisable: false,
            btnCloseDisable: false,
            btnAgreeDisable: false,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    changeSize () {
        try {
            if (window.innerHeight < this.refs.body.offsetHeight) {
                this.refs.background.style.paddingTop = '0px';
            } else {
                this.refs.background.style.paddingTop = ((window.innerHeight - this.refs.body.offsetHeight) / 2) + 'px';
            }
        } catch (e) {
            
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
                    case 'form_happinessscore_loadinformation':
                        // console.log(rows);
                    
                        this.setState({
                            listHSNghi: rows[0],
                            totalHSPhanAnh: rows[1].length,
                            listPhanAnhTuPhuHuynh: rows[3],
                            totalHS: rows[2].length,
                        })
                        break;
                    case 'form_happinessscore_loadScreenInfo': {
                        this.setState({
                            title: rows[0]['Mã Giáo Viên'] + ' - ' + rows[0]['Họ Và Tên'],
                        })
                    } break;
                    default:                        
                }                
            }
        }  
    }

    componentDidMount () {
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.updateDate();

        let query = 'SELECT * FROM GIAOVIEN WHERE `Mã Giáo Viên` = \'!\?!\'; ';
        query = query.replace('!\?!', this.props.data['Mã Giáo Viên']);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_happinessscore_loadScreenInfo',
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    updateDate (date = new Date('2018-10-01')) {
        let query;
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let year = date.getFullYear();
        let daysInMonth = ("0" + (new Date(year, month, 0).getDate())).slice(-2);
        let fistDateInMonth = year + '-' + month + '-01 00:00:00';
        let lastDateInMonth = year + '-' + month + '-' + daysInMonth + ' 23:59:00';
        query = 'SELECT DISTINCT DANHSACHHOCSINHTRONGLOP.`User ID`, LYDONHAPHOCVANGHI.`content`, USERS.`Họ Và Tên` FROM LOPHOC ' +
        'LEFT JOIN DANHSACHHOCSINHTRONGLOP ON LOPHOC.`Mã Lớp` = DANHSACHHOCSINHTRONGLOP.`Mã Lớp` ' +
        'LEFT JOIN LYDONHAPHOCVANGHI ON DANHSACHHOCSINHTRONGLOP.`User ID` = LYDONHAPHOCVANGHI.`User ID` ' +
        'AND date >= \'!\?!\' AND date <= \'!\?!\' ' +
        'LEFT JOIN USERS ON DANHSACHHOCSINHTRONGLOP.`User ID` = USERS.`User ID` ' +
        'WHERE `Mã Giáo Viên` = \'!\?!\' ' +
        'AND `Ngày Kết Thúc` >= \'!\?!\' ' +
        'AND `Ngày Bắt Đầu` <= \'!\?!\' ' +
        'AND DANHSACHHOCSINHTRONGLOP.`User ID` IS NOT NULL ' +
        'AND LYDONHAPHOCVANGHI.`content` IS NOT NULL; ';
        query = query.replace('!\?!', fistDateInMonth);
        query = query.replace('!\?!', lastDateInMonth);
        query = query.replace('!\?!', this.props.data['Mã Giáo Viên']);
        query = query.replace('!\?!', lastDateInMonth);
        query = query.replace('!\?!', lastDateInMonth);
        query += 'SELECT USERS.`User ID`, USERS.`Họ Và Tên`, USERS.`Hình Ảnh`, USERS.`Lớp` ' +
        'FROM USERS WHERE EXISTS (SELECT * FROM LOPHOC ' +
        'LEFT JOIN DANHSACHHOCSINHTRONGLOP ON DANHSACHHOCSINHTRONGLOP.`Mã Lớp` = LOPHOC.`Mã Lớp` ' +
        'WHERE `Mã Giáo Viên` = \'!\?!\' AND DANHSACHHOCSINHTRONGLOP.`User ID` = USERS.`User ID`) ' +
        'AND EXISTS (SELECT * FROM CHAMSOCKHACHHANG WHERE CHAMSOCKHACHHANG.`User ID` = USERS.`User ID` ' +
        'AND (CHAMSOCKHACHHANG.`Mức Độ Hài Lòng` = \'Nguy cơ nghỉ\' ' +
        'OR CHAMSOCKHACHHANG.`Mức Độ Hài Lòng` = \'Không hài lòng nhưng chưa đến mức nghỉ\') ' +
        'AND CHAMSOCKHACHHANG.`Ngày Gọi` >= \'!\?!\' ' +
        'AND CHAMSOCKHACHHANG.`Ngày Gọi` <= \'!\?!\'); ';
        query = query.replace('!\?!', this.props.data['Mã Giáo Viên']);
        query = query.replace('!\?!', fistDateInMonth);
        query = query.replace('!\?!', lastDateInMonth);
        query += 'SELECT USERS.`User ID`, USERS.`Họ Và Tên`, USERS.`Hình Ảnh`, USERS.`Lớp` FROM USERS WHERE ' +
        'EXISTS (SELECT * FROM LOPHOC ' +
        'LEFT JOIN DANHSACHHOCSINHTRONGLOP ON DANHSACHHOCSINHTRONGLOP.`Mã Lớp` = LOPHOC.`Mã Lớp` ' +
        'WHERE `Mã Giáo Viên` = \'!\?!\' AND DANHSACHHOCSINHTRONGLOP.`User ID` = USERS.`User ID`); '
        query = query.replace('!\?!', this.props.data['Mã Giáo Viên']);
        query += 'SELECT CHAMSOCKHACHHANG.*, USERS.`Họ Và Tên` FROM CHAMSOCKHACHHANG ' +
        'LEFT JOIN USERS ON USERS.`User ID` = CHAMSOCKHACHHANG.`User ID` ' +
        'WHERE `Ngày Gọi` >= \'!\?!\' ' +
        'AND `Ngày Gọi` <= \'!\?!\' ' +
        'AND EXISTS (SELECT * FROM USERS WHERE ' +
        'EXISTS (SELECT * FROM LOPHOC ' +
        'LEFT JOIN DANHSACHHOCSINHTRONGLOP ON DANHSACHHOCSINHTRONGLOP.`Mã Lớp` = LOPHOC.`Mã Lớp` ' +
        'WHERE `Mã Giáo Viên` = \'!\?!\' AND DANHSACHHOCSINHTRONGLOP.`User ID` = USERS.`User ID`) ' +
        'AND USERS.`User ID` = CHAMSOCKHACHHANG.`User ID`) ' +
        'AND (CHAMSOCKHACHHANG.`Mức Độ Hài Lòng` = \'Nguy cơ nghỉ\'  ' +
        'OR CHAMSOCKHACHHANG.`Mức Độ Hài Lòng` = \'Không hài lòng nhưng chưa đến mức nghỉ\'); ';
        query = query.replace('!\?!', fistDateInMonth);
        query = query.replace('!\?!', lastDateInMonth);
        query = query.replace('!\?!', this.props.data['Mã Giáo Viên']);
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_happinessscore_loadinformation',
        });
    }

    dongy () {

    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let listHSNghi = null;
        let totalHSNghi = 0;
        if (this.state.listHSNghi != null
        && this.state.listHSNghi.length > 0) {
            listHSNghi = 
            <div className={mystyle.listdata}>
                {this.state.listHSNghi.map(v => {
                    return (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '33.33% 33.33% 33.33%',
                        }}>
                            <div>
                                {v['User ID']}
                            </div>
                            <div>
                                {v['Họ Và Tên']}
                            </div>
                            <div>
                                {v['content']}
                            </div>
                        </div>
                    )
                })}
            </div>
            totalHSNghi = this.state.listHSNghi.length;
        }
        let styleHSNghi = mystyle.button;
        if (this.state.viewHSNghi) {
            styleHSNghi += ' ' + mystyle.buttonIsEnable;
        }
        let HSNghi = 
        <div>
            <div>
                Danh Sách Học Sinh Nghỉ:
                <span className={styleHSNghi} onClick={this.changeView.bind(this, 'viewHSNghi')}><FontAwesomeIcon icon={faEye}/></span>
            </div>
            {listHSNghi}
            <div className={mystyle.total}>
                Tổng nghỉ: {totalHSNghi}
            </div>
        </div>

        let listChiTieuDiemSo = null;
        let totalDiemSo = 0;
        if (this.state.listChiTieuDiemSo != null
        && this.state.listChiTieuDiemSo.length > 0) {
            listChiTieuDiemSo = 
            <div className={mystyle.listdata}>
                                    
            </div>
        }
        let styleChiTieuDiemSo = mystyle.button;
        if (this.state.viewChiTieuDiemSo) {
            styleChiTieuDiemSo += ' ' + mystyle.buttonIsEnable;
        }
        let ChiTieuDiemSo = 
        <div>
            <div>
                Chỉ Tiêu Điểm Số (Trên Mỗi Lớp): 
                <span className={styleChiTieuDiemSo} onClick={this.changeView.bind(this, 'viewChiTieuDiemSo')}><FontAwesomeIcon icon={faEye}/></span>
            </div>
            {listChiTieuDiemSo}
            <div className={mystyle.total}>
                Tổng lớp: {totalDiemSo}% đạt
            </div>
        </div>

        let listKyLuat = null;
        let totalLoi = 0;
        if (this.state.listKyLuat != null
        && this.state.listKyLuat.length > 0) {
            listKyLuat = 
            <div className={mystyle.listdata}>

            </div>
        }
        let styleKyLuat = mystyle.button;
        if (this.state.viewKyLuat) {
            styleKyLuat += ' ' + mystyle.buttonIsEnable;
        }
        let KyLuat =
        <div>
            <div>
                Vi Phạm Kỷ Luật: 
                <span className={styleKyLuat} onClick={this.changeView.bind(this, 'viewKyLuat')}><FontAwesomeIcon icon={faEye}/></span> 
                <span className={mystyle.button}><FontAwesomeIcon icon={faEdit}/></span>
            </div>
            {listKyLuat}
            <div className={mystyle.total}>
                Số Lượng Vi Phạm: {totalLoi} lỗi
            </div>
        </div>

        let listPhanAnhTuPhuHuynh = null;
        let totalPhanAnhTuPhuHuynh = 0;
        if (this.state.listPhanAnhTuPhuHuynh != null
        && this.state.listPhanAnhTuPhuHuynh.length > 0) {
            let checklist = [];
            listPhanAnhTuPhuHuynh = 
            <div className={mystyle.listdata}>
                {this.state.listPhanAnhTuPhuHuynh.map(v => {
                    if (checklist.indexOf(v['User ID']) == -1) {                        
                        checklist.push(v['User ID']);
                        return (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '50% 50%',
                            }}>
                                <div>
                                    {v['User ID']}
                                </div>
                                <div>
                                    {v['Họ Và Tên']}
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
            totalPhanAnhTuPhuHuynh = ((this.state.totalHSPhanAnh / this.state.totalHS) * 100).toFixed(2);
        }
        let stylePhanAnhTuPhuHuynh = mystyle.button;
        if (this.state.viewPhanAnh) {
            stylePhanAnhTuPhuHuynh += ' ' + mystyle.buttonIsEnable;
        }
        let PHPhanAnh = 
        <div>
            <div>
                Phản Ánh Từ Phụ Huynh (Trên Tổng Học Sinh Theo Học): 
                <span className={stylePhanAnhTuPhuHuynh} onClick={this.changeView.bind(this, 'viewPhanAnh')}><FontAwesomeIcon icon={faEye}/></span>
            </div>
            {listPhanAnhTuPhuHuynh}
            <div className={mystyle.total}>
                Tỉ Lệ Phụ Huynh Phản Ánh: {totalPhanAnhTuPhuHuynh}%
            </div>
        </div>

        let bodydisplay = '100%';
        let bodywidth = null;
        if (this.state.view != null) {
            bodydisplay = '500px auto';
            bodywidth= '1100px';
        }

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{width: bodywidth, transition: '0.3s'}}>
                    <div className="header">
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>Điểm Hạnh Phúc Giáo Viên</h2>
                    </div>
                    <div className="body">
                        <h2 style={{margin: '0px 5px'}}>{this.state.title}</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: bodydisplay,
                        }}>
                            <div className={mystyle.bangdiem} ref="bangdiem">
                                {HSNghi}
                                {ChiTieuDiemSo}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        Có Tổ Chức Học Chủ Động:
                                    </div>
                                    <input type='checkbox' checked={this.state.isHocchudong}/>
                                </div>
                                {KyLuat}
                                {PHPhanAnh}
                                <div>
                                    <div>
                                        Chỉ Tiêu Yêu Thích (Trên Tổng Học Sinh Theo Học): 
                                        <span className={mystyle.button}><FontAwesomeIcon icon={faEye}/></span> 
                                        <span className={mystyle.button}><FontAwesomeIcon icon={faEdit}/></span>
                                    </div>
                                    <div className={mystyle.listdata}>

                                    </div>
                                    <div className={mystyle.total}>
                                        Tỉ Lệ Học Sinh Yêu Thích: 60% / 300hs
                                    </div>
                                </div>
                            </div>
                            {this.state.view}
                        </div>
                    </div>
                    <div className="footer">
                        <Button 
                            onClick={this.close.bind(this)}
                            value="Thoát"
                            icon="close"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnAllDisable | this.state.btnCloseDisable}
                        />
                        <Button 
                            onClick={this.dongy.bind(this)}
                            value="Đồng Ý"
                            icon="agree"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnAllDisable | this.state.btnAgreeDisable}
                        />
                    </div>
                </div>
            </div>
        )
    }

    changeView (view) {
        let viewHSNghi = false;
        let viewChiTieuDiemSo = false;
        let viewKyLuat = false;
        let viewPhanAnh = false;
        let viewHSYeuThich = false;
        let elementsView = null;
        let elements = null;
        let check = false;
        switch (view) {
            case 'viewHSNghi':
                viewHSNghi = !this.state.viewHSNghi;
                if (viewHSNghi && elements != null) {
                    elements = 
                    <div>

                    </div>
                }
                break;
            case 'viewChiTieuDiemSo':
                viewChiTieuDiemSo = !this.state.viewChiTieuDiemSo;
                if (viewChiTieuDiemSo && elements != null) {
                    elements = 
                    <div>

                    </div>
                }
                break;
            case 'viewKyLuat':
                viewKyLuat = !this.state.viewKyLuat;
                if (viewKyLuat && elements != null) {
                    elements = 
                    <div>

                    </div>
                }
                break;
            case 'viewPhanAnh':
                viewPhanAnh = !this.state.viewPhanAnh;
                elements = this.state.listPhanAnhTuPhuHuynh;
                if (viewPhanAnh && elements != null) {                    
                    elements = 
                    <div>
                        {elements.map(v => {
                            let checklist = [];
                            if (checklist.indexOf(v['User ID']) == -1) {
                                checklist.push(v['User ID']);
                                return (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '25% 25% 25% 25%',
                                    }}>
                                        <div>
                                            {v['User ID']}
                                        </div>
                                        <div>
                                            {v['Họ Và Tên']}
                                        </div>
                                        <div>
                                            {v['Mức Độ Hài Lòng']}
                                        </div>
                                        <div title={v['Nội Dung Cuộc Gọi']} style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {v['Nội Dung Cuộc Gọi']}
                                        </div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                }
                break;
            case 'viewHSYeuThich':
                viewHSYeuThich = !this.state.viewHSYeuThich;
                if (viewHSYeuThich && elements != null) {
                    elements = 
                    <div>

                    </div>
                }
                break;
            default:
                check = true;
                break;
        }
        if (viewHSNghi
        || viewChiTieuDiemSo
        || viewKyLuat
        || viewPhanAnh
        || viewHSYeuThich) {
            elementsView = 
            <div
                className={mystyle.listdata}
                style={{
                    height: 'calc(' + this.refs.bangdiem.clientHeight + ' - 17px)',
                    maxHeight: 'none',
                }}
            >
                {elements}
            </div>
        }
        if (!check) {
            this.setState({
                viewHSNghi: viewHSNghi,
                viewChiTieuDiemSo: viewChiTieuDiemSo,
                viewKyLuat: viewKyLuat,
                viewPhanAnh: viewPhanAnh,
                viewHSYeuThich: viewHSYeuThich,
                view: elementsView,
            })
        }
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (HappinessScore);
