const DBSQL = require('../../dbController')

class Usuario {
    sql = null;
    constructor(){
        this.sql = new DBSQL()
    }

    async login(user,pass){
        let usr = await this.sql.consulta({
            query:'select * from usuarios where nombre_usuario=?',
            params:[user]
        })

        return usr;
    }

    async getUsers(){
        let usrs = await this.sql.consulta({query:'select * from usuarios',params:[]})  
        return usrs
    }

    async getMenuAccess(id){
        let pantallas = await this.sql.consulta({
            query:'SELECT mp.modulo_pantalla_id,mp.padre_id, mp.codigo, mp.texto, mp.outcome, mp.habilitada, mp.orden, mp.imagen, mp.rolmenu, mp.sidebar, mp.menup, mp.accelerator  FROM roles_modulos_pantalla AS rmp '+ 
            'left JOIN modulos_pantallas AS mp ON rmp.modulo_pantalla_id = mp.modulo_pantalla_id '+
            'WHERE rmp.rol_id IN (SELECT rol_id FROM roles_usuarios WHERE usuario_id=?) '+
            'group BY mp.modulo_pantalla_id ORDER BY mp.orden',
            params:[id]
        })
        let mparents = [] 
        let main_menu = []

        pantallas.map((m)=>{
            if(m.padre_id===null && m.sidebar && m.habilitada){
                let mo = {
                    modulo:m.modulo_pantalla_id,
                    codigo:m.codigo,
                    nombre:m.texto,
                    imagen:m.imagen,
                    childs:[],                    
                }                   
                mparents.push(mo)                
            }
            if(m.padre_id===null && m.menup && m.habilitada){
                let mm = {
                    id:m.modulo_pantalla_id,
                    label:m.texto,
                    submenu:[]
                }      
                main_menu.push(mm)
            }

        })
        mparents.map(parent=>{
            pantallas.map(child=>{
               if(child.padre_id==parent.modulo){
                   let child_o = {
                       modulo: child.modulo_pantalla_id,
                       codigo: child.codigo,
                       nombre: child.texto,
                       imagen: child.imagen,                       
                   }                   
                   parent.childs.push(child_o)                   
               }     
            })
        })

        main_menu.map(parent=>{
            pantallas.map(child=>{
               if(child.padre_id==parent.id){                   
                   let child_o = {
                    label:child.texto,
                   } 
                   if(child.rolmenu!==null){
                       child_o.role = child.rolmenu
                   }
                   if(child.accelerator!==null){
                       child_o.accelerator = child.accelerator
                   }                                  
                   parent.submenu.push(child_o)                   
               }     
            })
        })        
        return {sidemenu:mparents,menu:main_menu}
    }


}

module.exports = Usuario