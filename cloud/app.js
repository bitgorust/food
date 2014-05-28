// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var avosExpressCookieSession = require('avos-express-cookie-session');

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'jade');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

//启用cookie
app.use(express.cookieParser('food.delicious.avos'));
//使用avos-express-cookie-session记录登录信息到cookie。
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }}));

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.get('/login', function(req, res) {
    res.render('login.ejs');
});

app.post('/login', function(req, res) {
    AV.User.logIn(req.body.username, req.body.password).then(function() {
        console.log('signin successfully: %j', AV.User.current());
        res.redirect('/hello');
    }, function(error) {
        res.redirect('/login');
    });
});

app.get('/profile', function(req, res) {
    if (AV.User.current()) {
        res.send(AV.User.current());
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res) {
    AV.User.logOut();
    res.redirect('/profile');
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
