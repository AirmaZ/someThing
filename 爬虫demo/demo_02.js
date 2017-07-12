/**
 * Created by Airma on 2017/1/17.
 */
let superagent = require('superagent');
let cheerio = require('cheerio');
let async = require('async');
let url = require('url');
let cNodeUrl  = 'https://cnodejs.org/';
let fs =require('fs');

let writeFiless = function(items,filesName) {
    let fileName = filesName + new Date().getTime() + ".json";
    let writeStream = fs.createWriteStream(fileName);
    writeStream.write(JSON.stringify(items), 'UTF8');
    writeStream.end();
    writeStream.on("finish", function () {
        console.log("写入完毕");
    });
};

function getData(topicUrls) {
    let dataArray = [];
    let concurrencyCount = 0;
    async.mapLimit(topicUrls, 5, function (url, callback) {
        concurrencyCount++;
        console.log('并发数：'+concurrencyCount);
        superagent.get(url)
            .end(function (err, res) {
                if(err){
                    concurrencyCount--;
                    return console.error(err);
                }
                console.log('fetch ' + url + ' successful');
                concurrencyCount--;
                let topicUrl = url;
                let topicHtml = res.text;
                let $ = cheerio.load(topicHtml);
                dataArray.push({
                    title: $('.topic_full_title').text().trim(),
                    href: topicUrl,
                    comment1: $('.reply_content').eq(0).text().trim()
                });
                callback(err,dataArray);
            });
    }, function (err, dataArray) {
        if(err){
            return console.error(err);
        }
        writeFiless(dataArray,"CNODE社区爬虫")
    });
}

superagent(cNodeUrl ,function (err, res) {
    if(err){
        return console.error(err);
    }
    let topicUrls = [];
    let $ = cheerio.load(res.text);
    let $ele = $('#topic_list .topic_title');
    $ele.each(function (idx, element) {
        // if(topicUrls.length >=40){return false}
        let $element = $(element);
        // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
        // 我们用 url.resolve 来自动推断出完整 url，变成
        // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
        // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
        let href = url.resolve(cNodeUrl, $element.attr('href'));
        topicUrls.push(href);
    });
    getData(topicUrls);
});
