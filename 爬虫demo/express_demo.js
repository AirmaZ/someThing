

// app.get("/",(req, res) => {
//     res.send("hello express");
// }).listen(3000, function() {
//    let host = this.address().address;
//    let port = this.address().port;
//    console.log('Example app listening at http://%s:%s', host, port);
// });
// app.get('/', function (req, res) {
//     // res.send('Hello World!');
//     res.sendFile("/nodeJS/public/index.html");
// });
// app.get('/index', function (req, res) {
//     res.send('index router');
// });
//
// // 网站首页接受 POST 请求
// app.post('/', function (req, res) {
//     res.send('Got a POST request');
// });
//
// // /user 节点接受 PUT 请求
// app.put('/user', function (req, res) {
//     res.send('Got a PUT request at /user');
// });
//
// // /user 节点接受 DELETE 请求
// app.delete('/user', function (req, res) {
//     res.send('Got a DELETE request at /user');
// });
// app.get('/example/b', function (req, res, next) {
//     console.log('response will be sent by the next function ...');
//     // res.send('Hello from a!');
//     next();
// }, function (req, res ,next) {
//     console.log('response will be sent by the next function ...');
//     next();
// }, function (req, res) {
//     res.send('Hello from B!');
// });
// app.use(express.static('public'));

// let router = express.Router();
// let url = require("url");
//
// router.use( function(req, res, next){
//     console.log('Time:',Date.now());
//     next();
// });
//
// router.use('/user/:id',function(req,res){
//     let path = url.parse(req.baseUrl);
//     console.log("path:",path);
//     res.send(path);
// });
//
// app.use('/',router);

// let router = express.Router();
// app.set("views","./public");
// app.set("views engine","jade");
// router.get("/index",function (req, res) {
//    res.render("index");
// });
//
// app.use("/",router);
//
// app.listen(9000, function () {
//     let port = this.address().port;
//     console.log('Example app listening at http://%s:%s', "localhost", port);
// });

// let utility = require('utility');
// app.get("/",function (req,res) {
//     let q = req.query.q;
//     let sha1Value = utility.sha1(q);
//     res.send(sha1Value);
// });
// app.listen(3000, function (req, res) {
//     console.log('app is running at port 3000');
// });
let express = require('express');
let app = express();
// let superagent = require('superagent');
let cheerio = require("cheerio");
let fs = require("fs");
let charset = require('superagent-charset');
let superagent = charset(require('superagent'));

let writeFiless = function(items,filesName) {
    let fileName = filesName + new Date().getTime() + ".json";
    let writeStream = fs.createWriteStream(fileName);
    writeStream.write(JSON.stringify(items), 'UTF8');
    writeStream.end();
    writeStream.on("finish", function () {
        console.log("写入完毕");
    });
};

function getTieba(number,items,writeFiless,filesName) {
    // let items = items || [];
    console.log(number);
    if(number >= 17){
        writeFiless(items,filesName);
        return
    }
    superagent
        .get('http://detail.zol.com.cn/cell_phone_index/subcate57_0_list_1_s6256_1_2_0_'+number+'.html')
        .charset('gbk')
        .end(function (err, sres) {
            if (err) {
                return console.error(err);
            }
            let $ = cheerio.load(sres.text);
            $("#J_PicMode li").each(function (idx, element) {
                let $ele = $(element);
                items.push({
                    "title":$ele.find("h3 a").attr('title'),
                    "url": 'http://detail.zol.com.cn/'+$ele.find("h3 a").attr('href')
                })
            });
            console.log("爬取完毕！");
            getTieba(number+=1,items,writeFiless,filesName);
        });
}
getTieba(1,[],writeFiless,"中关村所有手机的url（全网通）");