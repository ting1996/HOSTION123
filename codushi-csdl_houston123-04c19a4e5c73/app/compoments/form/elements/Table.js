{/* <Table
   header={this.state.header}
   data={this.state.data}
   indexStart={this.state.LimitStart + 1} //Vị trí xuất phát của số tứ tự ví dụ ("1" -> 2 -> 3, "21" -> 22 -> 23)
   isShowNumber //Hiện số thứ tự
   isShowImageAvatar // Hiểu thị avatar
   onRowsRightClick={{}}
   style={{}}
   styleHeader={{}}
   styleContent={{
       height: '500px',
   }}
/>

type: string, date, image

header[0] = {
   label: key,
   columnName: key,
   type: type,
}

data[0].childRows (Là các dòng con của data[0], các childRows có thể có thêm các childRows thấp hơn nữa);
data[0].innerElements = {
    image: url, (Hình ảnh đính kèm bên trong cells)
}
*/}


import React from 'react';
import { Provider, connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLevelDownAlt,
} from '@fortawesome/free-solid-svg-icons';

import mystyle from './styletable.css';

class Row extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listElements: {},
            listInnerElements: {},
        }
        this.callBackWebDav = this.callBackWebDav.bind(this);
    }

    callBackWebDav (data, err) {
        let listElements = this.state.listElements;
        for (let key in this.state.listInnerElements) {
            switch (data.key) {
                case 'form_elements_table_row_loadhinhanh_avatar_' + this.state.listInnerElements[key].image + this.props.index: {
                    let image = 'img/image_upload.png';
                    if (!err) {
                        let arrayBufferView = data.buffer;
                        let blob = new Blob( [ arrayBufferView ], { type: data.imageType } );
                        let urlCreator = window.URL || window.webkitURL;
                        let imageUrl = urlCreator.createObjectURL( blob );
                        image = imageUrl;
                    }
                    if (listElements[key] == null) {
                        listElements[key] = {
                            image:
                            <img 
                                src={image}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '100%',
                                }}
                                onMouseOver={(e) => {
                                    try {
                                        this.props.imageEnter(image, e)
                                    } catch (error) {
                                    }
                                }}
                                onMouseOut={() => {
                                    try {
                                        this.props.imageEnter(null)
                                    } catch (error) {
                                    }
                                }}
                            />,
                        }
                    } else {
                        listElements[key].image =
                        <img 
                            src={image}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '100%',
                            }}
                            onMouseOver={(e) => {
                                try {
                                    this.props.imageEnter(image, e)
                                } catch (error) {
                                }
                            }}
                            onMouseOut={() => {
                                try {
                                    this.props.imageEnter(null)
                                } catch (error) {
                                }
                            }}
                        />
                    }
                    this.setState({listElements: listElements});
                } break;
                case 'form_elements_table_row_loadhinhanh_' + this.state.listInnerElements[key].image + this.props.index: {
                    let image = 'img/image_upload.png';
                    if (!err) {
                        let arrayBufferView = data.buffer;
                        let blob = new Blob( [ arrayBufferView ], { type: data.imageType } );
                        let urlCreator = window.URL || window.webkitURL;
                        let imageUrl = urlCreator.createObjectURL( blob );
                        image = imageUrl;
                    }
                    if (listElements[key] == null) {
                        listElements[key] = {
                            image:
                            <img 
                                src={image}
                                style={{
                                    height: '100px',
                                }}
                                onMouseOver={(e) => {
                                    try {
                                        this.props.imageEnter(image, e)
                                    } catch (error) {
                                    }
                                }}
                                onMouseOut={() => {
                                    try {
                                        this.props.imageEnter(null)
                                    } catch (error) {
                                    }
                                }}
                            />,
                        }
                    } else {
                        listElements[key].image =
                        <img 
                            src={image}
                            style={{
                                height: '100px',
                            }}
                            onMouseOver={(e) => {
                                try {
                                    this.props.imageEnter(image, e)
                                } catch (error) {
                                }
                            }}
                            onMouseOut={() => {
                                try {
                                    this.props.imageEnter(null)
                                } catch (error) {
                                }
                            }}
                        />
                    }
                    this.setState({listElements: listElements});
                } break;
                default:                        
            }
        }
    }

    componentDidMount () {
        this.props.socket.on('webdav', this.callBackWebDav);
        let listInnerElements = {};
        this.props.header.map((v, i) => { 
            if (this.props.data[v.columnName] != null
            && this.props.data[v.columnName].innerElements != null) {
                listInnerElements[v.columnName] = this.props.data[v.columnName].innerElements;
            }
        })
        this.setState({
            listInnerElements: listInnerElements,
        })
    }

    componentWillUnmount() {
        this.props.socket.off('webdav', this.callBackWebDav);
    }

    componentDidUpdate(prevProps, prevState) {
        let listInnerElements = {};
        this.props.header.map((v, i) => {
            if (this.props.data[v.columnName] != null
            && this.props.data[v.columnName].innerElements != null) {
                listInnerElements[v.columnName] = this.props.data[v.columnName].innerElements;
            }
            switch (v.type) {
                case 'image': {
                    listInnerElements[v.columnName] = {image: this.props.data[v.columnName], isElement: true,}
                } break;
            }
        })
        if (JSON.stringify(listInnerElements) != JSON.stringify(this.state.listInnerElements)) {
            this.setState({
                listInnerElements: listInnerElements,
                listElements: {},
            })
        }

        if (JSON.stringify(prevState.listInnerElements) != JSON.stringify(this.state.listInnerElements)) {        
            for (let key in this.state.listInnerElements) {
                if (this.state.listInnerElements.hasOwnProperty(key)) {
                    let innerElements = this.state.listInnerElements[key];
                    if (innerElements.image != null) {
                        if (innerElements.isElement) {
                            this.props.socket.emit('webdav', {
                                fn: 'read',
                                url: '/Public/img/timekeeper/' + innerElements.image,
                                key: 'form_elements_table_row_loadhinhanh_' + innerElements.image + this.props.index,
                                imageType: 'image/jpeg',
                            });
                        } else {
                            this.props.socket.emit('webdav', {
                                fn: 'read',
                                url: '/Public/img/avatar/' + innerElements.image,
                                key: 'form_elements_table_row_loadhinhanh_avatar_' + innerElements.image + this.props.index,
                                imageType: 'image/jpeg',
                            });
                        }
                    }
                }
            }
        }
    }

    render () {
        let childRows = this.props.data.childRows;
        if (childRows == null
        || !Array.isArray(childRows)
        || childRows.length == 0) {
            return (
                <div
                    className={this.props.className}
                    style={this.props.style}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        this.props.onRowsRightClick(this.props.data);
                    }}
                >
                    {
                        this.props.header.map((v1, i1) => {
                            let value;
                            let element;
                            switch (v1.type) {
                                case 'image': {
                                    value = null;
                                } break;
                                case 'date': {
                                    if (this.props.data[v1.columnName] != null) {
                                        value = new Date(this.props.data[v1.columnName]);
                                        value = ('0' + value.getDate()).slice(-2) + '/' + ('0' + (value.getMonth() + 1)).slice(-2) + '/' + value.getFullYear();
                                    }
                                } break;
                                case 'datetime': {
                                    if (this.props.data[v1.columnName] != null) {
                                        value = new Date(this.props.data[v1.columnName]);
                                        value = ('0' + value.getHours()).slice(-2) + ':' + ('0' + value.getMinutes()).slice(-2) + ':' + ('0' + value.getSeconds()).slice(-2) + ' ' + ('0' + value.getDate()).slice(-2) + '/' + ('0' + (value.getMonth() + 1)).slice(-2) + '/' + value.getFullYear();
                                    }
                                } break;
                                case 'order': {
                                    value = this.props.index;
                                } break;
                                default:
                                    if (this.props.data[v1.columnName] != null
                                    && this.props.data[v1.columnName].value != null) {
                                        value = this.props.data[v1.columnName].value
                                    } else {
                                        value = this.props.data[v1.columnName];
                                    }
                                    break;
                            }
                            let style = null;
                            if (i1 == 0) {
                                style = {
                                    marginLeft: this.props.leftSpace + 'px',
                                }
                            }
                            let innerElements = [];
                            if (this.state.listElements[v1.columnName] != null) {
                                for (let key in this.state.listElements[v1.columnName]) {
                                    if (this.state.listElements[v1.columnName].hasOwnProperty(key)) {
                                        innerElements.push(this.state.listElements[v1.columnName][key])
                                    }
                                }
                            }
                            if (element == null) {
                                element = <span>{value}</span>
                            }
                            return (
                                <div style={style} title={value}>
                                    {innerElements.map(v => {
                                        return (
                                            <div style={{
                                                paddingRight: '5px',
                                            }}>
                                                {v}
                                            </div>
                                        )
                                    })}
                                    {element}
                                </div>
                            );
                        })
                    }
                </div>
            );
        }         
        return (
            <div>
                <div
                    className={this.props.className + ' ' + mystyle.parent}
                    style={{
                        ...this.props.style,
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        this.props.onRowsRightClick(this.props.data);
                    }}
                >
                    {
                        this.props.header.map((v1, i1) => {
                            if (v1.hidden != true) {
                                let value;
                                let element;
                                switch (v1.type) {
                                    case 'image': {
                                        value = null;
                                    } break;
                                    case 'date': {
                                        if (this.props.data[v1.columnName] != null) {
                                            value = new Date(this.props.data[v1.columnName]);
                                            value = ('0' + value.getDate()).slice(-2) + '/' + ('0' + (value.getMonth() + 1)).slice(-2) + '/' + value.getFullYear();
                                        }
                                    } break;
                                    case 'datetime': {
                                        if (this.props.data[v1.columnName] != null) {
                                            value = new Date(this.props.data[v1.columnName]);
                                            value = ('0' + value.getHours()).slice(-2) + ':' + ('0' + value.getMinutes()).slice(-2) + ':' + ('0' + value.getSeconds()).slice(-2) + ' ' + ('0' + value.getDate()).slice(-2) + '/' + ('0' + (value.getMonth() + 1)).slice(-2) + '/' + value.getFullYear();
                                        }
                                    } break;
                                    case 'order': {
                                        value = this.props.index;
                                    } break;
                                    default:
                                        if (this.props.data[v1.columnName] != null
                                        && this.props.data[v1.columnName].value != null) {
                                            value = this.props.data[v1.columnName].value
                                        } else {
                                            value = this.props.data[v1.columnName];
                                        }
                                        break;
                                }
                                let style = null;
                                let icon = null;
                                if (i1 == 0) {
                                    style = {
                                        marginLeft: this.props.leftSpace + 'px',
                                    }
                                    icon = 
                                    <span style={{padding: '0px 5px 0px 0px'}}>
                                        <FontAwesomeIcon icon={faLevelDownAlt} flip="horizontal"/>
                                    </span>
                                }
                                let innerElements = [];
                                if (this.state.listElements[v1.columnName] != null) {
                                    for (let key in this.state.listElements[v1.columnName]) {
                                        if (this.state.listElements[v1.columnName].hasOwnProperty(key)) {
                                            innerElements.push(this.state.listElements[v1.columnName][key])
                                        }
                                    }
                                }
                                if (element == null) {
                                    element = <span>{value}</span>
                                }
                                return (
                                    <div style={style} title={value}>
                                        {icon}
                                        {innerElements.map(v => {
                                            return (
                                                <div style={{
                                                    paddingRight: '5px',
                                                }}>
                                                    {v}
                                                </div>
                                            )
                                        })}
                                        {element}
                                    </div>
                                );
                            }
                        })
                    }
                </div>
                <div>
                {
                    childRows.map((v, i) => {
                        return (
                            <Row
                                className={this.props.className}
                                style={this.props.style}
                                onRowsRightClick={(data, location) => {
                                    this.props.onRowsRightClick(data, location);
                                }}
                                imageEnter={this.props.imageEnter}
                                header={this.props.header}
                                data={v}
                                index={this.props.index + '.' + (i + 1)}
                                leftSpace={this.props.leftSpace + 15}
                                socket={this.props.socket}
                            />
                        )
                    })
                }
                </div>
            </div>
        );
    }
}
class Table extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mouseCursor: 'e-resize',
            isClick: false,
            widthCols: [],
            gridTempCols: null,
            targetElement: null,
            colChange: null,
            min: 100,
            header: null,
            headerShow: null,
            rowRightClick: null,
            isRightClick: false,
            rightClickLocation: null,
            imageAvatar: null,
            mouseOverImageAvatar: false,
            mouseOutImageAvatar: false,
        }
        this.windowMouseUp = this.windowMouseUp.bind(this)
        this.windowMouseMove = this.windowMouseMove.bind(this)
    }

    componentDidMount () {
        window.addEventListener("mousemove", this.windowMouseMove);
        window.addEventListener("mouseup", this.windowMouseUp);
        this.update();
    }

    componentWillUnmount() {
        window.removeEventListener("mousemove", this.windowMouseMove);
        window.removeEventListener("mouseup", this.windowMouseUp);
    }

    componentDidUpdate(prevProps, prevState) {
        this.update();
        let _check = false;
        if (this.props.header != null) {
            if (this.state.header != null
                && this.props.header.length == this.state.header.length
            ) {
                for (let header of this.props.header) {
                    let checkHeader = false;
                    for (let header2 of this.state.header) {
                        if (header.columnName == header2.columnName) {
                            checkHeader = true;
                        }
                    }
                    if (!checkHeader) {
                        _check = true;
                        break;
                    }
                }
            } else {
                _check = true;
            }
        }
        if (_check) {
            let headers = [];
            if (this.props.isShowNumber) {
                headers.push({
                    label: 'STT',
                    type: 'order',
                });             
            }
            for (let header of this.props.header) {
                if (header.hidden != true) {
                    headers.push(header)
                }
            }

            let widthCols = [];
            let gridTempCols = '';
            let widthCol = 0;
            let c = document.createElement('canvas')
            let ctx = c.getContext("2d");
            ctx.font = "20px Source Sans Pro";
            let widthContainer = this.refs.container.clientWidth;
            let check = 0;
            let min = this.state.min;
            for (let index = 0; index < headers.length; index++) {
                widthCol = ctx.measureText(headers[index].label).width;
                if (widthCol < min && headers[index].minWidth == null) {
                    widthCol = min;
                } else if (widthCol < headers[index].minWidth) {
                    widthCol = headers[index].minWidth;
                }
                check += widthCol;
                gridTempCols += widthCol + 'px ';
                widthCols.push({default: widthCol});
            }
            if (check < widthContainer) {
                widthCols = [];
                gridTempCols = '';
                min = widthContainer / headers.length;
                for (let index = 0; index < headers.length; index++) {
                    widthCol = ctx.measureText(headers[index].label).width;
                    if (widthCol < min && headers[index].minWidth == null) {
                        widthCol = min;
                    } else if (widthCol < headers[index].minWidth) {
                        widthCol = headers[index].minWidth;
                    }
                    check += widthCol;
                    gridTempCols += widthCol + 'px ';
                    widthCols.push({default: widthCol});
                }
            }

            this.setState({
                headerShow: headers,
                header: this.props.header,
                gridTempCols: gridTempCols,
                widthCols: widthCols,
            });
        }

        if (this.state.isRightClick) {
            try {
                this.props.onRowsRightClick(this.state.rowRightClick, this.state.rightClickLocation);
            } catch (error) {
                
            }
            this.setState({
                isRightClick: false,
                rightClickLocation: null,
                rowRightClick: null,
            })
        }

        if (!this.state.mouseOverImageAvatar
        && this.state.mouseOutImageAvatar
        && this.state.imageAvatar != null) {
            this.setState({imageAvatar: null});
        }
    }

    windowMouseUp () {
        this.setState({
            isClick: false,
            targetElement: null,
            mouseCursor: 'default',
            colChange: null,
        })
    }

    windowMouseMove (e) {
        if (this.state.isClick) {
            let colChange = this.state.colChange;
            if (colChange != null) {
                let rect = this.state.targetElement.getBoundingClientRect();
                let widthCols = this.state.widthCols;
                if (widthCols[colChange].length != e.pageX) {
                    widthCols[colChange].length = e.pageX - rect.left;
                    if (widthCols[colChange].length < this.state.min) {
                        widthCols[colChange].length = this.state.min;
                    }
                }
                let gridTempCols = '';
                for (let index = 0; index < this.state.headerShow.length; index++) {
                    if (widthCols[index].length != null) {
                        gridTempCols += widthCols[index].length + 'px ';
                    } else {
                        gridTempCols += widthCols[index].default + 'px ';
                    }
                }
                this.setState({
                    widthCols: widthCols,
                    gridTempCols: gridTempCols,
                })
            }
        }
    }

    update () {
    }

    render () {
        let header = [];
        let data = [];

        if (this.props.data != null
        && this.state.headerShow != null) {
            header = this.state.headerShow;
            data = this.props.data;
        }

        return (
            <div
                className={mystyle.table}
                style={{
                    textAlign: 'left',
                    ...this.props.style,
                }}
                ref="container"
            >
                <div
                    className={mystyle.header}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: this.state.gridTempCols,
                        overflow: 'hidden scroll',
                        height: '40px',
                        whiteSpace: 'nowrap',
                        ...this.props.styleHeader,
                    }}
                    ref="header"
                >
                    {
                        header.map((v, i) => {
                            let borderRight = {};
                            if (this.state.colChange == i) {
                                borderRight = {borderRight: '5px solid #f46c1d'};
                            }
                            return (
                                <div
                                    key={i}
                                    onMouseMove={(e) => {
                                        let rect = e.target.getBoundingClientRect();
                                        let mouseX = e.pageX - rect.x;
                                        if (this.state.isClick == false) {
                                            if (mouseX > rect.width - 5) {
                                                if (this.state.mouseCursor != 'e-resize') {
                                                    this.setState({
                                                        mouseCursor: 'e-resize',
                                                        colChange: i,
                                                    })
                                                }
                                            } else {
                                                if (this.state.mouseCursor != 'default') {
                                                    this.setState({
                                                        mouseCursor: 'default',
                                                        colChange: null,
                                                    })
                                                }
                                            }
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        this.setState({
                                            isClick: true,
                                            targetElement: e.target,
                                        })
                                    }}
                                    onDoubleClick={() => {
                                        let gridTempCols = '';
                                        let widthCols = this.state.widthCols;
                                        widthCols[i].length = null;
                                        for (let index = 0; index < this.state.headerShow.length; index++) {
                                            if (widthCols[index].length != null) {
                                                gridTempCols += widthCols[index].length + 'px ';
                                            } else {
                                                gridTempCols += widthCols[index].default + 'px ';
                                            }
                                        }
                                        this.setState({
                                            widthCols: widthCols,
                                            gridTempCols: gridTempCols,
                                        })
                                    }}
                                    style={{
                                        cursor: this.state.mouseCursor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        ...borderRight,
                                    }}
                                >
                                    {v.label}
                                </div>
                            )
                        })
                    }
                </div>
                <div
                    style={{
                        overflowY: 'auto',
                        height: 'calc(100% - 40px)',
                        ...this.props.styleContent,
                    }}
                    onScroll={(e) => {
                        this.refs.header.scrollLeft = e.target.scrollLeft;
                    }}
                    ref="body"
                    onContextMenu={(e) => {
                        e.preventDefault();
                        let pageX = e.pageX;
                        let pageY = e.pageY;
                        this.setState({
                            isRightClick: true,
                            rightClickLocation: {x: pageX, y: pageY},
                        });
                    }}
                >
                    {
                        data.map((v, i) => {
                            let index = i;
                            if (this.props.indexStart != null) {
                                index += this.props.indexStart;
                            } else {
                                index += 1;
                            }
                            return (
                                <Row
                                    className={mystyle.row}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: this.state.gridTempCols,
                                    }}
                                    onRowsRightClick={(data) => {this.setState({rowRightClick: data})}}
                                    imageEnter={(v, e) => {
                                        if (v != null && e != null && this.props.isShowImageAvatar) {
                                            e.preventDefault();
                                            let location = {x: e.pageX, y: e.pageY}
                                            let x = 0;
                                            let y = 0;                                            
                                            if (location != null) {
                                                if (!isNaN(location.x)) {
                                                    x = location.x;
                                                    // if (this.refs.container != null && this.refs.container.clientWidth) {
                                                    //     if ((Number(this.refs.container.clientWidth) + Number(x)) > window.innerWidth) {
                                                    //         x = Number(location.x) - Number(this.refs.container.clientWidth);
                                                    //     }
                                                    // }
                                                }
                                                if (!isNaN(location.y)) {
                                                    y = location.y;
                                                    if ((240 + Number(y)) > window.innerHeight) {
                                                        y = Number(location.y) - 240;
                                                    }
                                                }
                                            }
                                            
                                            this.setState({
                                                imageAvatar:
                                                <div 
                                                    style={{
                                                        position: 'fixed',
                                                        top: y,
                                                        left: x,
                                                        background: 'rgba(0, 0, 0, 0.6)',
                                                        padding: '5px',
                                                        borderRadius: '5px',
                                                    }}
                                                    onMouseEnter={() => {
                                                        this.setState({
                                                            mouseOverImageAvatar: true,
                                                        })
                                                    }}
                                                    onMouseLeave={() => {
                                                        this.setState({
                                                            mouseOverImageAvatar: false,
                                                        })
                                                    }}
                                                >
                                                    <img src={v} style={{height: '240px',}}></img>
                                                </div>,
                                                mouseOutImageAvatar: false,
                                            });
                                        } else {
                                            this.setState({
                                                mouseOutImageAvatar: true,
                                            });
                                        }
                                    }}
                                    header={header}
                                    data={v}
                                    index={index}
                                    leftSpace={0}
                                    socket={this.props.socket}
                                />
                            )
                        })
                    }
                </div>
                {(() => {
                    if (this.props.information == true) {
                        return (
                            <div
                                ref="footer"
                            >
                                <span>Tổng số: {(() => {return (data.length)})()}</span>
                            </div>
                        )
                    }
                })()}
                {this.state.imageAvatar}
            </div>
        );
    }
}

module.exports = connect(function (state) {
    return {
      socket: state.socket,
    };
}) (Table);;
