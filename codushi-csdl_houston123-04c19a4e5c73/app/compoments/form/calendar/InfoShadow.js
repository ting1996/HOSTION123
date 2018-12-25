import React from 'react';
import style from './style.css';
import { isNumber } from 'util';
{/* <InfoShadow 
                      ten ={this.state.tenlop} 
                      ngaybatdau = {this.state.ngaybatdau}
                      ngayketthuc= {this.state.ngayketthuc}
                      clientY = {this.state.clientY}
                      clientX = {this.state.clientX}
                      pageXY = {this.state.pageXY}/> */}

class InfoShadow extends React.Component {
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
        let ngaybatdau = new Date(this.props.ngaybatdau)
        let stringngaybatdau =("0"+ngaybatdau.getDate()).slice(-2)+"/"+("0"+(ngaybatdau.getMonth()+1)).slice(-2)+"/"+ngaybatdau.getFullYear();
        let ngayketthuc = new Date(this.props.ngayketthuc)
        let stringngayketthuc =("0"+ngayketthuc.getDate()).slice(-2)+"/"+("0"+(ngayketthuc.getMonth()+1)).slice(-2)+"/"+ngayketthuc.getFullYear();
        let x;
        let y;
        if(isNumber(this.props.pageXY.X))
        {
            x = this.props.pageXY.X+10;
            if (this.refs.shadow != null && this.refs.shadow.clientWidth) {
                if ((Number(this.refs.shadow.clientWidth) + Number(x)) > window.innerWidth) {
                    x = Number(this.props.pageXY.X) - Number(this.refs.shadow.clientWidth)-10;
                }
            }
        }
        if (isNumber(this.props.pageXY.Y)) {
            y = this.props.pageXY.Y+10;
            if (this.refs.shadow != null && this.refs.shadow.clientHeight) {
                if ((Number(this.refs.shadow.clientHeight) + Number(y)) > window.innerHeight) {
                    y = Number(this.props.pageXY.Y) - Number(this.refs.shadow.clientHeight)-10;
                }
            }
        }
        return (
            <div ref='shadow' style = {{"background-color":"white","position":"fixed","top":(y)+"px","left":(x)+"px"}}>
                <p>{this.props.ten}<br/>
                    {"Ngày Bắt Đầu: "+stringngaybatdau}<br/>
                    {"Ngày Kết Thúc: "+stringngayketthuc}</p>
            </div>                           
        )
    }
}

module.exports = InfoShadow;
