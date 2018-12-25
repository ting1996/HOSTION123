{/* 
<ContextMenu
    location={{x: pageX, y: pageY}}
    menu={[
        {label: 'Xóa', onClick: this.onRemoveTask.bind(this, this.state.valueContextMenu)},
        {label: 'Sửa', onClick: this.onEditTask.bind(this, this.state.valueContextMenu)}
    ]}
/>

Note: 
 -  
*/}

import React from 'react';
import { isNumber } from 'util';
import style from './stylecontextmenu.css';

class ContextMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount () {
    }

    componentWillUnmount() {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    dongy () {

    }

    close () {
       
    }

    render () {
        let x = 0;
        let y = 0;
        if (this.props.location != null) {
            if (isNumber(this.props.location.x)) {
                x = this.props.location.x;
                if (this.refs.container != null && this.refs.container.clientWidth) {
                    if ((Number(this.refs.container.clientWidth) + Number(x)) > window.innerWidth) {
                        x = Number(this.props.location.x) - Number(this.refs.container.clientWidth);
                    }
                }
            }
            if (isNumber(this.props.location.y)) {
                y = this.props.location.y;
                if (this.refs.container != null && this.refs.container.clientHeight) {
                    if ((Number(this.refs.container.clientHeight) + Number(y)) > window.innerHeight) {
                        y = Number(this.props.location.y) - Number(this.refs.container.clientHeight);
                    }
                }
            }
        }

        return (
            <div
                style={{
                'left': x + 'px',
                'top': y + 'px',
                }}
                className={style.contextmenu}
                onContextMenu={(e) => {
                    e.preventDefault();
                }}
                ref='container'
            >
                {
                    this.props.menu.map((v, i) => {
                        let _style = {};
                        if (v.style != null) {
                            _style = v.style;
                        }
                        return (
                            <div
                                onClick={v.onClick}
                                className={style.button}
                                style={{..._style}}
                            >
                                {v.label}
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

module.exports = ContextMenu;
