/**
 * this.props.socket.emit('huy-query');
 */
var React = require('react');
var ReactDOM = require('react-dom');
var { Provider } = require('react-redux');
var store = require('store');
let Body = require('./compoments/home/Body');

var AccountManager = require('./compoments/accountmanager/index');
var CalendarSettup = require('./compoments/calendar/CalendarSettup');

/**
 * Icon import
 */
//#region
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faChalkboard,
    faChalkboardTeacher,
    faUsers,
    faUserTie,
    faWallet,
    faChartLine,
    faHeartbeat,
    faTasks,
    faUserPlus,
    faSearchDollar,
    faPhone,
    faFileExcel,
    faFileInvoiceDollar,
    faHeadset,
    faDatabase,
    faAd,
    faBullhorn,
    faPoll,
    faBookOpen,
    faUserSlash,
    faUserClock,
    faAddressBook,
    faTrashAlt,
    faLock,
    faBomb,
    faFingerprint,
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faChalkboard,
    faChalkboardTeacher,
    faUsers,
    faUserTie,
    faWallet,
    faChartLine,
    faHeartbeat,
    faTasks,
    faUserPlus,
    faSearchDollar,
    faPhone,
    faFileExcel,
    faFileInvoiceDollar,
    faHeadset,
    faDatabase,
    faAd,
    faBullhorn,
    faPoll,
    faBookOpen,
    faUserSlash,
    faUserClock,
    faAddressBook,
    faTrashAlt,
    faLock,
    faBomb,
    faFingerprint,
)
//#endregion

$(document).ready( function () {
    var socket = store.getState().socket;
    var time_countdown = 1800;
    var timer;

    ReactDOM.render(
        <Provider store={store}>  
            <Body/>
        </Provider>, 
        document.getElementById('body-react')
    );

    socket.on('connect', () => {
        ReactDOM.unmountComponentAtNode(document.getElementById('connect-info-react'));
    });

    let disconnectIcon = new Image();
    disconnectIcon.src = 'img/lostconnection.png';
    socket.on('disconnect', (reason) => {
        ReactDOM.unmountComponentAtNode(document.getElementById('connect-info-react'));
        let Disconnected = require('./compoments/system/network/Disconnected');
        ReactDOM.render(<Disconnected image={disconnectIcon}/>, document.getElementById('connect-info-react'));
    });

    socket.emit('huy-query');
    
    socket.on('ket-noi-thanh-cong', function () {
        $.post('/trangchu', { function : 'gan-ten-cho-socket' }).done(function (data) {
            socket.emit('gan-ten-cho-socket', { username : data.user, password : data.pass});
        });
    });

    $(window).on('blur', function () {
        timer = setInterval(function() {
            time_countdown--;
            // If the count down is over, write some text
            if (time_countdown < 0) {
                clearInterval(timer);
                location.href = "/dangxuat";
            }
        }, 1000);
    });

    $(window).on('focusin', function () {
        time_countdown = 1800;
        clearInterval(timer);
        //timer = null;
    });

    socket.on('tro-ve-trang-dang-nhap', function () {
        window.location.replace('/dangxuat');
    });

    socket.on('server-is-processing', function () {
        $('.loading').show();
    })

    socket.on('googleapicallback', () => {
        $('.loading').hide();
    });

    /**
     * permission: admin
     */
    //#region 
    $('#btncalendarsettup').on('click', () => {
        ReactDOM.render(
            <Provider store={store}>
                <CalendarSettup />
            </Provider>
            , document.getElementById('calendarsettup-react')
        );
    });

    $('#txttimkiem').keyup( function () {
        if ($('.dulieu').children().length > 0) {
            console.log($(this).val());
        }
    });

    $('#trangchu_quanlymod').on( 'click' , function () {
        ReactDOM.render(
            <Provider store={store}>
                <AccountManager/>
            </Provider>,
            document.getElementById('form-react')
        );
    });

    $('#btnspecial_tools').on( 'click' , function () {
        let Special = require('./compoments/form/admin/specialtools/SpecialTools');
        ReactDOM.unmountComponentAtNode(document.getElementById('form-react'));
        ReactDOM.render(
            <Provider store={store}>
                <Special/>
            </Provider>,
            document.getElementById('form-react')
        );
    });
//#endregion
});