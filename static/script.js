const socket = io({
    auth: {
        cookie:document.cookie
    }
});
let form = document.getElementById("form");
let input = document.getElementById("inp")
form.addEventListener("submit", function(e){
    e.preventDefault();
    if(input.value){
        socket.emit('new_message',input.value);
        input.value = '';
    }
})

let chat_body = document.getElementById('text_space');

socket.on('message', function(msg){
    
        let item = document.createElement('div');
        item.classList.add("text_space");
        item.textContent = msg;

        chat_body.appendChild(item);
        chat_body.scrollTo(0, chat_body.scrollHeight);
    
});
socket.on('all_messages', function(msgArray){
    msgArray.forEach(msg => {
        let item = document.createElement('div');
        item.classList.add("text_space");
        item.textContent = msg.login + ": " + msg.content;
        
        chat_body.appendChild(item);
        chat_body.scrollTo(0, chat_body.scrollHeight);
    });
});

function changeNickname(){
    let nickname = prompt('Choose your nickname');
    if(nickname){
        socket.emit('set_nickname',nickname);
    }
}

//changeNickname();