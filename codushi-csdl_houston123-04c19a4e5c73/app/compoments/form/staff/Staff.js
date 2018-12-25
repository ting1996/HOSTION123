import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
// import store from 'store';
import style from '../style.css';
import Button from '../elements/Button';
import Webcam from '../elements/Webcam';
import Select from 'react-select';
import SoDienThoai from '../elements/SoDienThoai';
import DiaChi from '../DiaChi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner,
} from '@fortawesome/free-solid-svg-icons';

class Staff extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isImageChange: false,
            isOpenWebcam: false,
            listPermission: [],
            permission: null,
            listBranch: [],
            branch: [],
            btnDisable: false,
            btnCloseDisable: false,

            checkcmnd: false,
            cmnd: null,
            _cmnd: null,
            baotrungcmnd: '',
            wasChecked: '',
            userUID: null,
            oldUID: null,
            image: 'img/image_upload.png',
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.callBackWebDav = this.callBackWebDav.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
        this.changeSize = this.changeSize.bind(this);
        this.updateData = this.updateData.bind(this);
    }

    dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        let byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
    
        // separate out the mime component
        let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // write the bytes of the string to a typed array
        let ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        let blod = new Blob([ia], {type:mimeString});
        return blod;
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
                    case 'form_staff_loadinformation': {
                        let listPermission = [];
                        let permission = null;
                        let branch = [];
                        for (let row of rows[0]) {
                            let per = row['Permission Allow'].split(' ');
                            row.label = row['Loại Quản Lý'];
                            for (let p of per) {
                                if (p == $('.permission').attr('value')) {
                                    if (this.props.add == null
                                    || (this.props.add != null && this.props.add == row.Permission)) {
                                        listPermission.push(row);
                                    }
                                    break;
                                }
                            }
                            if ((this.props.data != null
                            && this.props.data['permission'] == row.Permission)
                            || (this.props.add != null && this.props.add == row.Permission)) {
                                permission = row;
                            }
                        }                     
                        for (let r of rows[1]) {
                            r.label = r['Tên Cơ Sở'];
                            r.value = r['Cơ Sở'];
                            if (this.props.data != null && this.props.data['Cơ Sở'] != null) {
                                for (let b of this.props.data['Cơ Sở'].split(',')) {
                                    if (b == r['Cơ Sở']) {
                                        branch.push(r);
                                    }
                                }
                            }
                        }
                        this.setState({
                            listPermission: listPermission,
                            permission: permission,
                            listBranch: rows[1],
                            branch: branch,
                        })
                    } break;
                    case 'form_staff_checkcmnd': {
                        if (rows[0].length > 0 || rows[1].length > 0) {
                            this.refs.cmnd.style.borderColor = 'red';
                            this.setState({
                                btnDisable: false,
                                checkcmnd: false,
                                baotrungcmnd: 'Số cmnd này đã được sử dụng!',
                                wasChecked: this.refs.cmnd.value,
                                cmnd: null,
                                _cmnd: null,
                            })
                        } else {
                            this.refs.cmnd.style.borderColor = 'rgb(204, 204, 204)';
                            this.setState({
                                btnDisable: false,
                                checkcmnd: false,
                                baotrungcmnd: '',
                                cmnd: this.refs.cmnd.value,
                                _cmnd: this.refs.cmnd.value,
                                wasChecked: this.refs.cmnd.value,
                            })
                        }
                    } break;
                    case 'form_staff_addsuccessful': {
                        this.SocketEmit('them-account', dulieuguive.data, rows);
                        this.close();
                    } break;
                    case 'form_staff_editsuccessful': {
                        if (this.state.userUID != this.state.oldUID
                        && (this.props.userInfo.permission == 'admin')
                        && this.state.userUID != null
                        && this.state.userUID.length >= 8) {
                            let query = '';
                            if (this.state.oldUID != null) {
                                query = 'UPDATE `USERSAUTHENTICATIONDATA` SET `UID` = \'!\?!\' WHERE (`code` = \'!\?!\'); '
                            } else {
                                query = 'INSERT INTO `USERSAUTHENTICATIONDATA` (`UID`, `code`) VALUES (\'!\?!\', \'!\?!\'); '
                            }
                            query = query.replace('!\?!', this.state.userUID);
                            query = query.replace('!\?!', this.props.data['Mã Quản Lý']);
                            this.SocketEmit('gui-query-den-database', query);
                        }
                        this.close();
                    } break;
                    case 'form_staff_loadauthentication': {
                        if (rows[0] == null) {
                            rows[0] = {};
                        }
                        this.setState({
                            userUID: rows[0].UID,
                            oldUID: rows[0].UID,
                        });
                    } break;
                    default:
                }
            }
        }  
    }

    callBackWebDav (data, err) {
        switch (data.key) {
            case 'form_staff_loadhinhanh':
                let image = 'img/image_upload.png';
                if (!err) {
                    let arrayBufferView = data.buffer;
                    let blob = new Blob( [ arrayBufferView ], { type: data.imageType } );
                    let urlCreator = window.URL || window.webkitURL;
                    let imageUrl = urlCreator.createObjectURL( blob );
                    image = imageUrl;
                }
                this.setState({
                    image: image,
                })
                break;
            default:                        
        }
    }

    componentDidMount () {
        let query;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.on('webdav', this.callBackWebDav);
        this.updateData();

        query = 'SELECT * FROM LOAIQUANLY WHERE `Permission Allow` IS NOT NULL; ';
        if (this.props.listBranch == null || this.props.listBranch[0] == 'ALL') {
            query += 'SELECT * FROM COSO; '
        } else {
            let branchW = 'WHERE ';
            for (let branch of this.props.listBranch) {
                branchW += '`Cơ Sở` = \'!\?!\' OR '.replace('!\?!', branch);
            }
            branchW = branchW.substr(0, branchW.length - ' OR '.length);
            query += 'SELECT * FROM COSO ' + branchW + '; ';
        }
        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
            fn: 'form_staff_loadinformation',
        });
    }

    componentWillUnmount () {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.off('webdav', this.callBackWebDav);
    }

    componentDidUpdate (prevProps, prevState) {
        this.changeSize();

        if (this.state.cmnd != this.state._cmnd) {
            ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        }

        if (prevState.cmnd != this.state.cmnd
        && this.state.cmnd != null) {
            this.refs.cmnd.value = this.state.cmnd;
        }
    }

    updateData () {
        if (this.props.data != null) {
            this.refs.hovaten.value = this.props.data['Họ Và Tên'];
            this.refs.email.value = this.props.data['Email'];
            if (this.props.data['Ngày Sinh'] != null) {
                let date = new Date(this.props.data['Ngày Sinh']);
                this.refs.ngaysinh.value = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
            }
            this.refs.sodienthoai.value(this.props.data['Số Điện Thoại']);
            this.diachi.value(this.props.data['Địa Chỉ']);
            if (this.diachi.value() == null) {
                this.refs.other_diachi.value = this.props.data['Địa Chỉ'];
            }
            this.setState({
                cmnd: this.props.data['CMND'],
                _cmnd: this.props.data['CMND'],
            })
            this.SocketEmit('webdav', {
                fn: 'read',
                url: '/Public/img/avatar/' + this.props.data['Hình Ảnh'],
                key: 'form_staff_loadhinhanh',
                imageType: 'image/jpeg',
            });
            let query = 'SELECT * FROM USERSAUTHENTICATIONDATA WHERE `code` = \'!\?!\'; ';
            query = query.replace('!\?!', this.props.data['Mã Quản Lý']);
            this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', { 
                fn: 'form_staff_loadauthentication',
            });
        }
    }

    dongy () {
        let query = '';
        let that = this;
        this.refs.hovaten.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.cmnd.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.email.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.other_diachi.style.borderColor = 'rgb(204, 204, 204)';
        this.refs.sodienthoai.style({borderColor: 'rgb(204, 204, 204)'});
        this.diachi.setState({borderColor: 'rgb(204, 204, 204)'});
        this.refs.chucvu.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';
        this.refs.coso.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'rgb(204, 204, 204)';

        let hovaten = this.refs.hovaten.value.trim();
        let sodienthoai = this.refs.sodienthoai.value();
        let diachi = this.diachi.value();
        let diachi2 = this.refs.other_diachi.value.trim();
        let chucvu = this.state.permission;
        let cmnd = this.state.cmnd;
        let email = this.refs.email.value.trim();
        let per = null;
        let defaultBranch = this.state.branch;
        let ngaysinh = this.refs.ngaysinh.value;
        if (ngaysinh != '') {
            let date = new Date(ngaysinh);
            ngaysinh = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
        }

        let checkfail = false;
        if (hovaten == '' || hovaten == null) {
            this.refs.hovaten.style.borderColor = 'red';
            checkfail = true;
        }

        if (sodienthoai == '' || sodienthoai.length < 10) {
            this.refs.sodienthoai.style({borderColor: 'red'});
            checkfail = true;
        }
        
        if (diachi == null && (diachi2 == null || diachi2 == '')) {
            this.diachi.setState({borderColor: 'red'});
            this.refs.other_diachi.style.borderColor = 'red';
            checkfail = true;
        } else {
            if (diachi == null) {
                diachi = diachi2;
            }
        }

        if (chucvu == null) {
            this.refs.chucvu.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            checkfail = true;
        } else {
            per = chucvu['Permission'];
            chucvu = chucvu['Loại Quản Lý'];
        }

        if (defaultBranch == null || defaultBranch.length < 1) {
            this.refs.coso.wrapper.getElementsByClassName('Select-control')[0].style.borderColor = 'red';
            checkfail = true;
        } else {
            let branchs = [];
            for (let b of defaultBranch) {
                branchs.push(b.value)
            }
            defaultBranch = branchs.join(',');
        }

        if (cmnd == null || cmnd == '') {
            this.refs.cmnd.style.borderColor = 'red';
            checkfail = true;
        }

        if (email == '') {
            this.refs.email.style.borderColor = 'red';
            checkfail = true;
        }
        
        if (!checkfail) {
            if (this.state.isImageChange) {
                var fd = new FormData();
                if (this.state.fileCapture) {
                    fd.append('image', this.dataURItoBlob(this.state.image));
                } else {
                    fd.append('file', this.refs.loadhinh.files[0]);
                }
                $.ajax({
                    url: 'trangchu/uploadimage',
                    type: 'post',
                    enctype:'multipart/form-data',
                    data: fd,
                    processData: false,
                    contentType: false,
                    statusCode: {
                        200: function (response) {
                            if (that.props.data == null) {
                                that.setState({
                                    btnCloseDisable: true,
                                    btnDisable: true,
                                });
                                if (that.props.add == null) {
                                    query = 'INSERT INTO `QUANLY` (`Họ Và Tên`, `Số Điện Thoại`, `Địa Chỉ`, `CMND`, `Email`, `Cơ Sở`, `Ngày Sinh`, `Hình Ảnh`, `permission`, `Chức Vụ`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\')';
                                } else if (that.props.add == 'giaovien') {
                                    query = 'INSERT INTO `GIAOVIEN` (`Họ Và Tên`, `Số Điện Thoại`, `Địa Chỉ`, `CMND`, `Email`, `Cơ Sở`, `Ngày Sinh`, `Hình Ảnh`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\')';
                                }                    
                                query = query.replace('!\?!', hovaten);
                                query = query.replace('!\?!', sodienthoai);
                                query = query.replace('!\?!', diachi);
                                query = query.replace('!\?!', cmnd);
                                query = query.replace('!\?!', email);
                                query = query.replace('!\?!', defaultBranch);
                                query = query.replace('!\?!', ngaysinh);
                                query = query.replace('!\?!', response);
                                query = query.replace('!\?!', per);
                                query = query.replace('!\?!', chucvu);
                                query = query.replace(/\'\'/g, 'null');
                                query = query.replace(/\'null\'/g, 'null');
                                
                                if (that.props.add == null) {
                                    that.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                        fn: 'form_staff_addsuccessful',
                                        data: {
                                            bang: 'QUANLY',
                                            ten: hovaten ,
                                            cotid: 'Mã Quản Lý',
                                            per: per
                                        },
                                        isReload: true,
                                        isSuccess: true,
                                    });
                                } else if (that.props.add == 'giaovien') {
                                    that.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                        fn: 'form_staff_addsuccessful',
                                        data: {
                                            bang: 'GIAOVIEN',
                                            ten: hovaten ,
                                            cotid: 'Mã Giáo Viên',
                                            per: per
                                        },
                                        isReload: true,
                                        isSuccess: true,
                                    });
                                }
                            } else {
                                that.setState({
                                    btnCloseDisable: true,
                                    btnDisable: true,
                                });
                                if (that.props.add == null) {
                                    query = 'UPDATE `QUANLY` SET `Họ Và Tên` = \'!\?!\', `Số Điện Thoại` = \'!\?!\', `Địa Chỉ` = \'!\?!\', `CMND` = \'!\?!\', `Email` = \'!\?!\', `Chức Vụ` = \'!\?!\', `Cơ Sở` = \'!\?!\', `Ngày Sinh` = \'!\?!\', `Hình Ảnh` = \'!\?!\', `permission` = \'!\?!\' WHERE (`Mã Quản Lý` = \'!\?!\'); ';
                                    query = query.replace('!\?!', hovaten);
                                    query = query.replace('!\?!', sodienthoai);
                                    query = query.replace('!\?!', diachi);
                                    query = query.replace('!\?!', cmnd);
                                    query = query.replace('!\?!', email);
                                    query = query.replace('!\?!', chucvu);
                                    query = query.replace('!\?!', defaultBranch);
                                    query = query.replace('!\?!', ngaysinh);
                                    query = query.replace('!\?!', response);
                                    query = query.replace('!\?!', per);
                                    query = query.replace('!\?!', that.props.data['Mã Quản Lý']);
                                } else if (that.props.add == 'giaovien') {
                                    query = 'UPDATE `GIAOVIEN` SET `Họ Và Tên` = \'!\?!\', `Số Điện Thoại` = \'!\?!\', `Địa Chỉ` = \'!\?!\', `CMND` = \'!\?!\', `Email` = \'!\?!\', `Cơ Sở` = \'!\?!\', `Ngày Sinh` = \'!\?!\', `Hình Ảnh` = \'!\?!\' WHERE (`Mã Giáo Viên` = \'!\?!\'); ';
                                    query = query.replace('!\?!', hovaten);
                                    query = query.replace('!\?!', sodienthoai);
                                    query = query.replace('!\?!', diachi);
                                    query = query.replace('!\?!', cmnd);
                                    query = query.replace('!\?!', email);
                                    query = query.replace('!\?!', defaultBranch);
                                    query = query.replace('!\?!', ngaysinh);
                                    query = query.replace('!\?!', response);
                                    query = query.replace('!\?!', that.props.data['Mã Quản Lý']);
                                }
            
                                
                                query += 'UPDATE `ACCOUNT` SET `fullname` = \'!\?!\', `permission` = \'!\?!\', `khuvuc` = \'!\?!\', `loaiquanly` = \'!\?!\', hinhanh = \'!\?!\' WHERE (`account_id` = \'!\?!\'); ';
                                query = query.replace('!\?!', hovaten);
                                query = query.replace('!\?!', per);
                                query = query.replace('!\?!', defaultBranch);
                                query = query.replace('!\?!', chucvu);
                                query = query.replace('!\?!', response);
                                query = query.replace('!\?!', that.props.data['Mã Quản Lý']);
                                query = query.replace(/\'\'/g, 'null');
                                query = query.replace(/\'null\'/g, 'null');
                                
                                that.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                                    fn: 'form_staff_editsuccessful',
                                    isReload: true,
                                    isSuccess: true,
                                });
                            }
                        },
                        400: function (response) {
                            that.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Lỗi khi resize ảnh: ' + response.responseText,
                                notifyType: 'error',
                            });
                        },
                    },
                    success : function(response){
                    }
                });
            } else {
                if (this.props.data == null) {
                    this.setState({
                        btnCloseDisable: true,
                        btnDisable: true,
                    });
                    if (this.props.add == null) {
                        query = 'INSERT INTO `QUANLY` (`Họ Và Tên`, `Số Điện Thoại`, `Địa Chỉ`, `CMND`, `Email`, `Cơ Sở`, `Ngày Sinh`,`permission`, `Chức Vụ`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\')';
                    } else if (this.props.add == 'giaovien') {
                        query = 'INSERT INTO `GIAOVIEN` (`Họ Và Tên`, `Số Điện Thoại`, `Địa Chỉ`, `CMND`, `Email`, `Cơ Sở`, `Ngày Sinh`) VALUES (\'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\', \'!\?!\')';
                    }                    
                    query = query.replace('!\?!', hovaten);
                    query = query.replace('!\?!', sodienthoai);
                    query = query.replace('!\?!', diachi);
                    query = query.replace('!\?!', cmnd);
                    query = query.replace('!\?!', email);
                    query = query.replace('!\?!', defaultBranch);
                    query = query.replace('!\?!', ngaysinh);
                    query = query.replace('!\?!', per);
                    query = query.replace('!\?!', chucvu);
                    query = query.replace(/\'\'/g, 'null');
                    query = query.replace(/\'null\'/g, 'null');
                    
                    if (this.props.add == null) {
                        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                            fn: 'form_staff_addsuccessful',
                            data: {
                                bang: 'QUANLY',
                                ten: hovaten ,
                                cotid: 'Mã Quản Lý',
                                per: per
                            },
                            isReload: true,
                            isSuccess: true,
                        });
                    } else if (this.props.add == 'giaovien') {
                        this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                            fn: 'form_staff_addsuccessful',
                            data: {
                                bang: 'GIAOVIEN',
                                ten: hovaten ,
                                cotid: 'Mã Giáo Viên',
                                per: per
                            },
                            isReload: true,
                            isSuccess: true,
                        });
                    }
                } else {
                    this.setState({
                        btnCloseDisable: true,
                        btnDisable: true,
                    });
                    if (this.props.add == null) {
                        query = 'UPDATE `QUANLY` SET `Họ Và Tên` = \'!\?!\', `Số Điện Thoại` = \'!\?!\', `Địa Chỉ` = \'!\?!\', `CMND` = \'!\?!\', `Email` = \'!\?!\', `Chức Vụ` = \'!\?!\', `Cơ Sở` = \'!\?!\', `Ngày Sinh` = \'!\?!\', `permission` = \'!\?!\' WHERE (`Mã Quản Lý` = \'!\?!\'); ';
                        query = query.replace('!\?!', hovaten);
                        query = query.replace('!\?!', sodienthoai);
                        query = query.replace('!\?!', diachi);
                        query = query.replace('!\?!', cmnd);
                        query = query.replace('!\?!', email);
                        query = query.replace('!\?!', chucvu);
                        query = query.replace('!\?!', defaultBranch);
                        query = query.replace('!\?!', ngaysinh);
                        query = query.replace('!\?!', per);
                        query = query.replace('!\?!', this.props.data['Mã Quản Lý']);
                    } else if (this.props.add == 'giaovien') {
                        query = 'UPDATE `GIAOVIEN` SET `Họ Và Tên` = \'!\?!\', `Số Điện Thoại` = \'!\?!\', `Địa Chỉ` = \'!\?!\', `CMND` = \'!\?!\', `Email` = \'!\?!\', `Cơ Sở` = \'!\?!\', `Ngày Sinh` = \'!\?!\' WHERE (`Mã Giáo Viên` = \'!\?!\'); ';
                        query = query.replace('!\?!', hovaten);
                        query = query.replace('!\?!', sodienthoai);
                        query = query.replace('!\?!', diachi);
                        query = query.replace('!\?!', cmnd);
                        query = query.replace('!\?!', email);
                        query = query.replace('!\?!', defaultBranch);
                        query = query.replace('!\?!', ngaysinh);
                        query = query.replace('!\?!', this.props.data['Mã Quản Lý']);
                    }

                    
                    query += 'UPDATE `ACCOUNT` SET `fullname` = \'!\?!\', `permission` = \'!\?!\', `khuvuc` = \'!\?!\', `loaiquanly` = \'!\?!\' WHERE (`account_id` = \'!\?!\'); ';
                    query = query.replace('!\?!', hovaten);
                    query = query.replace('!\?!', per);
                    query = query.replace('!\?!', defaultBranch);
                    query = query.replace('!\?!', chucvu);
                    query = query.replace('!\?!', this.props.data['Mã Quản Lý']);
                    query = query.replace(/\'\'/g, 'null');
                    query = query.replace(/\'null\'/g, 'null');
                    
                    this.SocketEmit('gui-query-den-database', query, 'laydulieu_trave', {
                        fn: 'form_staff_editsuccessful',
                        isReload: true,
                        isSuccess: true,
                    });
                }
            }
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let webcam = null;
        if (this.state.isOpenWebcam == true) {
            webcam = 
            <Webcam 
                onClose={() => this.setState({isOpenWebcam: false})}
                onTakePictureCompleted={(data) => {
                    this.setState({
                        image: data,
                        isImageChange: true,
                        fileCapture: true,
                    });
                }}
            />
        }

        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body" ref="body" style={{'width':'500px'}}>
                    <div className="header">
                        <h2>Thêm Nhân Viên</h2>
                    </div>
                    <div className="body">
                        <div>
                            <div className="unsetdivformstyle">
                                <div style={{'text-align': 'center'}}>
                                    <input type="file" name="Hình Ảnh" hidden ref="loadhinh"/>
                                    <img src={this.state.image} name="" ref="uploadimage"
                                        style={{
                                            'margin': 'auto',
                                            'border': '2px solid #969696',
                                            'width': '100px',
                                            'height': '140px',
                                        }}
                                    />
                                    <div style={{
                                        'display': 'grid',
                                        'grid-template-columns': '20% 30% 30% 20%',
                                    }}>
                                        <div></div>
                                        <div onClick={() => this.setState({isOpenWebcam: true})} style={{
                                            'background': '#ccc',
                                            'color': '#8e001e',
                                            'border': '0px solid #ccc',
                                            'border-radius': '20px',
                                            'box-shadow': '1px 1px 4px #33333330',
                                            'margin': '5px 10px',
                                        }}>
                                            <i class="fa fa-video-camera fa-2x" aria-hidden="true"></i>
                                        </div>
                                        <div onClick={this.openFileImage.bind(this)} style={{
                                            'background': '#ccc',
                                            'color': '#8e001e',
                                            'border': '0px solid #ccc',
                                            'border-radius': '20px',
                                            'box-shadow': '1px 1px 4px #33333330',
                                            'margin': '5px 10px',
                                        }}>
                                            <i class="fa fa-folder-open-o fa-2x" aria-hidden="true"></i>
                                        </div>
                                        <div></div>
                                    </div>
                                </div>
                            </div>                                    
                            <div className="divformstyle">
                                <div>
                                    <label for="Họ Và Tên">Họ Và Tên: </label>
                                    <input type="text" name="Họ Và Tên" ref="hovaten"/>
                                </div>
                                <div>
                                    <SoDienThoai
                                        ref="sodienthoai"
                                        onChange={this.onChangeSoDienThoai.bind(this)}
                                        maxlength="11"
                                    />
                                </div>
                                <div>
                                    <label for="Ngày Sinh">Ngày Sinh: </label>
                                    <input type="date" name="Ngày Sinh" ref="ngaysinh"/>
                                </div>
                            </div>
                            <div className="unsetdivformstyle">
                                <label for="">Chức Vụ: </label>
                                <Select
                                    placeholder="--- Chọn Chức Vụ Cho Nhân Viên ---"
                                    ref="chucvu"
                                    value={this.state.permission}
                                    options={this.state.listPermission}
                                    onChange={(v) => {
                                        this.setState({permission: v});
                                    }}
                                />
                            </div>
                            <div className="unsetdivformstyle">
                                <label for="">Cơ Sở: </label>
                                <Select
                                    placeholder="--- Chọn Cơ Sở Làm Việc Cho Nhân Viên ---"
                                    ref="coso"
                                    value={this.state.branch}
                                    options={this.state.listBranch}                                    
                                    onChange={(v) => {
                                        let branch = v;
                                        if (v != null) {
                                            for (let _v of v) {
                                                if (_v.value == 'ALL') {
                                                    branch = [_v]
                                                }
                                            }
                                        }
                                        this.setState({branch: branch});
                                    }}
                                    multi
                                />
                            </div>
                            <div className="divformstyle">
                                <div>
                                    Mã Thẻ:
                                    <input
                                        type="text"
                                        placeholder="Mã thẻ cấp cho nhân viên..."
                                        value={this.state.userUID}
                                        onKeyDown={(e) => {                                           
                                            if ((e.which >= 48 && e.which <= 57)
                                            || (e.which >= 65 && e.which <= 90)
                                            || e.which == 8
                                            || e.which == 46) {
                                            } else {
                                                e.preventDefault();
                                            }                                            
                                        }}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 8) {
                                                this.setState({userUID: e.target.value});
                                            }
                                        }}
                                        disabled={(() => {
                                            if (this.props.userInfo.permission == 'admin') {
                                                return false;
                                            } else {
                                                return true;
                                            }
                                        })()}
                                    />
                                </div>
                                <div>
                                    <label for="">Email: </label>
                                    <input type="text" ref="email" placeholder="example@mail.com"/>
                                </div>
                                <div>
                                    <label for="">Số CMND: </label>
                                    <input type="text" ref="cmnd" disabled={this.state.btnDisable} onBlur={() => {
                                        if (this.state.wasChecked != this.refs.cmnd.value) {
                                            if (this.state.checkcmnd == false
                                            && this.refs.cmnd.value.trim() != '') {
                                                this.setState({
                                                    btnDisable: true,
                                                    checkcmnd: true,
                                                    baotrungcmnd: 'Đang kiểm tra...',
                                                });
                                                let query = 'SELECT * FROM QUANLY WHERE `CMND` = \'!\?!\' ';
                                                if (this.props.data != null) {
                                                    query += 'AND `Mã Quản Lý` != \'!\?!\'; '.replace('!\?!', this.props.data['Mã Quản Lý']);
                                                } else {
                                                    query += '; ';
                                                }
                                                query += 'SELECT * FROM GIAOVIEN WHERE `CMND` = \'!\?!\' ';
                                                if (this.props.data != null) {
                                                    query += 'AND `Mã Giáo Viên` != \'!\?!\'; '.replace('!\?!', this.props.data['Mã Giáo Viên']);
                                                } else {
                                                    query += '; ';
                                                }
                                                query = query.replace(/!\?!/g, this.refs.cmnd.value)
                                                this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                                    fn : 'form_staff_checkcmnd',
                                                });
                                            } else {
                                                this.refs.cmnd.style.borderColor = 'rgb(204, 204, 204)';
                                                this.setState({
                                                    cmnd: null,
                                                    _cmnd: null,
                                                    baotrungcmnd: '',
                                                });
                                            }
                                        }
                                    }}/>
                                    {(() => {
                                        let checking = null;
                                        if (this.state.checkcmnd) {
                                            checking = <FontAwesomeIcon icon={faSpinner} spin/>
                                        }
                                        if (this.state.baotrungcmnd != '') {
                                            return (
                                                <span style={{'color': 'red'}}>
                                                    {checking}
                                                    <i>{this.state.baotrungcmnd}</i>
                                                </span>
                                            )
                                        }
                                    })()}
                                </div>
                            </div>
                            <div className="unsetdivformstyle">
                                <DiaChi getMe={(me) => this.diachi = me}/>
                                <div className="divformstyle">
                                    <input type="text" ref="other_diachi" placeholder="Nhập địa chỉ ở dây nếu không có sẵn ở mục trên"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <Button 
                            onClick={this.close.bind(this)}
                            value="Thoát"
                            icon="close"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnCloseDisable}
                        />
                        <Button 
                            onClick={this.dongy.bind(this)}
                            value="Đồng Ý"
                            icon="agree"
                            style={{'float': 'right', 'margin-right': '10px',}}
                            disabled={this.state.btnDisable}
                        />
                    </div>
                </div>
                {webcam}
            </div>
        )
    }

    openFileImage () {
        let that = this;
        let fileSelector = this.refs.loadhinh;
        fileSelector.addEventListener('change', function(evt){
          var files = evt.target.files; // FileList object
    
          // Loop through the FileList and render image files as thumbnails.
          for (var i = 0, f; f = files[i]; i++) {
            // Only process image files.
            if (!f.type.match('image.*')) {
              continue;
            }
    
            var reader = new FileReader();
    
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
              return function(e) {
                // Render thumbnail.
                that.setState({
                    image: e.target.result,
                    isImageChange: true,
                    fileCapture: false,
                });
              };
            })(f);
    
            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
          }
        }, false);
        fileSelector.click();
        return false;
    }

    onChangeSoDienThoai (e) {
        
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
      userInfo: state.userinformation,
    };
}) (Staff);
