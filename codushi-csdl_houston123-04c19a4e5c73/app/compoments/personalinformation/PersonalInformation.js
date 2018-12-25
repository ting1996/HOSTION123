import React from 'react';
import { connect } from 'react-redux';
import style from './style.css';
var ReactDOM = require('react-dom');
import SoDienThoai from '../form/elements/SoDienThoai';
import Webcam from '../form/elements/Webcam';

class PersonalInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myinfo: [],
            type: null,
            image: 'img/image_upload.png',
            isImageChange: false,
            imageCapture: false,
            isOpenWebcam: false,
        }
        this.callBackDataFormDatabase = this.callBackDataFormDatabase.bind(this);
        this.callBackWebDav = this.callBackWebDav.bind(this);
        this.changeSize = this.changeSize.bind(this);
    }

    changeSize () {
        if (window.innerHeight < this.refs.body.offsetHeight) {
            this.refs.background.style.paddingTop = '0px';
        } else {
            this.refs.background.style.paddingTop = ((window.innerHeight - this.refs.body.offsetHeight) / 2) + 'px';
        }
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

    callBackDataFormDatabase (rows, hanhdong, dulieuguive ) {
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'peronalnformation_suathanhcong':
                        this.close();
                        break;
                    default:
                        
                }                
            }
        }  
    }

    callBackWebDav (data, err) {
        switch (data.key) {
            case 'peronalnformation_loadhinhanh':
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
        window.addEventListener("resize", this.changeSize);
        this.changeSize();
        this.props.socket.on('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.on('webdav', this.callBackWebDav);
        if (this.props.data != null) {
            let data = null;
            if (this.props.data[0][0] != null) {
                this.props.data[0][0]['Mã'] = this.props.data[0][0]['Mã Quản Lý'];
                data = this.props.data[0][0];
                this.setState({
                    myinfo: this.props.data[0][0],
                    type: 'quanly',
                });
            } else if (this.props.data[1][0] != null) {
                this.props.data[1][0]['Mã'] = this.props.data[1][0]['Mã Giáo Viên'];
                data = this.props.data[1][0];
                this.setState({
                    myinfo: this.props.data[1][0],
                    type: 'giaovien',
                });
            } else {
                this.close();
                return;                
            }

            if (data != null) {
                this.props.socket.emit('webdav', {
                    fn: 'read',
                    url: '/Public/img/avatar/' + data['Hình Ảnh'],
                    key: 'peronalnformation_loadhinhanh',
                    imageType: 'image/jpeg',
                });
                // this.refs.tendangnhap.value = data[''];
                this.sodienthoai.state.value = data['Số Điện Thoại'];
                this.refs.diachi.value = data['Địa Chỉ'];
                this.refs.cmnd.value = data['CMND'];
                this.refs.email.value = data['Email'];                
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
        this.props.socket.off('webdav', this.callBackWebDav);
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
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
                    imageCapture: false,
                    isImageChange: true,
                })
              };
            })(f);
    
            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
          }
        }, false);
        fileSelector.click();
        return false;
    }

    dongy () {
        let oldvalue = this.state.myinfo;
        // this.refs.tendangnhap.value = data[''];
        let checkfaile = false;
        let sodienthoai = this.sodienthoai.state.value;
        this.sodienthoai.refs.input.style.borderColor = 'rgb(204, 204, 204)';
        if (sodienthoai == '') {
            this.sodienthoai.refs.input.style.borderColor = 'red';
            checkfaile = true;
        }
        let diachi = this.refs.diachi.value;
        this.refs.diachi.style.borderColor = 'rgb(204, 204, 204)';
        if (diachi == '') {
            this.refs.diachi.style.borderColor = 'red';
            checkfaile = true;
        }
        let cmnd = this.refs.cmnd.value;
        this.refs.cmnd.style.borderColor = 'rgb(204, 204, 204)';
        if (cmnd == '') {
            this.refs.cmnd.style.borderColor = 'red';
            checkfaile = true;
        }
        let email = this.refs.email.value;
        this.refs.email.style.borderColor = 'rgb(204, 204, 204)';
        if (email == '') {
            this.refs.email.style.borderColor = 'red';
            checkfaile = true;
        }

        if (checkfaile) {
            return;
        } else {
            let query;
            if (this.state.type == 'quanly') {
                query  = 'UPDATE `quanlyhocsinh`.`ACCOUNT` SET `hinhanh`=\'~\' WHERE `account_id`=\'?\'; ' +
                'UPDATE `quanlyhocsinh`.`QUANLY` SET `Hình Ảnh`=\'~\', `Số Điện Thoại`=\'?\', `Địa Chỉ`=\'?\', `Email`=\'?\', `CMND`=\'?\' WHERE `STT`=\'?\' AND `Mã Quản Lý`=\'?\'';
            } else if (this.state.type == 'giaovien') {
                query  = 'UPDATE `quanlyhocsinh`.`ACCOUNT` SET `hinhanh`=\'~\' WHERE `account_id`=\'?\'; ' +
                'UPDATE `quanlyhocsinh`.`GIAOVIEN` SET `Hình Ảnh`=\'~\', `Số Điện Thoại`=\'?\', `Địa Chỉ`=\'?\', `Email`=\'?\', `CMND`=\'?\' WHERE `STT`=\'?\' and`Mã Giáo Viên`=\'?\'';
            } else {
                this.close();
                return;
            }
            
            query = query.replace('?', oldvalue['Mã']);
            query = query.replace('?', sodienthoai);
            query = query.replace('?', diachi);
            query = query.replace('?', email);
            query = query.replace('?', cmnd);
            query = query.replace('?', oldvalue['STT']);
            query = query.replace('?', oldvalue['Mã']);

            let that = this;
            if (this.state.isImageChange) {
                var fd = new FormData();
                if (this.state.imageCapture) {
                    fd.append('image', this.dataURItoBlob(this.state.image));
                } else {
                    fd.append('file', this.refs.loadhinh.files[0]);
                }
                fd.append('oldimagename', oldvalue['Hình Ảnh']);
                $.ajax({
                    url: '/trangchu/reupimage',
                    type: 'post',
                    enctype:'multipart/form-data',
                    data: fd,
                    processData: false,
                    contentType: false,
                    statusCode: {
                        200: function (response) {
                            query = query.replace(/~/g, response);
                            $('.loading').show();
                            that.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                                fn: 'peronalnformation_suathanhcong',
                                isReload: true,
                                isSuccess: true,
                                isImageChange: that.state.isImageChange,
                                imageLink: response,
                            });
                        },
                        400: function (response) {
                            that.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Lỗi khi resize ảnh: ' + response.responseText,
                                notifyType: 'error',
                            })
                        },
                        501: function (response) {
                            that.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: response.responseText,
                                notifyType: 'error',
                            })
                        },
                    },
                    success : function(response){
                    }
                });
            } else {
                query = query.replace(/~/g, oldvalue['Hình Ảnh']);
                $('.loading').show();
                this.props.socket.emit('gui-query-den-database', query, 'laydulieu_trave', {
                    fn: 'peronalnformation_suathanhcong',
                    isReload: true,
                    isSuccess: true,
                });
            }
        }
    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        let title = null;
        if (this.state.myinfo != null) {
            title = this.state.myinfo['Mã'] + ' - ' + this.state.myinfo['Họ Và Tên'];
        }

        let blockeditemail = true;
        if (this.state.type == 'quanly') {
            blockeditemail = false;
        }

        let webcam = null;
        if (this.state.isOpenWebcam == true) {
            webcam = 
            <Webcam 
                onClose={() => this.setState({isOpenWebcam: false})}
                onTakePictureCompleted={(data) => {
                    this.setState({
                        image: data,
                        isImageChange: true,
                        imageCapture: true,
                    });
                }}
            />
        }

        return (
            <div className={style.formstyle2} ref="background">
                <div className={style.background} ref="body">
                    <div className={style.header}>
                        { /*<img src="" alt="Icon Image"/> */}
                        <h2>{title}</h2>
                    </div>
                    <div className={style.body}>
                        <div className='divformstyle' style={{
                            'padding': '0px 10px',
                            'margin': '0',
                            'display': 'grid',
                            'grid-template-columns': '30% 70%',
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
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
                                        'grid-template-columns': '50% 50%',
                                        padding: '0',
                                    }}>
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
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                padding: '0',
                            }}>
                                <div>
                                    <label for="">Tên Đăng Nhập: </label>
                                    <input type="text" name="Tên Đăng Nhập" ref="tendangnhap" disabled={true}/>
                                </div>
                                <div>
                                    <SoDienThoai getMe={me => this.sodienthoai = me}/>
                                </div>
                                <div>
                                    <label for="">Địa Chỉ: </label>
                                    <input type="text" name="Địa Chỉ" ref="diachi"/>
                                </div>
                                <div>
                                    <label for="">CMND: </label>
                                    <input type="text" name="CMND" ref="cmnd"/>
                                </div>
                                <div>
                                    <label for="">Email: </label>
                                    <input type="text" name="Email" ref="email" disabled={blockeditemail}/>
                                </div>
                            </div>
                            <div style={{
                                'padding': '5px 0px',
                                'margin': '0',
                                'display': 'grid',
                                'grid-template-columns': '20% 30% 30% 20%',
                                'grid-column-start': '1',
                                'grid-column-end': '3',
                            }}>
                                <div></div>
                                <input style={{
                                    'margin': 'auto'
                                }} type="button" onClick={this.dongy.bind(this)} value="Đồng Ý"/>
                                <input style={{
                                    'margin': 'auto'
                                }} type="button" onClick={this.close.bind(this)} value="Thoát"/>
                                <div></div>
                            </div>
                        </div>
                    </div>
                    <div className={style.footer}>
                    </div>
                </div>
                {webcam}
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
  }) (PersonalInformation);
