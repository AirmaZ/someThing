/**
 * Created by Airma on 2017/3/22.
 */
var http = require("http");
var fs = require("fs");
var server = http.createServer(function(req, res){}).listen(50082);
console.log("http start");
var data = require('./iconGame1490177354299');
data = data.data;
let getPng = function (url, name ,message) {
    http.get(url, function(res){
        var imgData = "";

        res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


        res.on("data", function(chunk){
            imgData+=chunk;
        });

        res.on("end", function(){
            console.log("进度:"+message.i+"/"+message.length);
            fs.writeFile("./iconGame/"+name+".png", imgData, "binary", function(err){
                if(err){
                    console.log("down fail");
                    console.log(err.message)
                }
                console.log("down success");
            });
        });
    });
};
for (let i =0 ; i< data.length ; i++){
    getPng(data[i].src,data[i].name,{i:i,length:data.length});
}
