const ipc = require('electron').ipcRenderer
const rem = require('electron').remote
const anime = require('animejs')
const tool = require('../core/tools')
const customTitlebar = require('custom-electron-titlebar')
//const { $ } = require('custom-electron-titlebar/lib/common/dom')


let tools = new tool();
window.addEventListener('DOMContentLoaded', function () {   

    new customTitlebar.Titlebar({
        shadow:true,
        icon:'../../assets/logo/adoctor_circle.svg',
        backgroundColor: customTitlebar.Color.fromHex('#1C5435')
    });
    
    getMenu()
    verifyRules()    
    createListeners()
    Metro.init()   
})


function createListeners(){
    let btn_add = document.getElementById('btn_add_new');
    if(tools.elementExist('#btn_add_new')){       

        btn_add.addEventListener('click',(event)=>{
            openChild(event)
        })



    }

    
    
    
    


    /**
     * 
     * You should listen for "open", "close" and "select" events on <x-doctabs>. When the event fires, you are responsible for updating manually the visibility of your views to match the current state of <x-doctabs>.
    */


   

}



function verifyRules(){
    //let opt = $("#fornav_container").data("child")
    let opt = document.getElementById("fornav_container").dataset.child
    switch(opt){
        case 'expediente_clinico':
            enableTableOptions()
            getList('expediente_clinico')
            
        break
        case 'historial_clinico':
            
            let data = rem.getGlobal('requestData')
            console.log(data)
            console.log(data.id)
        break
        case 'consultas':
            alert('consultas');
        break;
        case 'lugares':
            enableTableOptions()
            getList('lugares')
        break        
    }
}

function enableTableOptions(){
    Metro.tableSetup({
        emptyTableTitle: "Nada que mostrar.",
        tableRowsCountTitle: "Muestra: ",
        tableSearchTitle: "Buscar:",
        tableInfoTitle: "mostrando de $1 a $2 de $3 resultados",
        paginationPrevTitle: "Anterior",
        paginationNextTitle: "Siguiente",
        allRecordsTitle: "Todos",
        inspectorTitle: "Inspector",
        tableSkipTitle: "Ir a la página",
        checkStoreKey:'TABLE:$1:KEYS',
        onCheckClick:function(){
            let table = $("#container-data-items").data('table')            
            let checks = table.getStoredKeys()            
            let btndel = $('#table_delete_check')    
            if(checks.length>0){                
                btndel.prop("disabled",false)                
            }else{
                btndel.prop("disabled",true)
            }
        },
        
        onCheckClickAll: function(evento){
            let btndel = $('#table_delete_check') 
            if(evento){
                btndel.prop("disabled",false)    
            }else{
                btndel.prop("disabled",true)    
            }
        }
    })
}
function createHeader(opt){
    let header_arr = []
    switch(opt){
        case 'expediente_clinico':
            header_arr = [ 
                { name:'ID',sort:false, width:30},
                { name:'Fecha',sort:true, format:'date', mask:'%y-%m-%d', width:80},
                { name:'Nombre',sort:true, width:180},
                { name:'Enviado por Dr',sort:false, width:100},
                { name:'Diagnóstico de',sort:false, width:100},
                { name:'Motivo de consulta',sort:false, width:100},
                { name:'Comentarios',sort:false, width:300},
                { name:'Estatura',sort:true, width:30, format:'float'},
                { name:'Peso',sort:true,width:30, format:'float'},
                { name:'IMC',sort:true,width:30, format:'float'},
                { name:'Historial clínico',sort:false, width:40}
            ]
        break
        case 'lugares':
            header_arr = [ 
                { name:'ID',sort:false, width:30},
                { name:'Lugar',sort:true, width:280},
                { name:'Capacidad',sort:true, width:50 },
                { name:'Editar',sort:false, width:40}
            ]     
        break    
    }

    if(header_arr.length>0){
        tools.createHeaderTable(header_arr,'container-data-items')
    }

}
function createBodyTable(args){
    let opt = args.option
    let data = args.data
    let more = {}
    switch(opt){
        case 'expediente_clinico':
            more = {
                imc:{call:'calc_IMC'} ,
                hist:{execute:'get_HistCLi'}
            }           
            tools.createRowsTable(data,'container-data-items',more)
            tools.unhideButtons()
            
            /**expediente clinico events hist_clinico*/
            /*document.querySelectorAll('.add_click_event').addEventListener("click", function() {
                  console.log('evento de click executed')
                }, false);
            */      

        break
        case 'lugares':
            more = {
                editar:{ editable:'getEditableModule', modulo:'lugares' }
            }
            tools.createRowsTable(data,'container-data-items',more)
            tools.unhideButtons()



        break
    }

}




function getMenu(){
    ipc.send('getMenu', {});
}

function getList(args){
    ipc.send('getList', {option:args});
}

ipc.on('ismenu', (event, args) => {
    console.log(args)
    //tools.createMenuBar(args.menu,'.toolbar-header')
    tools.createSideBar(args.menu,'#fornav_container')
    
});

ipc.on('listReceived',(event,args)=>{
    createHeader(args.option)
    createBodyTable(args)     
});

/**
 * ipc on receive addrows
 * Aqui se evalua para agregar rows a la tabla especificada por id
 * 
*/
ipc.on('addRowReceived',(event,args)=>{
    let table = Metro.getPlugin("#container-data-items", "table");
    table.items = []
    table.draw()

    console.log(args)
})


function getContent(){
    let container =  document.getElementById('#fornav_container');
    let modulo = container.dataset.child    
}


/**eventos methods*/
window.openChild = function(event){
    
    //console.log(event);
    let _this = event.target
    let id = _this.dataset.id
    let open = _this.dataset.open   


    ipc.send('openChildWindow',{
        id:id,
        open:open
    })
    
} 

window.openHist = function(_this) {
    let id =  _this.dataset.id
    let open = _this.dataset.open
    ipc.send('getContent', {
        id:id,
        open:open
    })
}
window.openEditable = function(_this){

    console.log(_this)

    /*let id =  _this.dataset.id
    let open = _this.dataset.open
    ipc.send('getContent', {
        id:id,
        open:open
    })*/
} 

window.openLink = function(el){
    var optc = document.getElementById("fornav_container").dataset.child
    if(optc!=el.dataset.codigo){
        ipc.send('openSite',{
            view:el.dataset.parent,
            link:el.dataset.codigo
        })     
    }

    
}
