import React from 'react';
import style from './style.css';
import classnames from 'classnames';
import { isNumber } from 'util';
{/* <InfoShadow 
                      ten ={this.state.tenlop} 
                      ngaybatdau = {this.state.ngaybatdau}
                      ngayketthuc= {this.state.ngayketthuc}
                      clientY = {this.state.clientY}
                      clientX = {this.state.clientX}
                      pageXY = {this.state.pageXY}/> */}

class DragShadow extends React.Component {
    constructor (props) {
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

    
    render () {
        
        let x;
        let y;
        if(isNumber(this.props.pageXY.X))
        {
            x = this.props.pageXY.X+10;
            if (this.refs.drag != null && this.refs.drag.clientWidth) {
                if ((Number(this.refs.drag.clientWidth) + Number(x)) > window.innerWidth) {
                    x = Number(this.props.pageXY.X) - Number(this.refs.drag.clientWidth)-10;
                }
            }
        }
        if (isNumber(this.props.pageXY.Y)) {
            y = this.props.pageXY.Y+10;
            if (this.refs.drag != null && this.refs.drag.clientHeight) {
                if ((Number(this.refs.drag.clientHeight) + Number(y)) > window.innerHeight) {
                    y = Number(this.props.pageXY.Y) - Number(this.refs.drag.clientHeight)-10;
                }
            }
        }
        // let callback =[];
        // let yourclass = classnames({
        //     [style.rowshadow]: 'rowshadow',
        //     [style.rowisbusy]: 'rowisbusy',
        //     });
        // for(let i = 0;i<this.props.v.split('!')[1];i++)
        // {
        //     let label=""
        //     let temp;
        //     if (i==0)
        //         label = this.props.v.split('!')[0];
        //     temp = <tr class ={yourclass}>
        //             <td>{label}</td>
        //         </tr>
        //     callback.push(temp)
        // }
        return (

            <table  ref='drag' style = {{"position":"fixed","top":(y)+"px","left":(x)+"px"}}>
                {this.props.callback}
            </table>                       
        )
    }
}

module.exports = DragShadow;
