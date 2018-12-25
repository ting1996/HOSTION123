function post(path, params, method) {
  method = method || "post"; // Set method to post by default if not specified.

  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    if (params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);
        form.appendChild(hiddenField);
      }
  }
  
  document.body.appendChild(form);
  form.submit();
}

$(document).ready(function(){
  $('.waitting').show();
  $.ajax({
    url: '/checksession',
    type: 'post',
    dataType: 'json',
    data: { },
    statusCode: {
        200: function () {
          post('/trangchu');
        },
        202: function (response) {
          console.log(response.responseText);
          $('.waitting').hide();
        },
        500: function (response) {
          console.log(response.responseText);
          $('.waitting').hide();
        },
    },
    success : function(response){
    }
  });

  $(".form-input").on("submit", function(event){
    var username = $("#txtusername").val();
    var password = $("#txtpassword").val();
    // Kiểm tra nếu username rỗng thì báo lỗi
    if (username == "" || password == "") {
      alert("Vui lòng không để trống tên đăng nhập và mật khẩu.");
      return false;
    }
    // Chạy ajax gửi thông tin username và password về server check_dang_nhap.php
    // để kiểm tra thông tin đăng nhập hợp lệ hay chưa
    $('#txtusername').attr("disabled", "disabled");
    $('#txtpassword').attr("disabled", "disabled");
    $('#btnLogin').attr("disabled", "disabled");

    $('.waitting').show();
    $.ajax({
      url: '/',
      type: 'post',
      dataType: 'json',
      data: { txtusername : username , txtpassword : password },
      statusCode: {
          200: function (response) {
            post('/trangchu');
          },
          202: function (response) {
            alert("Tài khoản chưa được kích hoạt vui lòng liên hệ admin hoặc mod khu vực!");
            location.reload();
          },
          203: function (response) {
            alert("Tài khoản không thể sử dụng \nVui lòng đăng nhập tài khoản khác!");
            location.reload();
          },
          204: function (response) {
            alert('Đăng nhập thất bại! \nVui lòng kiểm tra tên đăng nhập và mật khẩu');
            $('#txtusername').removeAttr("disabled");
            $('#txtpassword').removeAttr("disabled");
            $('#btnLogin').removeAttr("disabled");
            $('.waitting').hide();
          },
          500: function (response) {
            alert('Lỗi máy chủ: Không thể truy xuất database');
            location.reload();
          }
      },
      success : function(response){
      }
    });
    event.preventDefault();
  });

  $('#txtusername').keypress(function(event) {
    if (event.keyCode == 13 || event.which == 13) {
        $('#txtpassword').focus();
        event.preventDefault();
    }
  });

  $('#txtpassword').keypress(function(event) {
    if (event.keyCode == 13 || event.which == 13) {
        $('#btnLogin').click();
        event.preventDefault();
    }
  });
});
