const ipc = require('electron').ipcRenderer;
const anime = require('animejs');
const tool = require('../core/tools');
let tools = new tool();

//window.addEventListener('load', function () {
 window.addEventListener('DOMContentLoaded',function(){   
   
    verifydb()
    

}, false);

function enableLogin(){
    if(tools.elementExist('.login-box')){

        let login = document.querySelector('.login-box');
        if(tools.hasClass(login,'d-none')){
            tools.removeClass(login,'d-none');
            
            anime({
                targets: login,
                scale: .2,
                opacity:0,
                direction: 'reverse',
                duration:700,
                easing: 'easeInOutSine'
            });

            if(tools.elementExist('#smit')){
                /**submit data*/
                document.querySelector('#smit').addEventListener('click',function(){
                    logn();
                });
            } 
            if(tools.elementExist('#cancel')){
                /**submit data*/
                document.querySelector('#cancel').addEventListener('click',function(){
                    cancelwindow();
                });
            }    
   

        }
        
    }  
}


function logn(){
    let _usr = document.querySelector('#usr').value;
    let _pss = document.querySelector('#pass').value; 
    let params = {  usr:_usr, pss:_pss }
    ipc.send('logn', params);
}

ipc.on('lognreply', (event, args) => {
    let msg_login = document.querySelector("#message-login");
    tools.addClass(msg_login,'msg-login');
    let msg='<x-box><x-icon name="error"></x-icon> <span class="pl-10">El usuario o password es incorrecto.</span></x-box>'
    msg_login.innerHTML = msg
    anime({
        targets: msg_login,
        scale: .6,
        opacity:0,
        direction: 'reverse',
        duration:400,
        easing: 'easeInOutSine'
    });
    
});

ipc.on('isconected', (event, args) => {
    let conmsg = document.querySelector("#conexion-msg");
    
    if(!args.isconected){
        tools.removeElement('#loading-box');
        let html_msg = '<x-icon name="sync-disabled" skin="primary"></x-icon>'+ 
                       '<x-label>No se ha podido establecer una conexión con la base de datos. Puede ser que no esté correctamente configurada o ésta no este instalada en su sistema.</x-label>'+
                       '<x-button skin="flat" id="cancel">'+
                        '<x-box>'+                        
                          '<x-label>Cerrar aplicación</x-label>'+
                          '<x-icon name="close"></x-icon>'+
                        '</x-box>'+                        
                      '</x-button>'
        conmsg.innerHTML = html_msg
        tools.removeClass(conmsg,'d-none');            
        anime({
            targets: conmsg,
            opacity:0,
            direction: 'reverse',
            duration:400,            
        });


        document.querySelector('#cancel').addEventListener('click',(event)=>{
            cancelwindow()
        })
    }else{
        tools.removeElement('#loading-box');
        enableLogin()
    }
});

/**cancela ventana de login*/
function cancelwindow(){
    ipc.send('cancellogin', true);
}

function verifydb(){
    ipc.send('getconnection', {});
}
