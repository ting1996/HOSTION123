import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faAngleDown,
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../form/elements/Button';

class DangKyMonHoc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showfull: false,
            image: null,
        }
        this.callBackWebDav = this.callBackWebDav.bind(this);
        this.SocketEmit = this.SocketEmit.bind(this);
    }

    SocketEmit () {
        if (arguments[0] == 'gui-query-den-database') {
            if (arguments[3] != null) {
                arguments[3].overlayLayer = false;
            }
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

    callBackWebDav (data, err) {
        switch (data.key) {
            case 'notification_notes_cskh_' + this.props.index:
                let image = 'img/man.png';
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
        this.props.socket.on('webdav', this.callBackWebDav);
        this.props.socket.emit('webdav', {
            fn: 'read',
            url: '/Public/img/avatar/' + this.props.data.senderImage,
            key: 'notification_notes_cskh_' + this.props.index,
            imageType: 'image/jpeg',
        });
    }

    componentWillUnmount() {
        this.props.socket.off('webdav', this.callBackWebDav);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    render () {
        let date = new Date(this.props.data['Ngày Gọi']);
        let time = ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2);
        date = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + ' ' + time;
        let showmore = null;
        let styleicon = {'transition': '0.5s'}
        if (this.state.showfull) {
            styleicon = {
                'transition': '0.5s',
                'transform': 'rotate(-180deg)',
            }
            showmore = 
            <div style={{
                'display': 'grid',
                'grid-template-columns': '50% 50%',
            }}>
                <div>
                    
                </div>
                <div style={{
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                }}>
                    <Button
                        value="Phản Hồi"
                        icon="reply"
                        onClick={() => {
                            let id = this.props.data['ID'];
                            let query = 'SELECT * FROM REPORTCSKH_VIEW WHERE REPORTCSKH_VIEW.`ID` = \'!\?!\' ';
                            query = query.replace('!\?!', id);
                            this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
                                fn: 'home_body_response_cskh_kiemtranguoiphanhoi',
                            });
                        }}
                        style={{

                        }}
                    />
                </div>
            </div>
        }

        let borderRight = null;
        if (this.props.data != null
        && this.props.data['Phân Loại Mức Độ'] != 0) {
            borderRight = '5px solid red';
        }
        return (
            <div>
                <div style={{
                    'display': 'grid',
                    'grid-template-columns': '75px auto',
                    borderRight: borderRight,
                }}>
                    <div style={{'padding': '7px'}}>
                        <img 
                            src={this.state.image}
                            alt={this.props.data['Họ Và Tên Nhân Viên']}
                            style={{
                                'width': '61px',
                                'height': '61px',
                                'border-radius': '100%',
                            }}
                        />
                    </div>
                    <div>
                        <div>
                            <b>{this.props.data['Mã Nhân Viên'] + ' - ' + this.props.data['Họ Và Tên Nhân Viên']}</b>
                        </div>
                        <div style={{
                            'display': 'grid',
                            'grid-template-columns': 'auto 30px',
                        }}>
                        <div>
                            {(() => {
                                if (this.state.showfull) {
                                    return (
                                        <div>
                                            {this.props.data['Nội Dung Cuộc Gọi']}
                                        </div>
                                    )
                                } else {
                                    let value = this.props.data['Nội Dung Cuộc Gọi'];
                                    let n = 50;
                                    if (value.length > n) {
                                        value = value.substring(0, n) + '...';
                                    }
                                    return (
                                        <div>
                                            {value}
                                        </div>
                                    )
                                }
                            })()}
                            <div>
                                {date}
                            </div>
                        </div>
                        <div style={{'text-align': 'center'}}>
                            <FontAwesomeIcon
                                icon={faAngleDown}
                                onClick={() => this.setState({showfull: !this.state.showfull})}
                                style={styleicon}
                            />
                        </div>
                    </div>
                    </div>                    
                </div>
                {showmore}
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (DangKyMonHoc);
