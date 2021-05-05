const moment = require('moment');
const anime = require('animejs');
const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;

moment.locale('es')

module.exports = class Tools {

    constructor(){

    }

    arrayPush(arr,data){
        arr.push(data)    
    }

    removeIndex(arr,data){
        for( var i = 0; i < arr.length; i++){ if ( arr[i] === data) { arr.splice(i, 1); }}        
    }



    elementExist(id){
        return document.querySelector(id) ? true : false;
    }
    hasClass(elem, className){
        return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
    }
    addClass(elem, className){
        if (!this.hasClass(elem, className)) {
            elem.className += ' ' + className;
        }
    }
    removeClass(elem, className){
        var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
        if (this.hasClass(elem, className)) {
            while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
                newClass = newClass.replace(' ' + className + ' ', ' ');
            }
            elem.className = newClass.replace(/^\s+|\s+$/g, '');
        }
    }
    toggleClass(elem, className){
        var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ' ) + ' ';
        if (this.hasClass(elem, className)) {
            while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
                newClass = newClass.replace( ' ' + className + ' ' , ' ' );
            }
            elem.className = newClass.replace(/^\s+|\s+$/g, '');
        } else {
            elem.className += ' ' + className;
        }
    }
    removeElement(elem){
        var elemento = document.querySelector(elem)
        elemento.parentNode.removeChild(elemento)
    }  

    isEmptyObject(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }


    createMenuBar(args,container){
        let _this = this
        let menu_bar = document.createElement('x-menubar')
        let cn = document.querySelector(container)
        args.forEach(element => {
            let menu_item = document.createElement('x-menuitem')
            let title = document.createTextNode(element.nombre)
            let label = document.createElement('x-label')
            label.appendChild(title)
            menu_item.appendChild(label)
            menu_bar.appendChild(menu_item)
            if(element.childs.length>0){
                let child_sm = document.createElement('x-menu')
                element.childs.forEach(child => {
                    let child_mi = document.createElement('x-menuitem')
                    let child_t = document.createTextNode(child.nombre)
                    let child_l = document.createElement('x-label')
                    child_l.appendChild(child_t)
                    child_mi.appendChild(child_l)
                    child_sm.appendChild(child_mi)
                    child_mi.addEventListener('click',(event)=>{
                        _this.handleMenuBarClick(event,child)                    
                    })
                })
                menu_item.appendChild(child_sm)
            }            
        });          
        
        cn.appendChild(menu_bar)
    }

    handleMenuBarClick(event,menu){
        this.dirigeA(menu.codigo)
    }

    dirigeA(where){
        switch(where){
            case 'exit':
                this.closeWindow()
                break;
        }
    }

    createSideBar(args,container){
       
       let cn = document.querySelector(container)
       var _this = this
       args.forEach((menu)=>{
            if( (menu.codigo!=='file') && (menu.codigo!='adminstracion_app') ){
                let btn = document.createElement('x-button')
                btn.skin = "nav"
                btn.setAttribute('data-collapse',menu.codigo)
                if(menu.codigo==cn.dataset.toggle){
                        btn.toggled = true
                        btn.className = 'active'
                }
                let icon = document.createElement('x-icon')
                icon.name = menu.imagen
                let text = document.createTextNode(menu.nombre)
                let label = document.createElement('x-label')
                label.appendChild(text)
                btn.appendChild(icon)
                btn.appendChild(label)
                cn.appendChild(btn)
                if(menu.childs.length>0){
                    let sm = document.createElement('ul')
                    sm.id = `collapse_${menu.codigo}`
                    if(btn.toggled){
                        sm.className = 'side_collapsed'    
                    }else{
                        sm.className = 'd-none'     
                    }                   
                    menu.childs.forEach(child => {
                        let child_mi = document.createElement('li')                        
                        child_mi.setAttribute("onclick","openLink(this)")
                        child_mi.dataset.codigo = child.codigo
                        child_mi.dataset.parent = menu.codigo
                        if(child.codigo==cn.dataset.child){
                            child_mi.className='active'
                        }
                        let xbox = document.createElement('x-box')
                        let icon_child = document.createElement('x-icon')
                        icon_child.skin="primary"
                        icon_child.name = child.imagen
                        let child_t = document.createTextNode(child.nombre)
                        let child_l = document.createElement('x-label')
                        child_l.appendChild(child_t)
                        xbox.appendChild(icon_child)
                        xbox.appendChild(child_l)
                        child_mi.appendChild(xbox)
                        sm.appendChild(child_mi)                                            
                    })
                    cn.appendChild(sm)
                }
                btn.addEventListener('click', function(){
                    _this.slideDownEvent(event);                                                     
                });
            }
        })    
    }

    slideDownEvent(event){

        //event.stopP        
        var target=event.target

        console.log(target)    

        if(this.hasClass(target,'active')){
            return
        }else{
            
            this.removeCollapsed()
            target.toggled=true;
            target.className = 'active'
            let code = target.dataset.collapse
            let sm = document.getElementById(`collapse_${code}`)
            this.removeClass(sm,'d-none')
            this.addClass(sm,'side_collapsed')
            anime({
                targets: sm,
                opacity:0,
                scale: .3,
                translateX:-160,
                direction: 'reverse',
                duration:250,
                easing: 'easeInOutSine',
                complete: function(anim) {
                    
                }
            });
        }
        
    }

    removeCollapsed(){
                
        let btn = document.querySelector('x-button.active')
        btn.toggled=false
        this.removeClass(btn,'active')
        let collapse = document.querySelectorAll('.side_collapsed')
        let _this = this
        collapse.forEach((el)=>{
            if(_this.hasClass(el,'side_collapsed')){
                _this.addClass(el,'d-none')
                _this.removeClass(el,'side_collapsed')
            }
        })
    }

    closeWindow(){
        ipc.send('closewindow', true)
    }


    /**
     * cerrar ventana de add new 
    */
    closeAddWindow(){
        ipc.send('closeAddWindow',true)
    }


    createHeaderTable(arr,container){
        let container_table = document.querySelector(`.for_${container}`)
        let table = document.createElement('table')
        table.id=container
        table.className="table compact striped row-hover cell-border"
        table.dataset.role = "table"
        table.dataset.rows = 15
        table.dataset.searchWrapper = "#wrapper-search"
        table.dataset.rowsWrapper = "#wrapper-rows"
        table.dataset.infoWrapper = "#wrapper-info"
        table.dataset.paginationWrapper = "#wrapper-pagination"
        table.dataset.searchMinLength=1
        table.dataset.searchThreshold = 500
        table.dataset.rowsSteps = "10,15,30,45,100"
        table.dataset.showActivity = false
        table.dataset.check=true
        table.dataset.checkStyle=2
        table.dataset.paginationShortMode=true

        let _thead = document.createElement('thead')
        let _row = document.createElement('tr')
        _thead.appendChild(_row)
        arr.forEach((item)=>{
            let _th = document.createElement('th');
            let title = document.createTextNode(item.name); 
            _th.appendChild(title)
            if(item.sort){
                _th.className="sortable-column"
            }
            if(item.hasOwnProperty('format')){
                _th.dataset.format = item.format
            }
            if(item.hasOwnProperty('mask')){
                _th.setAttribute('data-format-mask', "%d-%m-%y");
            }
            if(item.hasOwnProperty('width')){
                _th.setAttribute('data-size',item.width)
            }
            _row.appendChild(_th)
        })
        table.appendChild(_thead)
        container_table.innerHTML = table.outerHTML        
    }

    createRowsTable(arr,container,more){
        let _this = this
        let table = document.getElementById(container)
        let _tbody = document.createElement('tbody')
        
        if(arr.length>0){                
            arr.forEach((el) => {
                if(!_this.isEmptyObject(more)){
                    Object.assign(el, more);
                }
                  
                let _tr = document.createElement('tr')
                for (let [key, value] of Object.entries(el)) {
                    
                    let value_data = value;
                    let appendText = true;
                    if( (typeof value === "object" || typeof value === 'function') && (value !== null) ){
                        if(value.hasOwnProperty('call')){
                            value_data = _this[`${value.call}`](el);
                        }
                        if(value.hasOwnProperty('execute')){
                            appendText = false;
                            value_data = _this[`${value.execute}`](el);                            
                        }
                        if(value.hasOwnProperty('editable')){
                            appendText = false;
                            value_data = _this[`${value.editable}`](el,value.modulo);                            
                        }
                    } 

                    let regx = new RegExp('(\\w*fecha\\w*)','gi')
                    let match = key.match(regx)
                    if(!(match===null)){
                        value_data=moment(value).format('YYYY-MM-DD')      
                    }                   


                    let _td = document.createElement('td')
                    if(appendText){
                        let text = document.createTextNode(value_data)
                        if(value_data===null){
                            text = document.createTextNode('N/D') 
                        }
                        _td.appendChild(text)
                    }else{
                        _td.appendChild(value_data)
                    }
                    _tr.appendChild(_td)                   
                }
                _tbody.appendChild(_tr)
            })
            
            table.appendChild(_tbody)
            
        }         

    }

    unhideButtons(){
        let btns = document.getElementById('wrapper-actions')
        this.removeClass(btns,'no-visible')
    }

    calc_IMC(obj){
       let peso = obj.peso_inicial
       let estatura = obj.estatura_inicial 
       let imc = peso/(Math.pow(estatura,2))      
       return Math.round (imc*100) / 100
    }

    /**get button hist clientes -ver historial cliente*/
    get_HistCLi(obj){
        let _this = this
        let _btn = document.createElement('button')
        //let xicon = document.createElement('x-icon')
        let _icon = document.createElement('span')
        //xicon.className = "icon-size-32"
        _icon.className = "mif-assignment"
        _btn.className = "button square"
        _btn.dataset.id = obj.id
        _btn.dataset.open = "historial_clinico"
        _btn.setAttribute('onclick','openHist(this)')
        //_btn.setAttribute("skin","nav")
        _btn.appendChild(_icon)        
        return _btn
    }

    /*get button de editar -- ver lugar para editarlo crear ventana para editar campos*/
    getEditableModule(obj,module){
        let _this = this
        let _btn = document.createElement('button')
        let _icon = document.createElement('span')
        _icon.className = 'mif-pencil'
        _btn.className = 'button square'
        _btn.dataset.id = obj.id
        _btn.dataset.open = module   
        _btn.setAttribute('onclick','openEditable(this)')   
        _btn.appendChild(_icon)        
        return _btn
    }


    createTabs(arr){
         let cttabs = document.getElementById("container-for-tabs")
         let doctabs = document.createElement("x-doctabs")
         doctabs.id = "doctabs-panel"
         if(arr.length>0){
            arr.forEach((item)=>{
                let doctab = document.createElement("x-doctab")
                doctab.dataset.page = item.page
                if(item.selected){
                    doctab.setAttribute("selected", true)
                }
                let text = document.createTextNode(item.label) 
                let label = document.createElement("x-label")
                label.appendChild(text)
                doctab.appendChild(label)
                doctabs.appendChild(doctab)
            })            
         }
         //cttabs.appendChild(doctabs)        
         cttabs.prepend(doctabs)
        
    }


    
    loadContent(content,id){    
        remote.getCurrentWindow().loadFile('application/views/clinica/historial_clinico.html')   
        //mainWindow.loadFile('application/views/clinica/expedientes.html')

        //console.log(`opened content ${content} and id => ${id}`)
    }


}