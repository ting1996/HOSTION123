import React from 'react';
import { connect } from 'react-redux';
var ReactDOM = require('react-dom');
import mystyle from './style.css';
import Table from '../elements/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import dutrustyle from './styledutru.css';

class DuTru extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            header: [],
            data: [],

            showInformation: false,
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
        if (hanhdong == 'laydulieu_trave') {
            if (dulieuguive != null) {
                switch (dulieuguive.fn) {
                    case 'form_bieuphi_quydinhdutru':
                        if (rows[0] != null) {
                            let header = [
                                {
                                    label: 'Mục',
                                    columnName: 'title',
                                    type: 'string',
                                },
                                {
                                    label: 'Ghi Chú',
                                    columnName: 'notes',
                                    type: 'string',
                                },
                            ];

                            let data = []
                            for (let row of rows) {
                                row.childRows = [];
                                if (row.parent == null) {
                                    data.push(row);
                                } else {
                                    let findArray = data;
                                    let parent = row.parent.split(' ');
                                    let check = false;
                                    for (let i = 0; i < parent.length; i++) {
                                        let j = 0
                                        let next = false;
                                        for (; j < findArray.length; j++) {
                                            if (findArray[j].code == parent[i]) {
                                                findArray = findArray[j].childRows;
                                                next = true;
                                                if (i == (parent.length - 1)) {
                                                    check = true;
                                                    break;
                                                }
                                                break;
                                            }
                                        }
                                        if (j == findArray.length
                                        && !next) {
                                            data.push(row);
                                            break;
                                        }
                                        
                                    }
                                    if (check) {
                                        findArray.push(row);
                                    }
                                }
                            }
                            this.setState({
                                header: header,
                                data: data,
                            })
                        } else {
                            this.props.dispatch({
                                type: 'ALERT_NOTIFICATION_ADD',
                                content: 'Không tìm thấy quy định dự trù!',
                                notifyType: 'warning',
                            })
                        }
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

        query = 'SELECT * FROM DUTRU ' +
        'WHERE `isDeactived` = \'0\' ' +
        'ORDER BY parent ASC, code + 0 ASC; ';
        this.SocketEmit('gui-query-den-database', query , 'laydulieu_trave', {
            fn : 'form_bieuphi_quydinhdutru',
        });
    }

    componentWillUnmount() {
        this.props.socket.off('tra-ve-du-lieu-tu-database', this.callBackDataFormDatabase);
    }

    componentDidUpdate(prevProps, prevState) {
    }

    dongy () {

    }

    close () {
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
    }

    render () {
        return (
            <div
                className={mystyle.tabContent}
                style={{
                    position: 'relative',
                }}
            >
                {/* Bang thong tin du tru */}
                <div style={{
                    position: 'absolute',
                    left: (() => {
                        if (this.state.showInformation) {
                            return 'calc(100% - 845px)';
                        }
                        return 'calc(100% - 20px)';
                    })(),
                    display: 'grid',
                    gridTemplateColumns: '20px 825px',
                    transition: '0.3s',
                }}> 
                    <div 
                        className={dutrustyle.buttonShowHide}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: '0.3s',
                            transform: (() => {
                                if (this.state.showInformation) {
                                    return 'rotate(-180deg)';
                                }
                                return 'rotate(0deg)';
                            })(),
                        }}
                        onClick={() => {
                            this.setState({
                                showInformation: !this.state.showInformation,
                            })
                        }}
                    >
                        <FontAwesomeIcon icon={faChevronLeft}/>
                    </div>
                    <Table
                        header={this.state.header}
                        data={this.state.data}
                        style={{
                            height: '700px',
                        }}
                        styleHeader={{}}
                        styleContent={{}}
                    />
                </div>

                {/* Noi dung chinh */}
                <div>
                    Dự Trù Tháng ?
                </div>
                <div>
                    Xin Phe Duyet
                </div>
                <div>
                    Chinh Sua
                </div>
            </div>
        )
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (DuTru);
