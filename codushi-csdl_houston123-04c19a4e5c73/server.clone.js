/**
 * Include libs in nodejs
 */
var express = require("express");
var mysql = require("mysql");
var app = express();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var formidable = require('formidable');
var fs = require('fs.extra');
var imagemagick = require('imagemagick');
var session = require('express-session');
var randomstring = require('randomstring');
var google = require('googleapis');
var moment = require('moment-timezone');
var fetch = require('node-fetch');
var crypto = require('crypto');
var houston123server = require('./houston123server.config');
var createClient = require("webdav");

process.env.TZ = 'Asia/Ho_Chi_Minh';

process.on('unhandledRejection', (reason, promise) => {
  console.log('Server error: Unhandled Rejection at ~ ', reason.stack || reason)
})

/**
 * Bao mat du lieu
 */
//#region
const algorithm_encrypt = 'aes-256-ctr';
const password_encrypt = crypto.randomBytes(32);

function encrypt(text) {
  var IV = new Buffer(crypto.randomBytes(16));
  var cipher = crypto.createCipheriv(algorithm_encrypt,password_encrypt, IV);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text) {
  var IV = new Buffer(crypto.randomBytes(16));
  var decipher = crypto.createCipheriv(algorithm_encrypt,password_encrypt, IV);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}
//#endregion

/**
 * Init http server
 */
var server = require("http").Server(app);
// var io = require("socket.io")(server);
server.listen(80);

/**
 * Init https server
 */
const httpsoptions = {
  key: fs.readFileSync('./keys/private.key'),
  cert: fs.readFileSync('./keys/certificate.crt'),
  ca: fs.readFileSync('./keys/ca_bundle.crt'),
};

var httpsserver = require('https').createServer(httpsoptions, app);
var io = require("socket.io")(httpsserver);
httpsserver.listen(443);

/**
 * Init express
 */
app.use(express.static('public'));
app.use(session({
  secret: "ekj3h12jk3h1jk2kj3hk1j2",
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 1000*60*60*2},
}));
app.set("view engine", "ejs");
app.set("views", "./views");

/**
 * Init client webDav
 */
var webDavclient = createClient(
  "http://houstontanvinhhiep.ddns.net:5005/",
  "tandq",
  "123456",
);

/**
 * Init mysql
 */
var connection = null;
function ConnecttoDatabase(a_user, a_pass, callback) {
  let config = {
    host : houston123server.mysql.host,
    user : 'doquangtan',
    password : '1',
    database : houston123server.mysql.database,
    multipleStatements: true,
  }

  connection = mysql.createConnection(config);

  connection.connect(function(error){
    if(error){
      callback(0);
    } else {
      callback(1);
    }
  });

  connection.on('error', function(err) {
    console.log('Mysql error:' + err);
  });
};

function ExecuteQuery(query, callback, userid) {
  let time = (new Date()).toISOString();
  console.log('Mysql log: ' + userid + ' --> ' + time + ' ~ ' + query);
  let con = new Promise ((resolve, reject) => {
    if (connection.state == 'disconnected') {
      connection.connect(function(error){
        if(error){
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });

  con.then(() => {
    connection.query(query, function (err, rows, fieldpacket) {
      if (err) {
        callback(err);
      } else {
        callback(undefined, rows);
      }
    });
  })
  .catch((err) => {
    callback(err);
  });
}

var SQLTransaction = false;
function ExecuteQueryWithTransaction(query, callback, userid) {
  let time = (new Date()).toISOString();
  console.log('Mysql log: ' + userid + ' --> ' + time + ' ~ ' + query);
  let con = new Promise ((resolve, reject) => {
    if (connection.state == 'disconnected') {
      connection.connect(function(error){
        if(error){
          reject(error);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });

  con.then(() => {
    if (!SQLTransaction) {
      connection.beginTransaction(function (error) {
        if (error) {
          callback(error);
        } else {
          connection.query(query, function (err, rows, fieldpacket) {
            if (err) {
              ExecuteQueryWithTransactionRollback(function () {
                callback(err);
              });
            }
            else {
              SQLTransaction = true;
              callback(undefined, rows);
            }
          });
        }
      });
    } else {
      connection.query(query, function (err, rows, fieldpacket) {
        if (err) {
          ExecuteQueryWithTransactionRollback(function () {
            callback(err);
          });
        }
        else {
          SQLTransaction = true;
          callback(undefined, rows);
        }
      });
    }
  })
  .catch((err) => {
    callback(err);
  });
}

function ExecuteQueryWithTransactionCommit(callback) {
  SQLTransaction = false;
  connection.commit(function (err) {
    if (err) {
      ExecuteQueryWithTransactionRollback(function () {
        callback(err, false);
      });
    }
    else {
      callback(undefined, true);
    }
  });
}

function ExecuteQueryWithTransactionRollback(callback) {
  SQLTransaction = false;
  try {
    connection.rollback(function () {
      callback();
    });
  } catch (e) {
    console.log('Mysql error:' + e);
    callback();
  }
}
/**
 * Socket.IO
 */
//#region
io.on("connection", function(socket){ 
  ExecuteQuery('INSERT INTO `userconnect` (`id`, `userid`) VALUES (\'!\?!\', null); '.replace('!\?!', socket.id), function(err, rows){
    if (err) {
      socket.emit('tro-ve-trang-dang-nhap');
    } else {
      console.log('Socket.IO log: ' + socket.id + ': ket noi');
    }
  }, socket.id);

  socket.on('kiem-tra-ket-noi', function () {
    socket.emit('ket-noi-thanh-cong');
  })

  socket.on('gan-ten-cho-socket', function (params) {
    if (params.username == null) {
      socket.emit('tro-ve-trang-dang-nhap');
    }

    socket.username = params.username;
    socket.password = params.password;
    console.log("Socket.IO log: " + socket.id + ": doi ten thanh " + socket.username);
    let query = 'UPDATE `userconnect` SET `userid` = \'!\?!\' WHERE (`id` = \'!\?!\'); ';
    query = query.replace('!\?!', params.username)
    query = query.replace('!\?!', socket.id)
    ExecuteQuery(query, function(err, rows){
      if (err) {
        socket.emit('tro-ve-trang-dang-nhap');
      } else {
        socket.emit('gan-ten-cho-socket-thanh-cong');
      }
    }, socket.username);
  });

  /**
   * overlayLayer: open loading when query is processing
   */
  socket.on('gui-query-den-database', function (data, hanhdong, dulieuguive) {
    try {
      if (dulieuguive != null && dulieuguive.overlayLayer == false) {
        
      } else {
        socket.emit('server-is-processing');
      }
      if (connection == null || connection.state == "disconnected") {
        ConnecttoDatabase(socket.username.toString(), socket.password.toString(), function(x){
          if(x == 1){
            if (dulieuguive != null && dulieuguive.transaction == true) {
              ExecuteQueryWithTransaction(data, function(err, rows){
                if (err) {
                  socket.emit('tra-ve-du-lieu-tu-database', rows, 'loi-cu-phap', dulieuguive, err);
                } else {                  
                  if (dulieuguive.transactioncommit == true) {
                    ExecuteQueryWithTransactionCommit(function (err, check) {
                      if (check) {
                        socket.emit('tra-ve-du-lieu-tu-database', rows, hanhdong, dulieuguive);
                        socket.emit('tra-ve-du-lieu-reactjs', rows, hanhdong, dulieuguive);
                      } else {
                        socket.emit('tra-ve-du-lieu-tu-database', rows, 'loi-cu-phap', dulieuguive, err);
                      }
                    });
                  } else {
                    socket.emit('tra-ve-du-lieu-tu-database', rows, hanhdong, dulieuguive);
                    socket.emit('tra-ve-du-lieu-reactjs', rows, hanhdong, dulieuguive);
                  }
                }
              }, socket.username);
            } 
            else {
              ExecuteQuery(data, function(err, rows){
                if (err) {
                  socket.emit('tra-ve-du-lieu-tu-database', rows, 'loi-cu-phap', dulieuguive, err);
                  console.log(err);
                } else {
                  socket.emit('tra-ve-du-lieu-tu-database', rows, hanhdong, dulieuguive);
                  socket.emit('tra-ve-du-lieu-reactjs', rows, hanhdong, dulieuguive);
                }
              }, socket.username);
            }
          }
          else {
            console.log("Mysql error: khong the truy van mysql!");
            socket.emit('tro-ve-trang-dang-nhap');
          }
        });
      }
      else {
        if (dulieuguive != null && dulieuguive.transaction == true) {
          ExecuteQueryWithTransaction(data, function(err, rows) {
            if (err) {
              socket.emit('tra-ve-du-lieu-tu-database', rows, 'loi-cu-phap', dulieuguive, err);
            } else {
              if (dulieuguive.transactioncommit == true) {
                ExecuteQueryWithTransactionCommit(function (err, check) {
                  if (check) {
                    socket.emit('tra-ve-du-lieu-tu-database', rows, hanhdong, dulieuguive);
                    socket.emit('tra-ve-du-lieu-reactjs', rows, hanhdong, dulieuguive);
                  } else {
                    socket.emit('tra-ve-du-lieu-tu-database', rows, 'loi-cu-phap', dulieuguive, err);
                  }
                });
              } else {
                socket.emit('tra-ve-du-lieu-tu-database', rows, hanhdong, dulieuguive);
                socket.emit('tra-ve-du-lieu-reactjs', rows, hanhdong, dulieuguive);
              }
            }
          }, socket.username);
        } else {
          ExecuteQuery(data, function(err, rows){
            if (err) {
              socket.emit('tra-ve-du-lieu-tu-database', rows, 'loi-cu-phap', dulieuguive, err);
            } else {
              socket.emit('tra-ve-du-lieu-tu-database', rows, hanhdong, dulieuguive);
              socket.emit('tra-ve-du-lieu-reactjs', rows, hanhdong, dulieuguive);
            }
          }, socket.username);
        }
      }
    } catch (error) {
      console.log('Socket.IO error:' + error);
      socket.emit('tro-ve-trang-dang-nhap');
    }
  });

  socket.on('log_error_of_query', (error) => {
    let time = (new Date()).toISOString();
    console.log('Mysql queryError: ' + socket.username + ' --> ' + time + ' ~ ' + error);
  });

  socket.on('huy-query', function () {
    ExecuteQueryWithTransactionRollback(() => {
      socket.emit('da-huy-query');
    });
  });

  socket.on('them-account', function (data, dataAfterExecute) {
    console.log('Mysql log: Add account');
    var query = 'SELECT * FROM quanlyhocsinh.' + data.bang + ' WHERE `STT` = \'' + dataAfterExecute.insertId + '\' LIMIT 1';
    ExecuteQueryWithTransaction(query, function(err, rows){
      if (err) {
        console.log('Mysql error:' + err);
      } else {
        if (data.bang == 'QUANLY') {
          var id = rows[0]['Mã Quản Lý'];
          var ten = rows[0]['Họ Và Tên'];
          var hinh = rows[0]['Hình Ảnh'];
          var khuvuc = rows[0]['Cơ Sở'];
          var loaiquanly = rows[0]['Chức Vụ'];
          query = 'DROP USER IF EXISTS \'' + id + '\'@\'%\'; CREATE USER \'' + id + '\'@\'%\' IDENTIFIED BY \'' + id + '\'';
          ExecuteQueryWithTransaction(query, function(err, rows){
            if (err) {
              console.log('Mysql error:' + err);
            }
            else
            {
              query = 'GRANT ALL PRIVILEGES ON *.* TO \'' + id + '\'@\'%\' WITH GRANT OPTION';
              ExecuteQueryWithTransaction(query, function(err, rows){
                if (err) {
                  console.log('Mysql error:' + err);
                } else {
                  query = 'FLUSH PRIVILEGES';
                  ExecuteQueryWithTransaction(query, function(err, rows){
                    if (err) {
                      console.log('Mysql error:' + err);
                    } else {
                      query = 'INSERT INTO `quanlyhocsinh`.`ACCOUNT` (`account_id`, `fullname`, `permission`, `khuvuc`, `available`, `hinhanh`, `loaiquanly`) VALUES (\'?\', \'?\', \'~\', \'?\', \'1\', \'?\', \'?\')';
                      query = query.replace( '?' , id);
                      query = query.replace( '?' , ten);
                      query = query.replace( '?' , khuvuc);
                      query = query.replace( '?' , hinh);
                      query = query.replace( '?' , loaiquanly);
                      query = query.replace( '~' , data.per);
                      ExecuteQueryWithTransaction(query, function(err, rows){
                        if (err) {
                          console.log('Mysql error:' + err);
                        } else {
                          ExecuteQueryWithTransactionCommit(function (err, check) {
                            if (check) {
                              console.log('Mysql log: ' + id + ' is created');
                            }
                          });
                        }
                      }, socket.username);
                    }
                  }, socket.username);
                }
              }, socket.username);
            }
          }, socket.username);
        }
  
        if (data.bang == 'GIAOVIEN') {
          var id = rows[0]['Mã Giáo Viên'];
          var ten = rows[0]['Họ Và Tên'];
          var hinh = rows[0]['Hình Ảnh'];
          var khuvuc = 'ALL';
          query = 'DROP USER IF EXISTS \'' + id + '\'@\'%\'; CREATE USER \'' + id + '\'@\'%\' IDENTIFIED BY \'' + id + '\'';
          ExecuteQueryWithTransaction(query, function(err, rows){
            if (err) {
              console.log('Mysql error:' + err);
            }
            else {
              query = 'GRANT CREATE, INSERT, SELECT, UPDATE, DROP, DELETE  ON quanlyhocsinh.* TO \'' + id + '\'@\'%\'';
              ExecuteQueryWithTransaction(query, function(err, rows){
                if (err) {
                  console.log('Mysql error:' + err);
                } else {
                  query = 'FLUSH PRIVILEGES';
                  ExecuteQueryWithTransaction(query, function(err, rows){
                    if (err) {
                      console.log('Mysql error:' + err);
                    } else {
                      query = 'INSERT INTO `quanlyhocsinh`.`ACCOUNT` (`account_id`, `fullname`, `permission`, `khuvuc`, `available`, `hinhanh`) VALUES (\'' + id + '\', \'' + ten + '\', \'giaovien\', \'' + khuvuc + '\', \'1\', \'' + hinh + '\')';
                      ExecuteQueryWithTransaction(query, function(err, rows){
                        if (err) {
                          console.log('Mysql error:' + err);
                        } else {
                          ExecuteQueryWithTransactionCommit(function (err, check) {
                            if (check) {
                              console.log('Mysql log: ' + id + ' is created');
                            }
                          });
                        }
                      }, socket.username);                
                    }
                  }, socket.username);
                }
              }, socket.username);
            }
          }, socket.username);
        }
      }
    }, socket.username);
  });

  socket.on('all-notification-update', function (data) {
    let query = 'SELECT * FROM userconnect ';
    let whereQuery = '';
    switch (data.to) {
      case 'users':
        for (let id of data.IDs) {
          if (whereQuery == '') {
            whereQuery += 'WHERE `userid` = \'' + id + '\'';
          } else {
            whereQuery += ' AND `userid` = \'' + id + '\'';
          }
        }
        break;
      default:
    }
    query += whereQuery;
    ExecuteQuery(query, function(err, rows){
      if (err) {
        socket.emit('tro-ve-trang-dang-nhap');
      } else {
        for (let row of rows) {
          io.to(row.id).emit('all-notification-update', data);
          console.log(row);
        }
      }
    }, socket.username);
  });

  socket.on('googleapi', function (params) {
    socket.emit('server-is-processing');
    switch (params.function) {
      case 'laylichgiaovien':
        layLichHoc(params)
        .then(data => {
          return socket.emit('googleapicallback', params.key, data);
        })
        .catch(err => {
          if (err.err) {
            return socket.emit('googleapicallback', 'error', {error: '' + err.err});
          }
          return socket.emit('googleapicallback', 'error', {error: '' + err});
        });
        break;
      case 'themlophoc':
        themLichHoc({
          calendarname: params.calendarname,
          mamon: params.mamon,
          objadd: params.objadd,
          coso: params.coso,
          startTime: params.startTime,
          endTime: params.endTime,
          email: params.email,
        })
        .then(data => {
          return socket.emit('googleapicallback', params.key, data);
        })
        .catch(err => {
          if (err.err) {
            return socket.emit('googleapicallback', 'error', {error: '' + err.err});
          }
          return socket.emit('googleapicallback', 'error', {error: '' + err});
        });
        break;
      case 'xoalichhoc':
        xoaLichHoc(params.data)
        .then(data => {
          return socket.emit('googleapicallback', params.key, data);
        })
        .catch(err => {
          if (err.err) {
            return socket.emit('googleapicallback', 'error', {error: '' + err.err});
          }
          return socket.emit('googleapicallback', 'error', {error: '' + err});
        });
        break;
        break;
      default:
        return socket.emit('googleapicallback', 'error', {error: 'googleapi: Không tìm thấy function!'});
        break;
    }
    // socket.emit('googleapicallback', params.key, data);
  });

  socket.on('disconnect' , function () {
    let query = 'DELETE FROM `userconnect` WHERE (`id` = \'!\?!\'); '
    query = query.replace('!\?!', socket.id);
    ExecuteQuery(query, function(err, rows){
      if (err) {
        socket.emit('tro-ve-trang-dang-nhap');
        if (connection != null) {
          connection.destroy();
        }
      } else {
        console.log("Socket.IO log: " + socket.id + ":" + socket.username + " da ngat ket noi socket.io!");
        if (connection != null) {
          connection.destroy();
        }
      }
    }, socket.username);
  });

  socket.on('webdav', (option) => {
    switch (option.fn) {
      case 'dir':
        webDavclient.getDirectoryContents(option.url)
        .then(contents => {
          socket.emit('webdav', {...option, buffer: contents});
        })
        .catch(e => {
          socket.emit('webdav', option, e);
        });
        break;
      case 'read':
        webDavclient.getFileContents(option.url, { format: "binary" })
        .then(contents => {
          socket.emit('webdav', {...option, buffer: contents});
        })
        .catch(e => {
          socket.emit('webdav', option, e);
        });
        break;
      default:
    }
  })
});
//#endregion

/**
 * Requests form clients
 */
//#region 
app.post('/checksession', function(req, res) {
  if (!req.session.user) {
    return res.status(202).send('Vui lòng đăng nhập để máy chủ lưu session cho phiên sử dụng sau!');
  } else {
    return res.status(200).send({
      khuvuc : req.session.khuvuc,
      fullname : req.session.fullname,
      permission : req.session.permission,
      hinhanh : req.session.hinhanh,
      loaiquanly : req.session.loaiquanly,
    });
  }
});

app.post('/', urlencodedParser, function(req, res){
  var x = 0;
  var user = req.body.txtusername;
  var pass = req.body.txtpassword;

  let query = 'SELECT * FROM quanlyhocsinh.ACCOUNT WHERE `account_id` = \'' + user + '\'';
  ConnecttoDatabase(user, pass, function(x){
    if ( x == 1) {
      ExecuteQuery(query, function (err, rows) {
        if (err) {
          console.log('Mysql error:' + err);
          return res.status(500).send();
        }
        if (rows.length == 0) {
          return res.status(203).send();
        } else {
          if (rows[0].available == 0) {
            return res.status(202).send();
          } else {
            req.session.user = user;
            req.session.pass = pass;
            return res.status(200).send(rows);
          }
        }
      }, user);
    } else {
      return res.status(204).send();
    }
  });
});

app.post('/trangchu', urlencodedParser, function(req, res){
  if (req.session.user == null) {
    return res.status(404).redirect('/');
  }

  if (req.body.function == 'gan-ten-cho-socket') {
    return res.status(200).send({ user : req.session.user , pass : req.session.pass });
  } else {
    req.session.khuvuc = req.body.txtkhuvuc;
    req.session.fullname = req.body.txtfullname;
    req.session.permission = req.body.txtpermission;
    req.session.hinhanh = req.body.url;
    req.session.loaiquanly = req.body.loaiquanly;
    return res.status(200).render("trangchu", { 
      username : req.session.user,
      khuvuc : req.body.txtkhuvuc,
      fullname : req.body.txtfullname,
      permission : req.body.txtpermission,
      urlhinh : req.body.url,
      loaiquanly : req.body.loaiquanly
    });
  }
});

app.post('/trangchu/uploadimage', function(req, res){
  try {
    let form = new formidable.IncomingForm();
    let filepath;
    let new_name;
  
    form.on('fileBegin', function (name, file){
      while (1) {
        new_name = randomstring.generate(15) + "." + file.name.split(".")[1];
        if (!fs.existsSync(__dirname + '/public/img/hinhupload/' + new_name)) {
          break;
        }
      }
      file.path = __dirname + '/public/img/hinhupload/' + new_name;
      filepath = file.path;
    });
  
    form.on('end', function (err) {
      if (err) {
        console.log('Formidable error:' + err)
      } else {
        if (filepath != null && filepath != '') {
          imagemagick.resize({
            srcPath: filepath,
            dstPath: filepath,
            quality: 0.8,
            width:   256
          }, function(err, stdout, stderr){
            if (err) {
              console.log('Imagemagick error:' + err);
              return res.status(400).send('Imagemagick error:' + err);
            } else {
              let imageData = fs.readFileSync(__dirname + "/public/img/hinhupload/" + new_name);
              let fn = async () => {
                let nameSaveToServer = randomstring.generate(15) + "." + new_name.split(".")[1];
                while (1) {
                  try {
                    await webDavclient.stat("/Public/img/avatar/" + nameSaveToServer)
                    .then(() => {
                      nameSaveToServer = randomstring.generate(15) + "." + new_name.split(".")[1];
                    })
                  } catch (e) {
                    break;
                  }
                }

                await webDavclient.putFileContents("/Public/img/avatar/" + nameSaveToServer, imageData, {format: "binary", overwrite: true})
                .then((v) => {
                  try {
                    fs.removeSync(__dirname + "/public/img/hinhupload/" + new_name);
                  } catch (e) {
                  }
                  return res.status(200).send(nameSaveToServer);
                })
                .catch((e) => {
                  return res.status(400).send('Upload-image error:' + e);
                })
              }
              fn();
            }
          });
        } else {
          return res.status(400).send('Upload-image error: filepath are empty');
        }
      }
    });
  
    form.parse(req);
  } catch (err) {
    return res.status(400).send('Upload-image error:' + err);
  }
});

app.post('/trangchu/deleteimage', urlencodedParser, function (req, res) {
  let imagename = req.body.imgname;
  webDavclient.stat("/Public/img/avatar/" + imagename)
  .then(() => {
    webDavclient.deleteFile("/Public/img/avatar/" + imagename);
    res.status(200).send();
  })
  .catch((e) => {
    res.status(501).send('Delete image error: ' + e);
  })
});

app.post("/trangchu/reupimage", function(req, res){
  try {
    let form = new formidable.IncomingForm();
    let filepath;
    let old_name;
    let new_name;
  
    form.on('field', function(name, value) {
      old_name = value;
    });
  
    form.on('fileBegin', function (name, file){
      while (1) {
        new_name = randomstring.generate(15) + "." + file.name.split(".")[1];
        if (!fs.existsSync(__dirname + '/public/img/hinhupload/' + new_name)) {
          break;
        }
      }
      file.path = __dirname + '/public/img/hinhupload/' + new_name;
      filepath = file.path;
    });
  
    form.on('end', function (err) {
      if (err) {
        console.log('Formidable error:' + err)
      } else {
        if (filepath != null && filepath != '') {
          imagemagick.resize({
            srcPath: filepath,
            dstPath: filepath,
            quality: 0.8,
            width:   256
          }, function(err, stdout, stderr){
            if (err) {
              console.log('Imagemagick error:' + err);
              return res.status(400).send('Imagemagick error:' + err);
            } else {
              let imageData = fs.readFileSync(__dirname + "/public/img/hinhupload/" + new_name);
              let fn = async () => {
                let nameSaveToServer = randomstring.generate(15) + "." + new_name.split(".")[1];
                while (1) {
                  try {
                    await webDavclient.stat("/Public/img/avatar/" + nameSaveToServer)
                    .then(() => {
                      nameSaveToServer = randomstring.generate(15) + "." + new_name.split(".")[1];
                    })
                  } catch (e) {
                    break;
                  }
                }

                await webDavclient.putFileContents("/Public/img/avatar/" + nameSaveToServer, imageData, {format: "binary", overwrite: true})
                .then((v) => {
                  try {
                    webDavclient.deleteFile("/Public/img/avatar/" + old_name);
                    fs.removeSync(__dirname + "/public/img/hinhupload/" + new_name);
                  } catch (e) {
                    // console.log(e);
                  }
                  return res.status(200).send(nameSaveToServer);
                })
                .catch((e) => {
                  return res.status(400).send('Reup-image error:' + e);
                })
              }
              fn();
            }
          });
        } else {
          return res.status(400).send('Reup-image error: filepath are empty');
        }
      }
    });
    form.parse(req);
  } catch (err) {
    return res.status(400).send('Reup-image error:' + err);
  }
});

app.post('/doimatkhau', urlencodedParser, function (req, res) {
  var check = mysql.createConnection({
      host : houston123server.mysql.host,
      user : req.session.user,
      password : req.body.oldpass,
  });

  check.connect(function(error){
      if(!!error){
        check.destroy();
        return res.status(401).send('Sai mật khẩu, đổi mật khẩu không thành công!');
      } else {
        var query = 'SET PASSWORD FOR \'?\'@\'%\' = PASSWORD(\'?\')';
        query = query.replace( '?' , req.session.user );
        query = query.replace( '?' , req.body.newpass );
        check.query(query , function (err, rows) {
          if (err) {
            check.destroy();
            return res.status(500);
          } else {
            check.destroy();
            return res.status(200).send('Đúng mật khẩu');
          }
        });
      }
  });
});

app.get("/dangxuat" , function (req, res) {
  if (req.session != null) {
    req.session.destroy();
  }
  return res.status(200).redirect('/');
});

app.get("/trangchu" , function (req, res) {
  return res.status(403).redirect('/');
});

app.get("/" , function (req, res) {
  return res.status(200).render("dangnhap");
});

//#endregion

/**
 * Google API Calendar
 */
//#region 
var google_calendar_dev; // google_calendar_dev = 1 to log in server.
var OAuth2 = google.auth.OAuth2;
var TOKEN_DIR = './credentials/';
var TOKEN_PATH = TOKEN_DIR + 'googleaip_calendar_token.json';
var oauth2Client = new OAuth2(
  houston123server.googlecalendar.clienid,
  houston123server.googlecalendar.cliensecret,
  houston123server.googlecalendar.clienlinkcallback,
);
var google_auth_url = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: ['https://www.googleapis.com/auth/calendar',],
});

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  // console.log('Token stored to ' + TOKEN_PATH);
}

function setCredentials() {
  return new Promise(function(resolve, reject) {
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        return reject({err: 'setCredentials ' + err, type:'kocotoken'});
      } else {
        oauth2Client.setCredentials(JSON.parse(token));

        if (!oauth2Client.credentials.refresh_token) {
          return reject({err: 'setCredentials ' + new Error('Khong co refest token'), type:'loirefresh_token'});
        }

        fetch('https://www.googleapis.com/oauth2/v2/tokeninfo?access_token=' + oauth2Client.credentials.access_token)
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          if (!json.error_description) {
            return resolve();
          } else {
            oauth2Client.refreshAccessToken(function(err, tokens){
              if (err) {
                return reject({err: 'setCredentials ' + err, type:'loirefresh_token'});
              } else {
                storeToken(tokens);
                oauth2Client.setCredentials(tokens);
                return resolve();
              }
            });
          }
        });
      }
    });
  });
}

function listEvents(calendarname) {
  var calendar = google.calendar('v3');
  var curr = new Date;
  var first = curr.getDate() - curr.getDay();
  var firstday = new Date(curr.setDate(first)).toISOString();

  return getIDbyCalendarName(calendarname)
  .then(data => {
    let sync = async () => {
      let d = [];
      for (const i in data) {
        let a = await new Promise((resolve, reject) => {
          calendar.events.list({
            auth: oauth2Client,
            calendarId: data[i],
            timeMin: firstday,
            maxResults: 10000,
            // timeMax: lastday,
            singleEvents: true,
            orderBy: 'startTime'
          }, (err, response) => {
            if (err) {
              return reject('listEvents: ' + err);
            } else {
              return resolve(response);
            }
          });
        })
        d = d.concat(a.items);
      }
      return Promise.resolve(d);
    }
    return sync();
  })
  .then(data => {
    return Promise.resolve(data);
  })
  .catch(err => {
    return Promise.reject(err);
  });
}

function listCalendar(callback) {
  var calendar = google.calendar('v3');
  calendar.calendarList.list({
    auth: oauth2Client,
  }, function (err, data) {
    if (err) {
      if (google_calendar_dev == 1)
        console.log('listCalendar: ' + err);
      callback('listCalendar: ' + err);
    } else {
      callback(undefined, data);
    }
  });
}

function getIDbyCalendarName(value) {
  return new Promise((resolve, reject) => {
    var danhsachcalendar = {};
    listCalendar(function (e, d) {
      if (e) {
        return reject(e);
      }

      if (d.items.length > 0) {
        for (let i of d.items) {
          danhsachcalendar[i.summary] = i.id;
        }
      }

      let danhsachcallback = {};
      let count = 0;
      for (let index = 0; index < value.length; index++) {
        let v = value[index];
        if (danhsachcalendar[v] != null) {
          danhsachcallback[v] = danhsachcalendar[v];
          count++;
        }
      }

      if (count > 0) {
        return resolve(danhsachcallback);
      } else {
        return reject(new Error(('getIDbyCalendarName: Không tìm thấy lịch tên ?').replace('?', value)));
      }
    });
  });
}

function layLichHoc(option) {
  return new Promise(function (resolve, reject) {
    let a = async () => {
      try {
        let setC = await setCredentials();
        if (option.calendarname != null) {
          listEvents(option.calendarname)
          .then(data => {
            var temp = [];
            var backdata = {};
            for (let key in option) {
              temp = [];
              switch (key) {
                case 'mamon':
                  for (let index = data.length; index--;) {
                    if ( data[index].summary == option.mamon) {
                      temp = temp.concat(data[index]);
                    }
                  };
                  backdata.mamon = temp;
                  break;
                case 'email':
                  for (let index = data.length; index--;) {
                    if (data[index].attendees != null) {
                      for (let iterator of data[index].attendees) {
                        if ( iterator.email == option.email) {
                          temp = temp.concat(data[index]);
                          break;
                        }
                      }
                    }
                  }
                  backdata.email = temp;
                  break;
                case 'getRaw':
                  if (option['getRaw']) {
                    backdata.rawData = data;
                  }
                  break;
                default:
                  break;
              }
            }
            return resolve(backdata);
          })
          .catch(err => reject(err));
        } else {
          return reject(new Error('layLichHoc: Không tồn tại calendarname trong option.'));
        }
      } catch (e) {
        return reject(e);
      }
    }
    a();
  });
}

function themLichHoc(option) {
  let fn = async () => {
    try {
      let setC = await setCredentials();
      var calendar = google.calendar('v3');
      
      if (option.calendarname == null) {
        return Promise.reject(new Error('themLichHoc: option.calendarname is not defined'));
      }
      if (option.mamon == null) {
        return Promise.reject(new Error('themLichHoc: option.mamon is not defined'));
      }
      if (option.objadd == null) {
        return Promise.reject(new Error('themLichHoc: option.objadd is not defined'));
      }
      if (option.coso == null) {
        return Promise.reject(new Error('themLichHoc: option.coso is not defined'));
      }
      if (option.startTime == null) {
        return Promise.reject(new Error('themLichHoc: option.startTime is not defined'));
      }
      if (option.endTime == null) {
        return Promise.reject(new Error('themLichHoc: option.endTime is not defined'));
      }
      if (option.email == null) {
        return Promise.reject(new Error('themLichHoc: option.email is not defined'));
      }

      return getIDbyCalendarName(option.calendarname)
      .then(data => {
        let sync = async () => {
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              for (let value in option.objadd) {
                if (option.objadd.hasOwnProperty(value)) {
                  let _objthu = value.split('!')[0];
                  let _objstartend = value.split('!')[2];
                  if (_objstartend == 0) {
                    let option_endtime = new Date(option.endTime);
                    let option_starttime = new Date(option.startTime);            
                    let thu = ['SU','MO','TU','WE','TH','FR','SA'];
                    let repreat = "RRULE:FREQ=WEEKLY;UNTIL=?;BYDAY=?"
                    let repreat_time = option_endtime.toISOString();
                    repreat_time = repreat_time.split('.')[0];
                    repreat_time += 'Z';
                    repreat_time = repreat_time.replace(/-/g, '');
                    repreat_time = repreat_time.replace(/:/g, '');
                    repreat = repreat.replace('?', repreat_time);
                    repreat = repreat.replace('?', thu[_objthu - 1]);
                    let thisday = option_starttime;
                    let today = new Date(option.startTime);
                    today.setHours(0, 0, 0, 0)
                    let day = thisday.getDate() - thisday.getDay() + (_objthu - 1);
                    do {
                      option_starttime.setDate(day);
                      option_starttime.setHours(0, 0, 0, 0);
                      day += 7;
                    } while (option_starttime < today);

                    let time_start = option.objadd[value].split(':');
                    let h = time_start[0];
                    let p = time_start[1];
                    let g = time_start[2];
                    option_starttime.setHours(h, p, g, 0);
                    let start_datetime = new Date(option_starttime.toISOString());

                    let value2 = value.slice(0, value.length - 1) + '1';
                    let time_end = option.objadd[value2].split(':');
                    h = time_end[0];
                    p = time_end[1];
                    g = time_end[2];
                    option_starttime.setHours(h, p, g, 0);
                    let end_datetime = new Date(option_starttime.toISOString());

                    let event = {
                      'summary': option.mamon,
                      'location': option.coso,
                      // 'description': option.description,
                      'start': {
                        'dateTime': start_datetime.toISOString(),
                        'timeZone': 'Asia/Ho_Chi_Minh',
                      },
                      'end': {
                        'dateTime': end_datetime.toISOString(),
                        'timeZone': 'Asia/Ho_Chi_Minh',
                      },
                      "attendees": [
                        {
                          "email": option.email,
                        }
                      ],
                      "recurrence": [
                        repreat,
                      ],
                    };

                    let a = await new Promise((resolve, reject) => {
                      calendar.events.insert({
                        auth: oauth2Client,
                        calendarId: data[key],
                        resource: event,
                      }, function(err, event) {
                        if (err) {
                          return reject(new Error('themLichHoc ' + err));
                        } else {
                          return resolve(event);
                        }
                      });
                    })
                  }
                }
              }
            }
          }
          return Promise.resolve('done');
        }
        return sync();
      })
      .then(data => {
        return Promise.resolve(data);
      })
      .catch(err => {
        // console.log(err);
        return Promise.reject(err);
      });
    } catch (e) {
      return Promise.reject('themLichHoc error: ' + e);
    }
  }
  return fn();
}

function xoaLichHoc(option) {
  let fn = async () => {
    try {
      let setC = await setCredentials();
      var calendar = google.calendar('v3');

      if (option == null || option.length == 0) {
        return Promise.reject(new Error('xoaLichHoc: option is null'));
      }

      let sync = async () => {
        for (let value of option) {
          let a = await new Promise((resolve, reject) => {
            calendar.events.delete({
              auth: oauth2Client,
              calendarId: value.calendarid,
              eventId: value.evenid,
            }, function(err, event) {
              if (err) {
                return reject(new Error('xoaLichHoc ' + err));
              } else {
                return resolve(event);
              }
            });
          });

        }
        return Promise.resolve('done');
      }
      return sync();
    } catch (e) {
      return Promise.reject('themLichHoc error: ' + e);
    }
  }
  return fn();
}

app.get('/googleapi/checktoken' , function (req, res) {
  setCredentials()
  .then(()=>{
    return res.send({status:'OK'});
  })
  .catch((err) => {
    switch (err.type) {
      case 'loirefresh_token':
        let a = new Promise((resolve, reject) => {
          oauth2Client.revokeToken(oauth2Client.credentials.access_token, (err, body, res) => {
            if (err) {
              return reject(err);
            } else {
              return resolve();
            }
          });
        });

        a.then(() => {
          return res.send({status:'kocotoken', data:google_auth_url});
        })
        .catch((err2) => {
          return res.send({status:err.type + '', data:google_auth_url});
        })
        break;
      case 'kocotoken':
        return res.send({status:err.type + '', data:google_auth_url});
        break;
      default:
        return res.send({status:'kocotoken', data:google_auth_url});
    }
  })
});

app.get('/googleapi/revoketoken', function (req, res) {
  setCredentials()
  .then(() => {
    let a = new Promise((resolve, reject) => {
      oauth2Client.revokeToken(oauth2Client.credentials.access_token, (err, body, res) => {
        if (err) {
          return reject(err);
        } else {
          return resolve();
        }
      });
    });
    a.then(()=> {
      return res.status(200).send('OK');
    });
  })
  .catch((err) => {
    if (err.type == 'loirefresh_token') {
      let a = new Promise((resolve, reject) => {
        oauth2Client.revokeToken(oauth2Client.credentials.access_token, (err, body, res) => {
          if (err) {
            return reject(err);
          } else {
            return resolve();
          }
        });
      });
      a.then(() => {
        return res.status(200).send('OK');
      })
      .catch(() => {
        return res.status(200).send('OK');
      });
    } else {
      return res.status(200).send('OK');
    }
  });
});

app.get('/googleapi/callback' , function (req, res) {
  let get = false;
  let value;
  for (let v of req.rawHeaders) {
    if (get == true) {
      value = v;
      break;
    }

    if (v == 'Cookie')
      get = true;
  }
  let str = value;
  let n = str.lastIndexOf("io=") + 3;
  value = str.substring(n, str.length).split(';')[0];

  if (!req.query.error) {
    oauth2Client.getToken(req.query.code, function (err, tokens) {
      if (!err) {
        storeToken(tokens);
        setCredentials()
        .then(() => {
          io.sockets.connected[value].emit('calendarsettup-react-successed');
          return res.status(200).render('callback');
        })
        .catch((err) => {
          if (err.type) {
            let a = new Promise((resolve, reject) => {
              oauth2Client.revokeToken(oauth2Client.credentials.access_token, (err, body, res) => {
                if (err) {
                  return reject(err);
                } else {
                  return resolve();
                }
              });
            });
            a.then(()=>{
              return res.status(401).redirect(google_auth_url);
            });
          } else {
            return res.status(500).send(err);
          }
        });
      }
    });
  } else {
    return res.status(401).render('callback');
  }
});
//#endregion

app.get('*', function (req, res) {
  res.send('Bạn không thể truy cập vào đường dẫn này!');
});