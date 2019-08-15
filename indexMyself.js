let socket = io();//创建socket服务
let list = document.getElementById('list'),
    input = document.getElementById('input'),
    sendBtn = document.getElementById('sendBtn');
userId='';
userName='';

function send(){//list和发送按钮
    let value=input.value;
    if(value){
        socket.emit('message',value);
        input.value='';
        return 
    }
    alert('发送消息不能为空')
}
//空格发送事件
input.onkeydown=function(event){
    if(event.keyCode===13){
        send()
    }
}
//发送按钮点击事件
sendBtn.onclick=send;


list.onclick=function(event){
    let user=event.target.innerHTML;
    if(event.target.className==='user'){
        input.value=`@${user }`
    }
}

// 监听与服务端的连接
socket.on('connect', () => {
    console.log('连接成功');
    socket.emit('getHistory');
});

socket.on('storeId',function(id){
    console.log('链接成功之后返回信息',id);
    userId=id;
})

socket.on('storeUsername',function(name){
    userName=name;
})

socket.on('showSomething',function(msg){
    console.log(msg)
})
socket.on('message',function(data){
    let li = document.createElement('li');
    li.className = 'list-group-item';
    // 如果用户id与传过来的id相同就表示是自己
    li.style.textAlign = userId === data.id ? 'right' : 'left';
    li.innerHTML = `<p style="color: #ccc;"><span class="user" style="color:${data.color}">${data.user} </span>${data.createAt}</p>
                    <p class="content" style="background-color: ${data.color}">${data.content}</p>`;
    list.appendChild(li);
    // 将聊天区域的滚动条设置到最新内容的位置
    list.scrollTop = list.scrollHeight;
})

socket.on('history',function(history){
    history.map(data=>{
        if(data.secret){//为之前的私聊信息
            // sender:socket.id,//消息发送者
            // accepter:meeter,//消息接收者
            if(userId===data.sender||userName===data.accepter){//我发送的和发给我的
                let li = document.createElement('li');
                li.className = 'list-group-item';
                // 如果用户id与传过来的id相同就表示是自己
                li.style.textAlign = userId === data.id ? 'right' : 'left';
                li.innerHTML = `<p style="color: #ccc;"><span class="user" style="color:${data.color}">${data.accepter} </span>${data.createAt}</p>
                                <p class="content" style="background-color: ${data.color}">${data.content}</p>`;
                list.appendChild(li);
                // 将聊天区域的滚动条设置到最新内容的位置
                list.scrollTop = list.scrollHeight;   
            }
        }
        else{
            let li = document.createElement('li');
            li.className = 'list-group-item';
            // 如果用户id与传过来的id相同就表示是自己
            li.style.textAlign = userId === data.id ? 'right' : 'left';
            li.innerHTML = `<p style="color: #ccc;"><span class="user" style="color:${data.color}">${data.user} </span>${data.createAt}</p>
                            <p class="content" style="background-color: ${data.color}">${data.content}</p>`;
            list.appendChild(li);
            // 将聊天区域的滚动条设置到最新内容的位置
            list.scrollTop = list.scrollHeight;   
        }
    })
    let li = document.createElement('li');
    li.innerHTML= '<li style="margin: 16px 0;text-align: center">以上是历史消息</li>';
    list.appendChild(li);
    // 将聊天区域的滚动条设置到最新内容的位置
    list.scrollTop = list.scrollHeight;   

})