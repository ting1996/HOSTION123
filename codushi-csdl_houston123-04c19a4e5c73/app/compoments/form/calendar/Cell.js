import React from 'react';
import style from './style.css';
import { log } from 'util';

var cntrlIsPressed;
var isOnClick;

class Cell extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            classCell: style.row,
            title: '',
            fisttime: null,
        }
        this.allowDrop =this.allowDrop.bind(this);
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

    componentDidUpdate(prevProps, prevState) {
        if (this.props.cellisclick == true && this.state.fisttime == null) {
            this.setState({
                classCell: style.row + ' ' + style.hover + ' cellisclick',
                fisttime: '',
            });        
        }
    }

    onMouseDown () {
        try
        {if (this.state.classCell == style.row && !this.props.disablechoose == true) {
            this.setState({ classCell: style.row + ' ' + style.hover + ' cellisclick'});
            if(this.props.onChangeEdit!=null)
            {
                let array = this.props.calendar.state.arrayEdit;
                for(let [i,v] of array.entries())
                {
                    if(v.x == this.props.tieude && v.y == this.props.gio)
                        array.splice(i,1);
                }
                this.props.calendar.setState({arrayEdit:array})
            }
        } else {
            this.setState({ classCell: style.row });
            if(this.props.onChangeEdit!=null)
            {
                let array = this.props.calendar.state.arrayEdit;
                array = this.props.calendar.state.arrayEdit;
                array.push({x:this.props.tieude,y:this.props.gio})
                this.props.calendar.setState({arrayEdit:array})
            }
        }}
        catch(e){console.log(e);
        }
        if(this.props.onChangeEdit!=null)
            this.props.onChangeEdit()
        isOnClick = true;

    }

    onMouseUp () {
        isOnClick = false;
    }

    onMouseEnter () {
        if (isOnClick == true && cntrlIsPressed == true && !this.props.disablechoose == true) {
            this.setState({ classCell: style.row + ' ' + style.hover + ' cellisclick'});
            
        }
        this.props.onMouseOff()
    }

    allowDrop(event)
    {
        if(this.props.allowdrop)
            event.preventDefault();
        
             
    }
    
    render () {
        return (
            <td             
                className={this.state.classCell}
                onMouseDown={this.onMouseDown.bind(this)}
                onMouseUp={this.onMouseUp.bind(this)}
                onMouseEnter={this.onMouseEnter.bind(this)}
                title={this.state.title}
                onDragOver = {this.allowDrop}
                onDrop = {this.props.ondrop}
                data-locatex={this.props.locatex}
                data-locatey={this.props.locatey}
                
            >{this.props.children}</td>                           
        )
    }
}

module.exports = Cell;
