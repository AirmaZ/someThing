/**
 * Created by Airma on 2017/1/13.
 */
let express = require("express");
let app = express();
let superagent = require('superagent');
let cheerio = require("cheerio");
let url = require('url');
let eventproxy = require('eventproxy');
let ep = new eventproxy();

let cNodeUrl  = 'https://cnodejs.org/';

function getData(topicUrls) {
    ep.after('topic_html', topicUrls.length, function (topics) {
        // topics 是个数组，包含了 40 次 ep.emit('topic_html', pair) 中的那 40 个 pair

        // 开始行动
        topics = topics.map(function (topicPair) {
            // 接下来都是 jquery 的用法了
            let topicUrl = topicPair[0];
            let topicHtml = topicPair[1];
            let $ = cheerio.load(topicHtml);
            return ({
                title: $('.topic_full_title').text().trim(),
                href: topicUrl,
                comment1: $('.reply_content').eq(0).text().trim(),
            });
        });
        console.log('final:');
        console.log(topics);
    });

    topicUrls.forEach(function (topicUrl) {
        superagent.get(topicUrl)
            .end(function (err, res) {
                if(err){
                    return console.error(err);
                }
                console.log('fetch ' + topicUrl + ' successful');
                ep.emit('topic_html', [topicUrl, res.text]);
            });
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
        if(topicUrls.length >=3){return false}
        let $element = $(element);
        // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
        // 我们用 url.resolve 来自动推断出完整 url，变成
        // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
        // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
        let href = url.resolve(cNodeUrl, $element.attr('href'));
        topicUrls.push(href);
    });
    getData(topicUrls);
    // console.log(topicUrls);
});