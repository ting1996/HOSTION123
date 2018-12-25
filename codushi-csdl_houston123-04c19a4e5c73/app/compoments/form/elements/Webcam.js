import React from 'react';
import { connect } from 'react-redux';
import style from '../style.css';

class Webcam extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listDevices: [],
        }
        this.changeSize = this.changeSize.bind(this);
        this.webcamError = this.webcamError.bind(this);
    }

    changeSize () {
        if (window.innerHeight < this.refs.body.offsetHeight) {
            this.refs.background.style.paddingTop = '0px';
        } else {
            this.refs.background.style.paddingTop = ((window.innerHeight - this.refs.body.offsetHeight) / 2) + 'px';
        }
    }

    webcamError (err) {
        this.props.dispatch({
            type: 'ALERT_NOTIFICATION_ADD',
            content: 'Lỗi webcam: ' + err,
            notifyType: 'error',
        });
        this.close();
    }
    
    webcamTakePic () {
        let that = this;
        window.Webcam.snap(function(data_uri) {
            try {
                that.props.onTakePictureCompleted(data_uri);
                that.close();
            } catch (e) {
                that.webcamError(e);
            }
        });
    }

    componentDidMount () {
        let that = this;
        window.addEventListener("resize", this.changeSize);
        this.changeSize();

        // console.log(this.props.userid);
        navigator.mediaDevices.enumerateDevices()
        .then(v => {
            let listDevices = this.state.listDevices;
            for (var i = 0; i !== v.length; ++i) {
                var deviceInfo = v[i];
                if (deviceInfo.kind === 'videoinput') {
                    let label = deviceInfo.label || 'Camera ' + (videoSelect.length + 1);
                    listDevices.push(<option value={deviceInfo.deviceId}>{label}</option>)                    
                }
            }
            this.setState({
                listDevices: listDevices,
            })
        })
        .catch(e => {
            that.webcamError(e);
        });
        
        window.Webcam.set('constraints', {
            width: 457,
            height: 640,
        });
        window.Webcam.attach('#form_hocsinh_ghidanh_cameraliveview');
        window.Webcam.on('error', this.webcamError);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.changeSize);
        window.Webcam.off('error', this.webcamError);
        window.Webcam.reset();
    }

    componentDidUpdate(prevProps, prevState) {
        this.changeSize();
    }

    close () {
        try {
            this.props.onClose();
        } catch (e) {
            this.props.dispatch({
                type: 'ALERT_NOTIFICATION_ADD',
                content: 'Lỗi webcam: ' + e,
                notifyType: 'error',
            });
        }
    }

    render () {
        return (
            <div className={style.formstyle} ref="background">
                <div className="form_body popup" ref="body">
                    <div className="header">
                        <h2 style={{'margin': '5px', 'color': '#444'}}>Ghi Hình</h2>
                        <div onClick={this.close.bind(this)} style={{
                            'position': 'absolute',
                            'top': '10px',
                            'right': '10px',
                            'color': '#444',
                            'text-shadow': '1px 1px 4px #ccc',
                        }}>
                            <i class="fa fa-times fa-lg" aria-hidden="true"></i>
                        </div>
                    </div>
                    <div>
                        <div className="divformstyle">
                            <div>                                
                                <select onChange={(v => {
                                    window.Webcam.set('constraints', {
                                        width: 457,
                                        height: 640,
                                        deviceId: v.target.value ? {exact: v.target.value} : null,
                                    });
                                    window.Webcam.reset();
                                    window.Webcam.attach('#form_hocsinh_ghidanh_cameraliveview');
                                })}>
                                    {this.state.listDevices.map(v => {
                                        return v;
                                    })}
                                </select>
                            </div>
                        </div>
                        <div 
                            id="form_hocsinh_ghidanh_cameraliveview"
                            style={{
                                'margin': 'auto',
                                'width': '480px',
                                'height': '640px',
                                'padding': '0',
                            }}
                            onClick={this.webcamTakePic.bind(this)}
                        >
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = connect() (Webcam);
