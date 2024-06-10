const registerForm = document.getElementById('register-form');

registerForm?.addEventListener('submit', (event)=>{
    event.preventDefault();
    const  {login,password,passwordRepeat} = registerForm;
    if(password.value !== passwordRepeat.value){
        return alert("Passwords isn't connected")
    }
    if((password.value).length < 8){
        return alert("Password is too short")
    }
    const user = JSON.stringify({
        login:login.value,
        password: password.value
    });
    const xhr= new XMLHttpRequest();
    xhr.open('POST', '/api/register')
    xhr.send(user);
    xhr.onload = () => alert(xhr.response);
})
const loginForm = document.getElementById('login-form');
loginForm?.addEventListener('submit', (event)=>{
    event.preventDefault();
    const  {login,password,passwordRepeat} = loginForm;
    const user = JSON.stringify({
        login:login.value,
        password: password.value
    });
    const xhr= new XMLHttpRequest();
    xhr.open('POST', '/api/login');
    console.log(user);
    xhr.send(user);
    xhr.onload = () => {
        if(xhr.status === 200){
            const token = xhr.response;
            document.cookie = `token=${token}`;
            window.location.assign('/');
        }else{
            return alert(xhr.response)
        }
    };
})