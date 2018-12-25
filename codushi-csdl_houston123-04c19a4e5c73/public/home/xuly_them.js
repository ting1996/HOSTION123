$(document).ready(function() {
  (function($) {
      var origAppend = $.fn.append;
      $.fn.append = function () {
          return origAppend.apply(this, arguments).trigger("append");
      };
  })(jQuery);

  $(".modal-themquanly img").click(function() {
    var fileSelector = document.getElementById('hinhanh_upload_them_quan_ly');
    fileSelector.addEventListener('change', function(evt){
      var files = evt.target.files; // FileList object

      // Loop through the FileList and render image files as thumbnails.
      for (var i = 0, f; f = files[i]; i++) {
        // Only process image files.
        if (!f.type.match('image.*')) {
          continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            // Render thumbnail.
            $(".modal-themquanly img").attr('src', e.target.result);
          };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
      }
    }, false);
    fileSelector.click();
    return false;
  });

  $(".modal-themgiaovien img").click(function() {
    var fileSelector = document.getElementById('hinhanh_upload_them_giao_vien');
    fileSelector.addEventListener('change', function(evt){
      var files = evt.target.files; // FileList object

      // Loop through the FileList and render image files as thumbnails.
      for (var i = 0, f; f = files[i]; i++) {
        // Only process image files.
        if (!f.type.match('image.*')) {
          continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            // Render thumbnail.
            $(".modal-themgiaovien img").attr('src', e.target.result);
          };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
      }
    }, false);
    fileSelector.click();
    return false;
  });

  $('.modal-themquanly #btncancelregister').click(function() {
      $('.modal-themquanly').hide();
  });

  $('.modal-themgiaovien #btncancelregister').click(function() {
      $('.modal-themgiaovien').hide();
  });

  $('.modal-themchamsockhachhang #btncancelregister').click(function() {
      $('.modal-themchamsockhachhang').hide();
  });

  $(window).on("click", function(event) {
    switch ($(event.target).attr('class')) {
      case 'modal-themquanly':
        $('.modal-themquanly').hide();
        break;
      case 'modal-themgiaovien':
        $('.modal-themgiaovien').hide();
        break;
      case 'modal-themchamsockhachhang':
        $('.modal-themchamsockhachhang').hide();
        break;
      default:
    }
  });
});
