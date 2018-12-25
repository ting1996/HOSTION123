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
    }

    callBackWebDav (data, err) {
        switch (data.key) {
            case 'notification_notes_task_' + this.props.index:
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
            key: 'notification_notes_task_' + this.props.index,
            imageType: 'image/jpeg',
        });
    }

    componentWillUnmount() {
        this.props.socket.off('webdav', this.callBackWebDav);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    render () {
        let date = new Date(this.props.data['StartTime']);
        let time = ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2);
        date = date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2) + ' ' + time;
        let showmore = null;
        let styleicon = {'transition': '0.5s'};
        let content = 
        <div>
            {this.props.data['Title']}
        </div>;
        if (this.state.showfull) {
            styleicon = {
                'transition': '0.5s',
                'transform': 'rotate(-180deg)',
            }
            content = 
            <div>
                <div>
                    {this.props.data['Title']}
                </div>
                <div>
                    Nội dung: {this.props.data['Content']}
                </div>
            </div>
            showmore = 
            <div style={{
                'display': 'grid',
                'grid-template-columns': '50% 50%',
            }}>
                <div style={{
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                }}>
                    <Button
                        value="Báo Cáo"
                        icon="reply"
                        onClick={() => {

                        }}
                        style={{

                        }}
                    />
                </div>
                <div style={{
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                }}>
                    <Button
                        value="Xem"
                        icon="eye"
                        onClick={() => {
                            let obj = this.props.data;
                            let query = 'UPDATE `quanlyhocsinh`.`TASKSASSIGN` SET `isRead`=\'1\' WHERE `ID`=\'!\?!\';'
                            query = query.replace('!\?!', obj['tasksAssignID']);
                            this.props.socket.emit('gui-query-den-database', query , 'laydulieu_trave', {
                                isReloadNotification: true,
                                to: 'users',
                                IDs: [$('#lable_button_nexttoicon').attr('value')],
                                fn: 'dailynotification',
                                elements: ['tasks']
                            });
                        }}
                        style={{

                        }}
                    />
                </div>
            </div>
        }
        return (
            <div>
                <div style={{
                    'display': 'grid',
                    'grid-template-columns': '75px auto',
                }}>
                    <div style={{'padding': '7px'}}>
                        <img 
                            src={this.state.image}
                            alt={this.props.data['senderName']}
                            style={{
                                'width': '61px',
                                'height': '61px',
                                'border-radius': '100%',
                            }}
                        />
                    </div>
                    <div>
                        <div>
                            <b>{this.props.data['From'] + ' - ' + this.props.data['senderName']}</b>
                        </div>
                        <div style={{
                            'display': 'grid',
                            'grid-template-columns': 'auto 30px',
                        }}>
                            <div>
                                {content}
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
