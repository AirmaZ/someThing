/**
 * Created by Airma on 2017/7/16.
 */

/**
 * 封装webSocket
 * @param url
 * @param health_timeout
 * @constructor
 */
var WebSocketIo = function (url ,health_timeout) {
    var socket = this;
    this.url = url;
    this.socket = new WebSocket(url);
    this.eventFc = {
        "heartbeat":[function () {
            var time = new Date();
            socket.heartbeat.last_health = time.getTime();
        }]
    };
    this.heartbeat = {
        last_health : -1,
        heartbeat_timer:0,
        health_timeout:health_timeout || 3000
    };
    this.keepalive = function () {
        var time = new Date(),
            last_health = socket.heartbeat.last_health,
            health_timeout = socket.heartbeat.health_timeout;
        // console.log("last_health:"+last_health+"----:"+(time.getTime() - last_health))
        if( last_health != -1 && ( time.getTime() - last_health > health_timeout ) ){
            //此时即可以认为连接断开，可是设置重连或者关闭
            clearInterval( socket.heartbeat.heartbeat_timer );
            socket.socket.close();
        }
        else{
            if( socket.socket.bufferedAmount == 0 ){
                socket.socket.send(JSON.stringify({eventName:"heartbeat",data:"heartbeat!"}));
            }
        }
    };
    clearInterval( this.heartbeat.heartbeat_timer );
    this.socket.onerror = function () {
        clearInterval( socket.heartbeat.heartbeat_timer );
    };
    this.socket.onclose = function () {
        clearInterval( socket.heartbeat.heartbeat_timer );
    }
};
WebSocketIo.prototype = {
    onopen : function (callback) {
        this.socket.onopen = callback;
    },
    onerror : function (callback) {
        this.socket.onerror = callback;

    },
    onclose : function (callback) {
        this.socket.onclose = callback;
    },
    /**
     * socket封装后的onmessage事件。可根据返回data.eventName字段来自动触发事件
     * @param eventName 事件名称
     * @param callback 业务逻辑
     */
    onMessageEvent : function (eventName,callback) {
        var socket = this;
        this.eventFc[eventName] = this.eventFc[eventName] || [];
        this.eventFc[eventName].push(callback);
        if(socket.socket.onopen == null) socket.socket.onopen = function (event) {
            socket.heartbeat.last_health = new Date().getTime();
            socket.heartbeat.heartbeat_timer = setInterval( socket.keepalive,30000);
            console.log('socket is opened!')
        };
        socket.socket.onmessage = socket.socket.onmessage || function (event) {
                var data = JSON.parse(event.data);
                var time = new Date();
                socket.heartbeat.last_health = time.getTime();
                if(data.eventName && socket.eventFc[data.eventName]){
                    for(var i = 0; i < socket.eventFc[data.eventName].length; i ++){
                        socket.eventFc[data.eventName][i](data.data);
                    }
                } else {
                    console.error("socket事件不存在");
                }
            };
    },
    sendEvent : function (eventName,message) {
        this.socket.send(JSON.stringify({eventName:eventName,data:message}));
    },
    close : function () {
        this.socket.close();
    }
};

export default WebSocketIo