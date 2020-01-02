var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var ejs = require('ejs');
var crypto = require('crypto');
var path = require('path');
var multer = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    //파일이 이미지 파일이면
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
        console.log("이미지 파일")
        cb(null, 'public/images')
    //텍스트 파일이면
    } else if (file.mimetype == "application/pdf" || file.mimetype == "application/txt" || file.mimetype == "application/octet-stream") {
        console.log("텍스트 파일")
        cb(null, 'public/texts')
    }},
    //파일이름 설정
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
    
})
var upload = multer({ storage: storage });
    
var client = mysql.createConnection({
    user:'root',
    password: '0000',
    database: 'och'
});


var __viewDir = path.join(__dirname, '/public/views');

var app = express();
app.set('views', path.join(__viewDir));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'/public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
    secret: '@#@$ochShop#@$#$',
    resave: true,
    saveUninitialized: true
}));


app.get('/',function(request, response){
    if(request.session.user){
        client.query('SELECT * FROM web_promotion', function (error, results) {
            
            response.render('index.ejs', {
            data: results,
            loginInfo : request.session.user,
            loginSess : '1',
            });
        });
    }else{
        client.query('SELECT * FROM web_promotion', function (error, results) {
            
            response.render('index.ejs', {
            data: results,
            loginSess : '0'
            });
        });
    }
});

app.get('/logIn', function(request,response){
    response.render('member/logIn.ejs',{
        loginSess : '0',
        fail: '0'
    });
});

app.get('/logOut', function(request,response){
    if(request.session.user){       
            
        console.log("'"+request.session.user.id + "'" + ' LogOut now    *time(' + new Date()+')');       
        request.session.destroy(function(err){
            if(err){
                console.log('세션 삭제 에러');
                return;
            }
            console.log('세션 삭제 성공');
        })
        response.redirect('/');
    }
});

app.get('/signUpPolicy',function(request,response){
    response.render('member/signUp.ejs',{
        loginSess : '0',
        signUpAccess: 'no'
    });
})

app.get('/signUp', function(request, response){
    if(request.session.access){
        response.render('member/signUp.ejs',{
            loginSess : '0',
            signUpAccess: 'ok'       
        });
        request.session.destroy(function(err){
            if(err){
                console.log('세션 삭제 에러');
                return;
            }
        })
    }else if(!request.session.access){
        response.redirect('/signUpPolicy');
    }
})

app.get('/news', function(request, response){
    if(request.session.user){
        client.query('SELECT * FROM web_promotion', function (error, results) {          
            response.render('news/newsMain.ejs', {
            data: results,
            loginInfo : request.session.user,
            loginSess : '1'
            });
        });
    }else{
        client.query('SELECT * FROM web_promotion', function (error, results) {
            response.render('news/newsMain.ejs', {
            data: results,
            loginSess : '0'
            });
        });
    }   
})

app.get('/notices', function(request, response){       
    client.query('SELECT count(*) count FROM web_notice', function (error, results) {
        if(results[0].count != 0){
            if(request.session.user){
                client.query('select * from web_notice order by seq desc', function (error, data) {    
                    response.render('notice/noticeMain.ejs', {
                    data: data,
                    loginInfo : request.session.user,
                    loginSess : '1'
                    });
                });
            }else{
                client.query('select * from web_notice order by seq desc', function (error, data) { 
                    response.render('notice/noticeMain.ejs', {
                    data: data,
                    loginSess : '0'
                    });  
                });
            }
        }else{
            if(request.session.user){
                response.render('notice/noticeMain.ejs', {
                    data: '0',
                    loginInfo : request.session.user,
                    loginSess : '1'
                }); 
            }else{
                response.render('notice/noticeMain.ejs', {
                    data: '0',
                    loginSess : '0'
                }); 
            } 
        }
    });
});

app.get('/community', function(request, response){
    client.query('select count(*) count from web_community', function(error, data){
        if(data[0].count != 0){
            if(request.session.user){
                client.query('select * from web_community order by seq desc',function(error,results){
                    response.render('community/communityMain.ejs', {
                        data: results,
                        loginInfo : request.session.user,
                        loginSess : '1'
                    }); 
                })
            }else{
                client.query('select * from web_community order by seq desc',function(error, results){
                    response.render('community/communityMain.ejs', {
                        data: results,
                        loginSess : '0'
                    }); 
                })
            }
        }else{
            if(request.session.user){
                response.render('community/communityMain.ejs', {
                    data: '0',
                    loginInfo : request.session.user,
                    loginSess : '1'
                });
            }else{
                response.render('community/communityMain.ejs', {
                    data: '0',
                    loginSess : '0'
                });
            }
        }
    });  
})

app.get('/notices/noticeAdd', function(request, response){
    if(request.session.user){
        if(request.session.user.grade >= 3){
            response.render('notice/noticeAdd.ejs',{
                loginInfo : request.session.user,
                loginSess : '1'
            })
        }else{
            response.redirect('/');
        }
    }else{
        response.redirect('/');
    }
})

app.get('/community/communityAdd', function(request, response){
    if(request.session.user){        
        response.render('community/communityAdd.ejs',{
            loginInfo : request.session.user,
            loginSess : '1'
        })        
    }else{
        response.redirect('/');
    }
})

app.get('/notices/noticeDetail/:id', function(request, response){
    var seq = request.params.id;

    client.query('update web_notice set views = views + 1 where seq = ?',[seq], function(error, results){
        if(request.session.user){
            client.query('select * from web_notice where seq=?',[seq], function(error, data){
                response.render('notice/noticeDetail.ejs',{
                    data : data,
                    loginInfo : request.session.user,
                    loginSess : '1'
                })
            });  
        }else{ 
            client.query('select * from web_notice where seq=?',[seq], function(error, data){
                response.render('notice/noticeDetail.ejs',{
                    data : data,
                    loginSess : '0'
                })
            });  
        }             
    })
});

app.get('/community/communityDetail/:id', function(request, response){
    var seq = request.params.id;

    client.query('update web_community set views = views + 1 where seq = ?',[seq], function(error, results){
        if(request.session.user){
            client.query('select * from web_community where seq=?',[seq], function(error, data){
                response.render('community/communityDetail.ejs',{
                    data : data,
                    loginInfo : request.session.user,
                    loginSess : '1'
                })
            });  
        }else{ 
            client.query('select * from web_community where seq=?',[seq], function(error, data){
                response.render('community/communityDetail.ejs',{
                    data : data,
                    loginSess : '0'
                })
            });  
        }             
    })
          
});

app.post('/notices/noticeDelete',function(request, response){

    var seq = request.body.seq;
    client.query('delete from web_notice where seq=?',[seq], function(error, data){
        response.send(data);
    })

});

app.post('/community/communityDelete',function(request, response){

    var seq = request.body.seq;
    client.query('delete from web_community where seq=?',[seq], function(error, data){
        response.send(data);
    })

});

app.get('/market', function(request, response){
    var result;
    client.query('select count(*) count from web_market',function(error, results){
        result = results[0].count;
        if(request.session.user){     
            client.query('select * from web_market', function (error, results) {
                if(result == '0'){result='0';}else{result=results}
                response.render('market/marketMain.ejs',{
                    data: result,
                    loginInfo : request.session.user,
                    loginSess : '1'  
                });
            });
        }else{
            client.query('select * from web_market', function (error, results) {
                
                if(result == '0'){result='0';}else{result=results}
                response.render('market/marketMain.ejs',{
                    data: result,
                    loginSess : '0'
                });
            });
        }   
    });
    
})

app.get('/market/:id', function(request, response){
    var name = request.params.id;
    var result;
    if(request.session.user && (request.session.user.grade >= 3)){
    client.query('select count(*) count from web_market where name=?', [name],function(error, results){
        result = results[0].count;             
            client.query('select * from web_market where name=?', [name], function (error, results) {
                if(result == '0'){result='0';}else{result=results}
                response.render('market/marketMain.ejs',{
                    data: result,
                    loginInfo : request.session.user,
                    loginSess : '1'  
                });
            });
        });
        }else{
            response.redirect('/market');
        }   
    
    
})




app.get('/events', function(request, response){
    response.redirect('/')
})

app.get('/admin',function(request,response){
    if(request.session.user){
        if(request.session.user.grade >= 3){
            response.render('admin/adminMain.ejs',{
                loginInfo : request.session.user,
                loginSess : '1'
            })
        }else{
            response.redirect('/');
        }
    }else{
        response.redirect('/');
    }
});

app.get('/admin/memManage',function(request,response){
    if(request.session.user){
        if(request.session.user.grade >= 4){
            client.query('select * from web_member',function(error, results){
                client.query('select title, code from web_subject',function(error,data){
                    response.render('admin/adminMemManage.ejs',{
                        data: results,
                        data2: data,
                        loginInfo : request.session.user,
                        loginSess : '1',
                        detail: '1'
                    })
                })
            })
        }else{            
            response.redirect('/');
        }
    }else{
        response.redirect('/');
    }
});

app.get('/admin/memManage/:id',function(request,response){
    var id = request.params.id;
    if(request.session.user){
        if(request.session.user.grade >= 4){
            client.query('select * from web_member where id=?',[id],function(error, results){
                client.query('select title, code from web_subject',function(error,data){
                    response.render('admin/adminMemManage.ejs',{
                        data: results,
                        data2: data,
                        loginInfo : request.session.user,
                        loginSess : '1',
                        detail: '0'
                    })
                })
            })
        }else{            
            response.redirect('/');
        }
    }else{
        response.redirect('/');
    }
});


app.post('/admin/memManage/delete',function(request,response){
    var id = request.body.id;
    var code = request.body.code;
    var pw = request.body.pw;
    var phone = request.body.phone;
    if(request.session.user){
        if(request.session.user.grade >= 4){
            client.query('SELECT subject FROM web_member WHERE id=?',[id],function(error,results){
                var str;
                if(results[0].subject != 'null'){
                    str = results[0].subject;
                    console.log(str);
                    str = str.replace(','+code,'');
                    console.log(str);
                }        
                client.query('update web_member set subject =? where id=?',[str, id],function(error, data){
                    client.query('update web_market set num = num - 1 where code=?',[code],function(error, data){
                        response.send(data);
                    });
                });
            });
        }
        else{
            response.redirect('/');
        }
    }else{
        response.redirect('/');
    }
});

app.post('/admin/memManage/update', function(request, response){
    var preId = request.body.preId;
    var id = request.body.id;
    var name = request.body.name;
    var passwd = request.body.pw;
    var phone = request.body.phone;
    var grade = request.body.grade;
    var register = request.body.register;
    console.log('이전 아이디 : ' + preId);
    console.log('바꿀 아이디 : ' + id);
    console.log('바꿀 아이디 : ' + passwd);
    if(request.session.user){
        if(request.session.user.grade >= 4){
            if(preId == id){                
                console.log('이전 아이디와 같음 인식');                
                client.query('update web_member set id=?,name=?,passwd=?,phone=?,grade=?,register=? where id=?',[id, name, passwd,phone,grade,register,id],function(error, data){
                    console.log('업데이트 성공!');
                    response.send(data);
                });                
            }else{
                client.query('SELECT id, count(*) count FROM web_member WHERE id=?',[id],function(error,results){
                    console.log('이전 아이디와 다름 인식');
                    if(results[0].count == '0'){
                        client.query('update web_member set id=?,name=?,passwd=?,phone=?,grade=?,register=? where id=?',[id, name, passwd,phone,grade,register,preId],function(error, data){
                            console.log('업데이트 성공!');
                            response.send(data);
                        });
                    }else{
                        console.log('업데이트 실패');
                        var fail = '1';
                        response.send(fail);
                    }
                    
                });
            }
        }
    }
    else{
        response.redirect('/');
    }
});


app.get('/admin/marketAdd',function(request,response){
    if(request.session.user){
        if(request.session.user.grade >= 3){
        response.render('market/marketAdd.ejs',{
            loginInfo : request.session.user,
            loginSess : '1'
        })
    }else{
        response.redirect('/');
    }
    }else{
        response.redirect('/');
    }
});

app.get('/news/newsAdd',function(request,response){
    if(request.session.user){
        if(request.session.user.grade >= 3){
        response.render('news/newsAdd.ejs',{
            loginInfo : request.session.user,
            loginSess : '1'
        })
    }else{
        response.redirect('/');
    }
    }else{
        response.redirect('/');
    }
});

app.get('/admin/marketAdd/delete/:id', function(request,response){
    var code;
    if(request.session.user){
        if(request.session.user.grade >= 3){
            client.query('select code, count(*) from web_market where seq=?', [request.params.id], function(error,data){
                code = data[0].code;
                console.log(code);
                client.query('delete from web_subject where code=?', [code]);
                client.query('delete from web_market where seq=?', [request.params.id], function(error,data){
                    response.redirect('/market'); 
                });
            });
        }
        else{
            response.redirect('/');
        }
    }else{
        response.redirect('/');
    }
});

app.get('/admin/news/delete/:id', function(request,response){
    var code;
    if(request.session.user){
        if(request.session.user.grade >= 4){            
            client.query('delete from web_promotion where seq=?', [request.params.id], function(error,data){
                response.redirect('/market'); 
            });            
        }
        else{
            response.redirect('/news');
        }
    }else{
        response.redirect('/news');
    }
});


app.get('/market/marketDetail/:id', function(request,response){
    
    if(request.session.user){
        client.query('select * from web_market where seq=?',[request.params.id], function(error, data){
            var code = data[0].code;
            var buy;
            client.query('select * from web_member where id=?',[request.session.user.id], function(error, results){
                var str = results[0].subject;
                if(str.indexOf(code) >= 0){
                    buy = '1';
                }else{
                    buy = '0';
                }
                
                response.render('market/marketDetail.ejs',{
                    data:data,
                    loginInfo : request.session.user,
                    loginSess : '1',
                    buy: buy,
                });
            });
            
        });
        
    }else{
        client.query('select * from web_market where seq=?',[request.params.id], function(error, results){
            response.render('market/marketDetail.ejs',{
                data:results,
                loginInfo : '0',
                loginSess : '0',
                buy: '0'
            });
        });
    }

});

app.get('/news/newsDetail/:id', function(request,response){
    
    if(request.session.user){
        client.query('select * from web_promotion where seq=?',[request.params.id], function(error, data){
                response.render('news/newsDetail.ejs',{
                    data:data,
                    loginInfo : request.session.user,
                    loginSess : '1',
                });
            });
            
    }else{
        client.query('select * from web_promotion where seq=?',[request.params.id], function(error, results){
            response.render('news/newsDetail.ejs',{
                data:results,
                loginInfo : '0',
                loginSess : '0',
            });
        });
    }

});

app.get('/price/priceMain',function(request, response){
    if(request.session.user){
        client.query('select title, price, num, seq from web_market where name=?',[request.session.user.name],function(error, data){
            response.render('admin/priceMain.ejs',{
                data: data,
                loginInfo : request.session.user,
                loginSess : '1',
            })
        });
    }else{
        response.redirect('/');
    }
})

app.post('/signUpPolicy',function(request,response){
    if(request.body.access == 'ok'){
        request.session.access =
                    {
                        acc: 'ok',
                        authorized: true
                    }      
                            
        response.redirect('/signUp');
        
    }else{
        response.redirect('/signUpPolicy');
    }
});

app.put('/signUp/check',function(request,respons){
    var id = request.body.id;
    client.query('select count(*) count from web_member where id=?', [id], function(error,results){
        if(results[0].count == '0'){
            var fail = '0';
            respons.send(fail);
        }else{
            var fail = '2';
            respons.send(fail);
        }
    });
})

app.post('/signUp',function(request,response){

    var id = request.body.sId;
    console.log(id)
    var passwd = request.body.sPw;
    console.log(passwd)
    var phone = request.body.sPhone;
    var register = request.body.sRegister;
    var name = request.body.sName;

    client.query('INSERT INTO web_member(id, passwd, phone, register, name) VALUES(?,?,?,?,?)', 
        [id, passwd, phone, register, name], function (error, data) {
        response.render('member/signUp.ejs',{
            loginSess : '0',
            signUpAccess: 'success', 
            fail: '1'     
        });
    });
    console.log("'"+id + "'" + ' Enrollment now    *time(' + new Date()+')');

});



app.post('/logIn', function (request, response) {
    // 변수를 선언합니다.
    var id = request.body.id;
    var pw = request.body.pw;
    
    // 데이터베이스 요청을 수행합니다.
    client.query('select id, passwd, name, grade, count(*) from web_member where id=?', 
    [id], function (error, data) {  

        if(data[0].id == id){
            if(data[0].passwd == pw){
                if(!request.session.user){                    
                    name = data[0].name;
                    console.log("'"+id + "'" + ' Login now    *time(' + new Date()+')');  
                            
                    request.session.user =
                    {
                        name: name,
                        id: id,
                        pw: pw, 
                        grade: data[0].grade,                   
                        authorized: true
                    }              
                    response.redirect('/');
                    
                }
            }else{
                response.render('member/logIn.ejs',{
                    loginSess : '0',
                    fail: '1'
                });
            }  
        }else{
            response.render('member/logIn.ejs',{
                loginSess : '0',
                fail: '1'
            });
        }
    });
});

app.post('/admin/marketAdd',upload.single('userfile'), function(request, response){

    var title = request.body.subjectTitle;
    var name = request.session.user.name;
    var contents = request.body.subjectContents;
    var memo = request.body.subjectMemo;
    var img = request.file.path;
    img = img.substr(7,img.length-7);
    var limit_num = request.body.limit_num;
    var price = request.body.price;

    var mdate = new Date();
    var date1 = (""+mdate).substr(11,4);
    var date2 = (""+mdate).substr(16,8);
    var mdate = date1+ date2;
    
    var code = name.substr(0,1) + title.substr(0,1) + mdate;
    console.log(code);
    client.query('INSERT INTO web_subject(title, name, code) VALUES(?,?,?)',[title, name, code]);
    client.query('INSERT INTO web_market(title, name, contents, img, price, limit_num, memo, code) VALUES(?,?,?,?,?,?,?,?)',[title, name, contents, img, price, limit_num, memo, code], function(){
        response.redirect('/market');
    });
});

app.post('/news/newsAdd',upload.single('userfile'), function(request, response){
    console.log('도착')
    var title = request.body.newsTitle;
    console.log(title)
    var name = request.session.user.name;
    var contents = request.body.newsContents;
    console.log(contents)
    var memo = request.body.newsMemo;
    var img = request.file.path;
    img = img.substr(7,img.length-7);
    
    client.query('INSERT INTO web_promotion(text_title, name, text_contents, img, memo) VALUES(?,?,?,?,?)',[title, name, contents, img, memo], function(){
        response.redirect('/news');
    });
});

app.post('/market/buy', function(request,response){
    var code = request.body.code;
    var seq = request.body.seq;
    client.query('SELECT subject, count(*) FROM web_member WHERE id=?',[request.session.user.id],function(error,results){
        if(results[0].subject != 'null'){
            code = results[0].subject + ',' +code;
        }        
        client.query('update web_member set subject =? where id=?',[code, request.session.user.id]);
        client.query('update web_market set num = num + 1 where code=?',[request.body.code],function(error,results){
            response.send(seq);
        })
    });
})

app.post('/market/buyCancel', function(request, response){
    var code = request.body.code;
    var seq = request.body.seq;
    client.query('SELECT subject FROM web_member WHERE id=?',[request.session.user.id],function(error,results){
        var str;
        if(results[0].subject != 'null'){
            str = results[0].subject;
            console.log(str);
            str = str.replace(','+code,'');
            console.log(str);
        }        
        client.query('update web_member set subject =? where id=?',[str, request.session.user.id],function(error, data){
            client.query('update web_market set num = num - 1 where code=?',[code],function(error, data){
                response.send(data);
            });
        });
    });
});

app.post('/admin/marketUpdate',upload.single('userfile'), function(request, response){

    var title = request.body.title;
    var name = request.body.name;
    var contents = request.body.contents;
    var memo = request.body.memo;
    var limit_num = request.body.limit_num;
    var price = request.body.price;
    var preCode = request.body.code;

    client.query('UPDATE web_subject set title=?,name=? where code=?',[title, name, preCode],function(error,data){
        client.query('UPDATE web_market set title=?,name=?,contents=?,price=?,limit_num=?,memo=? where code = ? ',[title, name, contents, price, limit_num, memo, preCode], function(error,data){
            response.send(data);
        });
    });
    
});

app.post('/notices/noticeAddAdd', function(request, response){
    var title = request.body.title;
    var contents = request.body.contents;
    var date = new Date();
    var id = request.session.user.id;

    client.query('INSERT INTO web_notice (title, contents, id, date) VALUES(?,?,?,?)',[title, contents, id, date],function(error,data){
        response.send(data);
    });
});

app.post('/community/communityAddAdd', function(request, response){
    var title = request.body.title;
    var contents = request.body.contents;
    var date = new Date();
    var id = request.session.user.id;

    client.query('INSERT INTO web_community (title, contents, id, date) VALUES(?,?,?,?)',[title, contents, id, date],function(error,data){
        response.send(data);
    });
});




app.listen(52273, function(){

    console.log("서버가 실행 되었습니다. \n http://127.0.0.1:52273");

});