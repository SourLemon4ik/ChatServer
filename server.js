const http = require('http');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const {Server} = require("socket.io");

const cookie = require('cookie');

const pathToIndex = path.join(__dirname,'static','index.html');
const indexHtmlFile = fs.readFileSync(pathToIndex);

const pathToScript = path.join(__dirname,'static','script.js');
const ScriptFile = fs.readFileSync(pathToScript);

const pathToStyle = path.join(__dirname,'static','style.css');
const StyleFile = fs.readFileSync(pathToStyle);

const pathToRegister = path.join(__dirname,'static','register.html');
const RegisterFile = fs.readFileSync(pathToRegister);

const pathToAuth = path.join(__dirname,'static','auth.js');
const AuthFile = fs.readFileSync(pathToAuth);


const pathToLogin = path.join(__dirname,'static','login.html');
const LoginFile = fs.readFileSync(pathToLogin);

const server = http.createServer((req,res)=>{
    if(req.method === 'GET'){
        switch(req.url){
            //case '/' : return res.end(indexHtmlFile);
            case '/style.css' : return res.end(StyleFile);
            case '/script.js' : return res.end(ScriptFile);
            case '/register' : return res.end(RegisterFile);
            case '/auth.js' : return res.end(AuthFile);
            case '/login' : return res.end(LoginFile);
            default: return guarded(req, res);
        }
    }
    if(req.method === 'POST'){
        switch(req.url){
            case '/api/register' : return registerUser(req, res);
            case '/api/login' : return login(req, res);
        }
    }



    res.statusCode = 404;
    return res.end('Error 404');
});

function guarded(req,res){
    const credentionals = getCredentionals(req.headers?.cookie);
    if(!credentionals){
        switch(req.url){
            case '/register':
                res.writeHead(302,{'Location' : '?register'});
            ;
            case '/login':
                res.writeHead(302, {'location' : '/login'});
            ;
            return res.end()
        }
        console.log(credentionals);
    }
    if(req.method === 'GET'){
        switch(req.url){
            case '/' : return res.end(indexHtmlFile);
            case '/script.js' : return res.end(ScriptFile);
        }
    }
    res.writeHead(404);
    return res.end('Error 404');
}

function getCredentionals(c = ''){
    const cookies = cookie.parse(c);
    const token = cookies?.token;
    if(!token || !validAuthTokens.includes(token)) return null;
    const [user_id, login] = token.split('.');
    if(!user_id || !login) return null;
    return {user_id, login}
}

const validAuthTokens = [];

function login(req,res){
    let data = '';
    req.on('data',function(chunk){
        data+= chunk;
    });
    req.on('end',async function(){
        try{
            const user = JSON.parse(data);
            const token = await db.getAuthToken(user);
            validAuthTokens.push(token);
            res.writeHead(200);
            res.end(token);
        }catch(e){
            res.writeHead(500);
            return res.end('Error: ' + e)
        }
    });
}


function registerUser(req, res){
    let data = '';
    req.on('data', function(chunk){
        data += chunk;
    });
    req.on('end', async function(){
        try{
            const user = JSON.parse(data);
            if(!user.login || !user.password){
                return res.end('Empty login or password');
            }
            if(await db.isUserExist(user.login)){
                return res.end('User already exist');
            }
            await db.addUser(user);
            return res.end('Register is successfull');
        }catch(e){
            return res.end('Error ' + e)
        }
    });
}


server.listen(3000);
const io = new Server(server);


io.use((socket, next) =>{
    const cookie = socket.handshake.auth.cookie;
    const credentionals = getCredentionals(cookie);
    if(!credentionals){
        next(new Error("no auth"));
    }
    socket.credentionals = credentionals;
    next();
})


io.on('connection', async (socket)=>{

    let userNickname = socket.credentionals?.login;
    let userId = socket.credentionals?.user_id;
    let messages = await db.getMessages();

    socket.on('set_nickname', (nickname)=> {
        userNickname = nickname;
    })
    socket.emit('all_messages', messages);
    console.log('User id is ' + socket.id);

    socket.on('new_message', (message) => {
        db.addMessage(message, 1);
        io.emit('message',userNickname + ':  ' + message);
    });


});
