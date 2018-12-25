/*
$(document).ready(function () {
  $("html").on("contextmenu", function(e) {
    //get x and y values of the click event
    var pageX = e.pageX;
    var pageY = e.pageY;
    //if window is scrolled
    var scrTop = $(window).scrollTop();

    var header_height = $(".background_thead").position().top + $(".background_thead").height() + scrTop;
    var footer_height = -$(".footer .nav").height() + $(window).height() + scrTop;

    var menu = $(".menu_right_click_conten");
    //hide menu if already shown
    menu.hide();

    if(pageY > header_height && pageY < footer_height) {
      //position menu div near mouse cliked area
      menu.css({top: pageY , left: pageX});

      var mwidth = menu.width();
      var mheight = menu.height();
      var screenWidth = $(window).width();
      var screenHeight = $(window).height();

      //if the menu is close to right edge of the window
      if(pageX+mwidth > screenWidth){
      menu.css({left:pageX-mwidth});
      }

      //if the menu is close to bottom edge of the window
      if(pageY+mheight > screenHeight+scrTop){
      menu.css({top:pageY-mheight});
      }

      $('.menu_right_click_conten #btnthem_menuright').hide();
      $('.menu_right_click_conten #btnbangdiem_menuright').hide();
      $('.menu_right_click_conten #btnsua_menuright').hide();        
      $('.menu_right_click_conten #btnnghi_menuright').hide();
      $('.menu_right_click_conten #btnketthuclophoc_menuright').hide();
      $('.menu_right_click_conten #btnthongtin_menuright').hide();
      $('.menu_right_click_conten #btndangkymonhoc_menuright').hide();
      $('.menu_right_click_conten #btntraibuoi_menuright').hide();
      $('.menu_right_click_conten #btngoimoi_menuright').hide();
      $('.menu_right_click_conten #btngoikehoach_menuright').hide();
      $('.menu_right_click_conten #btngoi_menuright').hide();
      $('.menu_right_click_conten #btngoilai_menuright').hide();
      $('.menu_right_click_conten #btnxoa_menuright').hide();
      $('.menu_right_click_conten #btnsubtask_menuright').hide();
      $('.menu_right_click_conten #btnreport_menuright').hide();
      $('.menu_right_click_conten #btnpay_menuright').hide();
      $('.menu_right_click_conten #btnpayanother_menuright').hide(); 
      $('.menu_right_click_conten #btnpayowe_menuright').hide();
      $('.menu_right_click_conten #btnresponse_menuright').hide();
      $('.menu_right_click_conten #btntakecare_menuright').hide();

      if ($('.permission').attr('value') != 'giaovien') {
        $('.menu_right_click_conten #btnthem_menuright').show();
      }

      switch ($('#texttenbang').attr('value').split('_')[0]) {
        case 'USERS':
          $('.menu_right_click_conten #btnthem_menuright').hide();
          break;
        case 'LOPHOC':
          break;
        case 'DITUVAN':                
          break;
        case 'DULIEUTRUONGTIEMNANG':             
          break;
        case 'GOIDIENTUVAN':
        case 'GOIDIENDULIEU':
        case 'GOIDANGKYHANGNGAY':
        case 'CHAMSOCKHACHHANG':
        case 'CALLCHAMSOCKHACHHANGCU':
          $('.menu_right_click_conten #btnthem_menuright').hide();
          $('.menu_right_click_conten #btngoimoi_menuright').show();
          break;
        case 'PHATTOROI':
          break;
        case 'TREOBANGRON':
          break;
        case 'PHANHOICHAMSOCKHACHHANG':
          $('.menu_right_click_conten #btnthem_menuright').hide();
          break;
        case 'HOADON':
          $('.menu_right_click_conten #btnthem_menuright').show();
          break;
        case 'HOADONDAHUY':
          $('.menu_right_click_conten #btnthem_menuright').hide();
          break;
        case 'QUANLYCONGVIECNHAN':
          $('.menu_right_click_conten #btnthem_menuright').hide();
          break;
        default:                  
      }

      let flag = false;

      elem = e.target.parentElement;

      if (elem.className == 'container') {
        flag = true;
      }

      if( elem != null && elem.localName == 'body' ){
        flag = true;
      }

      if( elem != null && elem.localName == 'td' ){
        elem = elem.parentElement;
        flag = true;            
      }

      if( elem != null && elem.localName == 'tr' && elem.offsetParent.id == 'bang_du_lieu')
      {
        $('.menu_right_click_conten #btnthem_menuright').show();
        $('.menu_right_click_conten #btnsua_menuright').show();
        $('.menu_right_click_conten #btnthongtin_menuright').show();              
        
        switch ($('#texttenbang').attr('value').split('_')[0]) {
          case 'USERS':
            $('.menu_right_click_conten #btnthem_menuright').hide();
            $('.menu_right_click_conten #btndangkymonhoc_menuright').show();
            $('.menu_right_click_conten #btnnghi_menuright').show();
            $('.menu_right_click_conten #btnpay_menuright').show();
            $('.menu_right_click_conten #btnpayanother_menuright').show();
            $('.menu_right_click_conten #btntakecare_menuright').show();
            break;
          case 'GIAOVIEN':
            $('.menu_right_click_conten #btnnghi_menuright').show();
            break;
          case 'QUANLY':
            $('.menu_right_click_conten #btnnghi_menuright').show();
            break;
          case 'LOPHOC':
            $('.menu_right_click_conten #btnbangdiem_menuright').show();
            $('.menu_right_click_conten #btnketthuclophoc_menuright').show(); 
            $('.menu_right_click_conten #btntraibuoi_menuright').show();
            break;
          case 'DITUVAN':                
            $('.menu_right_click_conten #btnthem_menuright').show();
            $('.menu_right_click_conten #btnsua_menuright').show();
            $('.menu_right_click_conten #btnthongtin_menuright').show();
            $('.menu_right_click_conten #btngoi_menuright').show();
            break;
          case 'DULIEUTRUONGTIEMNANG':
            $('.menu_right_click_conten #btnthem_menuright').show();
            $('.menu_right_click_conten #btnsua_menuright').show();
            $('.menu_right_click_conten #btnthongtin_menuright').show();
            $('.menu_right_click_conten #btngoi_menuright').show();             
            break;
          case 'DANGKYHANGNGAY':
            $('.menu_right_click_conten #btnthem_menuright').show();
            $('.menu_right_click_conten #btnsua_menuright').show();
            $('.menu_right_click_conten #btnthongtin_menuright').hide();
            $('.menu_right_click_conten #btngoi_menuright').show();             
            break;
          case 'GOIDIENTUVAN':
          case 'GOIDIENDULIEU':
          case 'CALLCHAMSOCKHACHHANGCU':
          case 'CHAMSOCKHACHHANG':
          case 'GOIDANGKYHANGNGAY':
            $('.menu_right_click_conten #btnthem_menuright').hide();
            $('.menu_right_click_conten #btnsua_menuright').hide();
            $('.menu_right_click_conten #btnthongtin_menuright').show();
            $('.menu_right_click_conten #btngoimoi_menuright').show();
            $('.menu_right_click_conten #btngoikehoach_menuright').show();
            $('.menu_right_click_conten #btngoilai_menuright').show();
            break;
          case 'PHANHOICHAMSOCKHACHHANG':
            $('.menu_right_click_conten #btnthem_menuright').hide();
            $('.menu_right_click_conten #btnthongtin_menuright').show();
            $('.menu_right_click_conten #btnresponse_menuright').show();
            break;
          case 'PHATTOROI':
            $('.menu_right_click_conten #btnthongtin_menuright').hide();
            $('.menu_right_click_conten #btnxoa_menuright').show();
            break;
          case 'TREOBANGRON':
            $('.menu_right_click_conten #btnthongtin_menuright').hide();
            $('.menu_right_click_conten #btnxoa_menuright').show();
            break;
          case 'HOADON':
            $('.menu_right_click_conten #btnxoa_menuright').show();
            $('.menu_right_click_conten #btnthem_menuright').show();
            $('.menu_right_click_conten #btnsua_menuright').hide();
            $('.menu_right_click_conten #btnpayowe_menuright').show();
            break;
          case 'HOADONDAHUY':
            $('.menu_right_click_conten #btnthem_menuright').hide();
            $('.menu_right_click_conten #btnsua_menuright').hide();
            break;
          case 'QUANLYCONGVIECGIAO':
            $('.menu_right_click_conten #btnxoa_menuright').show();
            break;
          case 'QUANLYCONGVIECNHAN':
            $('.menu_right_click_conten #btnthem_menuright').hide();
            $('.menu_right_click_conten #btnsua_menuright').hide();
            $('.menu_right_click_conten #btnsubtask_menuright').show();
            $('.menu_right_click_conten #btnreport_menuright').show();
            break;
          default:                  
        }

        switch ($('.permission').attr('value')) {
          case 'giaovien':
            $('.menu_right_click_conten #btnthem_menuright').hide();
            $('.menu_right_click_conten #btnsua_menuright').hide();
            $('.menu_right_click_conten #btnketthuclophoc_menuright').hide();
            $('.menu_right_click_conten #btntraibuoi_menuright').hide();
            if($('#texttenbang').attr('value').split('_')[0] == 'CHAMSOCKHACHHANG'){
              $('.menu_right_click_conten #btnsua_menuright').show();
            }
            if($('#texttenbang').attr('value').split('_')[0] == 'LOPHOC'){
              $('.menu_right_click_conten #btnsua_menuright').show();
            }
            break;
          case 'marketer':
          case 'cskh':
          case 'tbmanhvan':
          case 'tbmvanhoa':
            switch ($('#texttenbang').attr('value').split('_')[0]) {
              case 'DITUVAN':
                $('.menu_right_click_conten #btnthongtin_menuright').hide();
                break;
              case 'DULIEUTRUONGTIEMNANG':
                $('.menu_right_click_conten #btnthem_menuright').hide();
                $('.menu_right_click_conten #btnsua_menuright').hide();
                $('.menu_right_click_conten #btnthongtin_menuright').hide();
                break;
              case 'GOIDIENDULIEU':
                $('.menu_right_click_conten #btnthongtin_menuright').hide();
                break;
              case 'USERS':
                $('.menu_right_click_conten #btnthem_menuright').hide();
                $('.menu_right_click_conten #btnsua_menuright').hide();
                $('.menu_right_click_conten #btnpay_menuright').hide();
                $('.menu_right_click_conten #btnpayanother_menuright').hide();
                $('.menu_right_click_conten #btndangkymonhoc_menuright').hide();
                $('.menu_right_click_conten #btnnghi_menuright').hide();
                break;
              case 'CHAMSOCKHACHHANG':
                if ($('.permission').attr('value') != 'cskh') {
                  $('.menu_right_click_conten #btnthem_menuright').hide();              
                }
                break;
              case 'CALLCHAMSOCKHACHHANGCU':
                $('.menu_right_click_conten #btnthongtin_menuright').hide();
                break;
              default:                
            }
            break;
          case 'modtpcl':
            if ($('#texttenbang').attr('value').split('_')[0] == 'USERS') {
              $('.menu_right_click_conten #btnthem_menuright').hide();
              $('.menu_right_click_conten #btnsua_menuright').hide();
              $('.menu_right_click_conten #btnpay_menuright').hide();
              $('.menu_right_click_conten #btnpayanother_menuright').hide();
            }
            break;                
          case 'modtpmar':
            if ($('#texttenbang').attr('value').split('_')[0] == 'USERS') {
              $('.menu_right_click_conten #btnthem_menuright').hide();
              $('.menu_right_click_conten #btnsua_menuright').hide();
              $('.menu_right_click_conten #btnpay_menuright').hide();
              $('.menu_right_click_conten #btnpayanother_menuright').hide();
              $('.menu_right_click_conten #btndangkymonhoc_menuright').hide();
              $('.menu_right_click_conten #btnnghi_menuright').hide();
            }
            break;
          default:                  
        }

        if (elem.className.indexOf('isleave') != -1) {
          $('.menu_right_click_conten #btnnghi_menuright').hide();
        }

        $(".tableisseleced").removeClass("tableisseleced");
        elem.className += " tableisseleced";
        elem2 = elem.parentElement.parentElement.getElementsByTagName('tr');
        $('.menu_right_click_conten').attr('value', elem.childNodes[0].innerText);
        $('.menu_right_click_conten').attr('title', elem2.item(0).childNodes[0].innerText.split('\n')[0]);
        flag = true;
      }

      if ($('#texttenbang').text().indexOf('Máy Chủ') != -1) {
        flag = false;
      }

      if (flag) {
        e.preventDefault();
        menu.show();
      }
    }
  });

  $("html").on("click", function(){
    $(".menu_right_click_conten").hide();
    $(".tableisseleced").removeClass("tableisseleced");
  });
});
*/