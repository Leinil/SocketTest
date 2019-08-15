const express = require('express');
const app = express();
// 设置静态文件夹，会默认找当前目录下的index.html文件当做访问的页面
app.use(express.static(__dirname));

const server = require('http').createServer(app);//基于http协议建立通信通道
const io = require('socket.io')(server);
server.listen(4000);

SYSTEM='系统';
//用户随机颜色
let userColorArr = ['#00a1f4', '#0cc', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'];
let userArr={}//用来处理链接入系统的所有用户
let history=[]//历史信息


//容易出错的就是变量存储的位置***全局与局部
//个人理解为on（'connection'）为单一的链接用户存储信息位置
//其余的整个系统变量和目前链接的用户数则为全局变量。。。。。。。。。（最开始忽略了这个问题，搞了好久啊）


//在此之前讨论以下关于发送信息的问题（目前了解的发送信息总体上是有两种方法的，一种是socket一种是io）
//感觉上两种都可以给全局的用户发送信息，但是肯定是有区别的
//要给出自己以外 的其他人发送信息-> socket.broadcast.emit
//给自己/他人发送信息则需要获取socket（这是一个实际的实例）.send()
//另外关于id这个问题，socket在链接建立之后就会自动建立一个socket实例对象，之中保存了一些相关信息该项目使用的id就来自这里

//关于事件监听问题
//目前来看，客户端和服务端都是有事件监听功能的（这是当然的毕竟是双工通信的）
//但是二者挂载的位置不同（关于这个问题还需要再看一下还是有一些模糊）

//链接时服务端处理
io.on('connection',function(socket){
    let userName='';//局部变量，初始化的时候为空设置成为用户的第一次输入
    let userColor='';//用户文字颜色，初始化的时候获取一个之后不变


    socket.emit('storeId',socket.id);
    socket.on('message',function(msg){
        if(userName){//现在已经有用户名了
            socket.emit('storeUsername',userName)//客户端还要存储自己的用户名（为了之后的历史记录做准备）
            let privateMeet = msg.match(/@([^ ]+) (.+)/);//判断是否是私聊
            if(privateMeet){//是私聊
                let meeter=privateMeet[1];//私聊对象
                let meetContent=privateMeet[2];//私聊内容
                if(userArr[meeter]){//判断现在用户是都在房间内
                    userArr[meeter].send({//给@的用户单独发送信息
                        user:userName,
                        color:userColor,
                        content:msg,
                        createAt: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
                    })
                    socket.send({//还要给自己发送一次
                        user:userName,
                        color:userColor,
                        content:msg,
                        id: socket.id,
                        createAt: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
                    })
                }
                //私聊的历史消息记录（保存了私聊信息记录）
                history.push({
                    secret:true,//此消息为私聊信息
                    sender:socket.id,//消息发送者
                    accepter:meeter,//消息接收者
                    color:userColor,
                    content:msg,
                    createAt: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
                })
            }
            else{
                io.emit('message',{
                    user:userName,
                    color:userColor,
                    content:msg,
                    id: socket.id,
                    createAt: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
                })
                history.push({
                    secret:false,
                    user:userName,
                    color:userColor,
                    content:msg,
                    id: socket.id,
                    createAt: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}` 
                })
            }
        }
        else{//用户第一次输入
            userName=msg;
            userColor=shuffle(userColorArr)[0];
            userArr[userName]=socket;//载入新进用户
            socket.broadcast.emit('message',{
                user:SYSTEM,
                color:'red',
                content:`${userName}加入了聊天`,
                createAt: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
            })
        }
    })

    socket.on('getHistory',function(){
        if(history.length){
            let newHistory=history.slice(history.length-20);
            socket.emit('history',newHistory);
        }
    })
})


function shuffle(arr) {
    let len = arr.length, random;
    while (0 !== len) {
        random = (Math.random() * len--) >>> 0;			// 右移位运算符向下取整
        [arr[len], arr[random]] = [arr[random], arr[len]];	// 解构赋值实现变量互换
    }
    return arr;
}
