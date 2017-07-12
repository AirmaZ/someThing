/**
 * Created by Airma on 2017/3/24.
 */
//叉乘
var crossMul=function(v1,v2){
    return   v1.x*v2.y-v1.y*v2.x;
};

//判断两个线段是否相交
var checkCross=function(pointArr){
    var p1=pointArr[0],
        p2=pointArr[1],
        p3=pointArr[2],
        p4=pointArr[3];
    var v1={x:p1.x-p3.x,y:p1.y-p3.y},

    v2={x:p2.x-p3.x,y:p2.y-p3.y},

    v3={x:p4.x-p3.x,y:p4.y-p3.y},

    v=crossMul(v1,v3)*crossMul(v2,v3);

    v1={x:p3.x-p1.x,y:p3.y-p1.y};

    v2={x:p4.x-p1.x,y:p4.y-p1.y};

    v3={x:p2.x-p1.x,y:p2.y-p1.y};

    return (v<=0&&crossMul(v1,v3)*crossMul(v2,v3)<=0)?true:false

};

//处理点的集合，返回所有不相邻的两个线段的集合
var getLines = function (pointArray) {
    if(!(pointArray.__proto__ === Array.prototype))return undefined;
    var linesArray = [],
        _pointArray = [],
        i = 0,
        j = 0,
        length = pointArray.length;
    for( i =0 ; i < length; i++){ //去除连续相同的坐标
        if(i === 0){
            _pointArray.push(pointArray[i]);
            continue;
        }
        if((pointArray[i].x!==pointArray[i-1].x)&&(pointArray[i].y!==pointArray[i-1].y)){
            _pointArray.push(pointArray[i])
        }
    }
    length = _pointArray.length;
    _pointArray.push(_pointArray[0]);
    for( i = 3; i<=length ; i++){
         j = (i === length)?1:0;
        for( ; j < i-2 ; j++){
            var line = [
                    {x:_pointArray[i].x,y:_pointArray[i].y},
                    {
                        x:_pointArray[i-1]?_pointArray[i-1].x:_pointArray[0].x,
                        y:_pointArray[i-1]?_pointArray[i-1].y:_pointArray[0].y
                    },
                    {x:_pointArray[j].x,y:_pointArray[j].y},
                    {x:_pointArray[j+1].x, y:_pointArray[j+1].y}
                ];
            linesArray.push(line)
        }
    }
    return linesArray;
};

//判断是个图形是否是自交图形，返回true或者false
function getCorss(pointArray) {
    if(!(pointArray.__proto__ === Array.prototype)){
        console.error('not Array')
    }
    if(pointArray.length < 4)return false;
    pointArray = getLines(pointArray);
    var length = pointArray.length,
        flag = false;
    console.log(pointArray);
    for(var i =0 ; i < length ;i++){
        if(checkCross(pointArray[i])){
            flag = true;
            return flag;
        }
    }
    return flag;
}
