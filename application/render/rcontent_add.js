const ipc = require('electron').ipcRenderer
const rem = require('electron').remote
const anime = require('animejs')
const tool = require('../core/tools')
const customTitlebar = require('custom-electron-titlebar')

let tools = new tool();
window.addEventListener('DOMContentLoaded', async function () {   
    Metro.init() 
    createListeners()
})


ipc.on("addReceived",(event,args)=>{
    if(args.err){
        console.log(args.msg)
    }else{
        console.log(args.msg)
        console.log('datos guardados')
    }
})

function createListeners(){
    let frm = document.getElementById('frm_add')
    frm.addEventListener('submit',function(event){
        event.preventDefault()
        return false
    })


    let btn_cancelar = document.getElementById('btn_cancelar')
    btn_cancelar.addEventListener("click",function(event){
        console.log("cancelando ventana")
        tools.closeAddWindow()
    })

    let btn_save = document.getElementById('btn_guardar')
    btn_save.addEventListener("click",function(event){
        let action = event.target.dataset.action;
        let data = null
        switch(action){
            case 'lugar':
                let nombre = document.getElementById('lugar').value
                let capacidad = document.getElementById('capacity').value
                data = {
                    lugar:nombre,
                    capacidad:capacidad
                }
                break
            default:
                break    
        }    


        console.log(data)
        ipc.send('addNewFormDetail', {action:action,data:data});
        
        console.log(`salvando el action ${action}`)


    })
}



