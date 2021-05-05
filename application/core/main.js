// Modules
const sha1 = require('sha1');
const {app,dialog, BrowserWindow, ipcMain, Menu, MenuItem} = require('electron')
const DBSQL = require('./dbController')
const Usuario = require('./model/usuarios/Usuario')
const Expediente = require('./model/expedientes/Expediente')
const path = require("path")
const Lugar = require('./model/lugares/lugar')

var pathapp = path.join(path.dirname(__filename),'..')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let addWindow
let loginWindow
let sideRightWindow
let menu_app
let menu_principal
let ipc = ipcMain
let results

global.requestData = {}

async function LOGIN_VALID(event,args){
  let usr = new Usuario()
  let usr_data = await usr.login(args.usr)  

  if(usr_data.length>0){
    let uid=null
    usr_data.map((row)=>{
      let hash_pass = sha1(args.pss)
      
      if(hash_pass==row.contrasenia){          
           uid = row.usuario_id
      }
    })

    if(uid!==null){
      
      menu_app = await usr.getMenuAccess(uid)
      menu_principal = Menu.buildFromTemplate(menu_app.menu)
      createWindow()
      
      
      loginWindow.close()
    }else{
      event.sender.send('lognreply',{case:'pass'})
    }
  }else{
    event.sender.send('lognreply',{case:'user'})
  }  
}

async function isconectado(event){
    let conexion = new DBSQL()
    let  isconexion = await conexion.getconexion()
    event.sender.send('isconected',{isconected:isconexion})  
}

/**obteniendo listado de las tablas*/

async function getDataList(event,opt){
  switch(opt){
    case 'expediente_clinico':
      let expediente = new Expediente()
      results = await expediente.getList()
      event.sender.send('listReceived',{ data:results,option:opt })
      
    break
    case 'lugares':
      let lugar = new Lugar()
      results = await lugar.getList()
      event.sender.send('listReceived',{ data:results,option:opt})

      break;

  }
}

/*on expediente grid table*/
ipc.on('getList',(event,args)=>{
  getDataList(event,args.option)  
})



/**on addNewFormDetail args*/
ipc.on('addNewFormDetail', async (event,args) => {
  let msg = ''
  let results = false
  let err = false

  switch(args.action){
    case 'lugar':
      let lugar = new Lugar()
      results = await lugar.save(args.data)
      
      if(results.hasOwnProperty('error')){
        msg = `Ha ocurrido un error con la base de datos. Checar el log para ver mas detalles.`
        err = true
      }else{
        msg = 'Los datos han sido guardados exitósamente.'
        results = await lugar.getRowInserted(results.insertId) 
      }
      break
    default:
        msg = 'Esta peticion no es admitida.'
        err = true
      break        
  }

  //event.sender.send('addReceived',{ data:results,msg:msg,err:err})
  mainWindow.webContents.send('addRowReceived',{data:results,msg:msg,err:err})
  addWindow.close()  
  

})



/**on cancel login*/
ipc.on('cancellogin',(event,args)=>{
  app.quit()
})

ipc.on('closeAddWindow',(event,args)=>{
  addWindow.close()  
})

ipc.on('closewindow',(event,args)=>{
       
  let answers = ['Si','No']
  dialog.showMessageBox(null, {
    title:'Salir de la aplicación',
    buttons: answers,
    message: '¿Deseas cerrar la aplicación?',
    detail:'Presiona el botón de "Si" para cerrar la aplicación.'
    
  }).then( (data) => {
    if(data.response===1)
          return
    app.quit()
  });

  
})

ipc.on('logn', (event, args) => {
  LOGIN_VALID(event,args)  
 });

/**getconection*/
ipc.on('getconnection',(event,args) => {
isconectado(event)
})

ipc.on('getMenu',(event,args) => {
  event.sender.send('ismenu',{menu:menu_app.sidemenu})
})

ipc.on('getContent',(event,args) => {
  global.requestData = {
    id:args.id,
    open:args.open
  };
  mainWindow.loadFile('application/views/clinica/historial_clinico.html')
})

ipc.on('openSite',(event,args) => {
  mainWindow.loadFile(`application/views/${args.view}/${args.link}.html`)
})

ipc.on('openChildWindow',(event,args)=>{
  createAddWindowModal(  args  )
});


function handleMenuItems(item){
  console.log(item)
}

// Create a new BrowserWindow when `app` is ready
function createWindow () {  

  mainWindow = new BrowserWindow({
    width: 1280, height: 720,
    minWidth:800, minHeight:560, 
    frame:false,    
    webPreferences: { show:false, nodeIntegration: false,  preload:`${pathapp}/render/rcontent.js`  }
  })

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('application/views/clinica/expediente_clinico.html')

  Menu.setApplicationMenu(menu_principal)
  
  /*
  let vm = new BrowserView({
    webPreferences:{
      nodeIntegration:false, 
      preload:`${pathapp}/render/rmenu.js`   
    }
  })

  let vc = new BrowserView({
    webPreferences:{
      nodeIntegration:false, 
      preload:`${pathapp}/render/rcontent.js`   
    }
  })

  mainWindow.addBrowserView(vm)
  vm.setBounds({x:0,y:55,width:240,height:540})
  vm.setAutoResize({height:true})
  vm.webContents.loadFile('application/views/clinica/menu.html')

  mainWindow.addBrowserView(vc)
  vc.setBounds({x:240,y:55,width:960,height:540})
  vc.setAutoResize({width:true,height:true})
  vc.webContents.loadFile('application/views/clinica/expedientes.html')
  */

  /*
  let position_win = mainWindow.getPosition() 
  sideRightWindow = new BrowserWindow({
    width: 1010, height: 610,
    minWidth:530, minHeight:450,
    x:position_win[0]+240,
    y:position_win[1]+95,
    parent:mainWindow,
    transparent:true,
    frame:false,
    show:false,        
    webPreferences: { nodeIntegration: false }
  })
  

  sideRightWindow.loadFile('application/views/clinica/menu.html')

  sideRightWindow.on('closed',  () => {
    sideRightWindow = null
  })

  setTimeout(()=>{
     sideRightWindow.show(); 
  },500)

  mainWindow.on('move', function() {
    let position = mainWindow.getPosition();
    sideRightWindow.setPosition(position[0]+240, position[1]+95);
  });


*/

    
  // Open DevTools - Remove for PRODUCTION!
  mainWindow.webContents.openDevTools()  
  
  mainWindow.on('ready-to-show',  () => {
    mainWindow.show()
  }) 


  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  }) 


}

//function create Login Window
function createLoginWindow(){
  

  loginWindow = new BrowserWindow({
    width: 450, height: 450,
    minWidth:450, minHeight:450, 
    frame:false,   
    resizable: false,
    fullscreen: false,    
    webPreferences: { show:false, nodeIntegration: false, preload:`${pathapp}/render/rlogin.js` }
  })
  //loginWindow.webContents.openDevTools()
  loginWindow.loadFile('application/views/inicio/index.html')

  loginWindow.on('ready-to-show',()=>{
    loginWindow.show()
  })

  loginWindow.on('closed',  () => {
    loginWindow = null
  })
}


function createAddWindowModal(args){
    let id = args.id
    let open = args.open

    addWindow = new BrowserWindow({ 
      parent: mainWindow, 
      width: 800, height: 560,
      minWidth:800, minHeight:560,
      frame:true,
      minimizable:false,
      maximizable:false,
      modal: true, 
      icon: `${pathapp}/assets/logo/adoctor_circle.ico`,
      webPreferences: {show:false, nodeIntegration: false,  preload:`${pathapp}/render/rcontent_add.js`  }
    })
    addWindow.setMenu(null)
    
    /*addWindow.on('ready-to-show',()=>{
      addWindow.show()
    })*/
    

    addWindow.loadFile('application/views/'+id+'/'+open+'.html')
    addWindow.webContents.openDevTools()
    addWindow.webContents.on('did-finish-load', () => {
      addWindow.show()
      console.log('addwindow is visible!')
    })

        
    addWindow.on('closed',  () => {
      addWindow = null
    })

    
}



// Electron `app` is ready
app.on('ready', ()=>{
  createLoginWindow()
  
})

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})



// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
