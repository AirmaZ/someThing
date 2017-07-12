/**
 * Created by Airma on 2017/4/25.
 */
/**
 * Created by Airma on 2017/1/17.
 */
let charset = require('superagent-charset');
let superagent = charset(require('superagent'));
let cheerio = require('cheerio');
let async = require('async');
let url = require('url');
let fs =require('fs');
let urls = require('./urls');

let writeFiless = function(items,filesName) {
    console.log("开始写入");
    let fileName = filesName + new Date().getTime() + ".json";
    let writeStream = fs.createWriteStream(fileName);
    writeStream.write(JSON.stringify(items), 'UTF8');
    writeStream.end();
    writeStream.on("finish", function () {
        console.log("写入完毕");
    });
};

let dataArray = [];
console.log(urls.urls.length);

function getData(topicUrls) {
    let concurrencyCount = 0;
    async.mapLimit(topicUrls, 30, function (obj, callback) {
        concurrencyCount++;
        console.log('并发数：'+concurrencyCount);
        try {
            superagent.get(obj.url)
                .charset('gbk')
                .end(function (err, res) {
                    if(err){
                        concurrencyCount--;
                        console.error(err);
                    } else {
                        console.log('fetch ' + obj.url + ' successful');
                        concurrencyCount--;
                        let topicHtml = res.text;
                        let $ = cheerio.load(topicHtml);
                        let $title = $('.page-title');
                        let brand = $('.breadcrumb a').eq(2).text().trim().split('手机')[0];
                        let model = $title.find('h1').text().trim().split('（')[0]
                        let resObj = {
                            'brand': brand,
                            '型号': model.split(brand)[1] || model.split(brand)[0],
                            '别名': $title.find('h2').text().trim().split('别名：')[1] || '未知'
                        };
                        dataArray.push(resObj);
                        console.log(resObj);
                        callback(err,resObj);
                    }
                });
        } catch (err){
            // callback(err,{})
        }
    }, function (err, data) {
        console.log('全部爬去完毕，等待写入');
        if(err){
            return console.error(err);
        }
        writeFiless(data,"中关村手机型号大全(全网通)")
    });
}
getData(urls.urls);

