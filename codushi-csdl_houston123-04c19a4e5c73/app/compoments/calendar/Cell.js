import React from 'react';
import style from './style.css';

var cntrlIsPressed;
var isOnClick;

class Cell extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            classCell: style.row,
            title: '',
        }
    }

    onkeydown (event) {
        if(event.which=="17")
                cntrlIsPressed = true;
    }

    onkeyup () {
        cntrlIsPressed = false;
    }

    componentDidMount () {
        $(document).on('keydown', this.onkeydown);
        $(document).on('keyup', this.onkeyup);
        let gio, phut;
        let rowindex = this.props.tieude
        if ((rowindex % 2) == 0) {
            gio = Math.floor(rowindex / 2) + 6;
            phut = 0;
        } else {
            gio = Math.floor(rowindex / 2) + 6;
            phut = 30;
        }
        this.setState({ title: ('0' + gio).slice(-2) + ':' + ('0' + phut).slice(-2) });
    }

    componentWillUnmount() {
        $(document).off('keydown', this.onkeydown);
        $(document).off('keyup', this.onkeyup);
    }

    onMouseDown () {
        if (this.state.classCell == style.row) {
            this.setState({ classCell: style.row + ' ' + style.hover + ' cellisclick'});
        } else {
            this.setState({ classCell: style.row });
        }
        isOnClick = true;
    }

    onMouseUp () {
        isOnClick = false;
    }

    onMouseEnter () {
        if (isOnClick == true && cntrlIsPressed == true) {
            this.setState({ classCell: style.row + ' ' + style.hover + ' cellisclick'});
        }
    }

    render () {
        return (
            <td             
                className={this.state.classCell}
                onMouseDown={this.onMouseDown.bind(this)}
                onMouseUp={this.onMouseUp.bind(this)}
                onMouseEnter={this.onMouseEnter.bind(this)}
                title={this.state.title}
            >{this.props.children}</td>                           
        )
    }
}

module.exports = Cell;
