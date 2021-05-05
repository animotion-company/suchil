const { db: { host, port, name, usr, pass } } = require('./config')
var mysql = require('promise-mysql')

class dbsql {
    
    user = null
    pass = null
    port = null
    name = null
    host = null
    
    constructor(){
        this.user = usr
        this.pass = pass
        this.host = host
        this.name = name
        this.port = port        
    }

    async getconexion(){
        let error = null
                
        let conn = await mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.pass,
            database: this.name
        }).catch((err)=>{
            error = err
        })

        return (error===null) ? true : false       
    }

    async consulta(ob){
        let error = null       
        let conn = await mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.pass,
            database: this.name
        }).catch((err)=>{
            error = err
        })
        
        if(error===null){
            let params = (ob.hasOwnProperty('params')) ? ob.params : []
            let rows = conn.query(ob.query,params)        
            conn.end() 
            return rows       
        }else{
            return false
        }
       
    } 



    async inserta(ob){
        let error = null  
        let res = null     
        let conn = await mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.pass,
            database: this.name
        }).catch((err)=>{
            error = err
        })
        
        if(error===null){
            let params = (ob.hasOwnProperty('params')) ? ob.params : []
            res = await conn.query(ob.query,params).then(result=>{
                return result
            }).catch(err=>{
                return {error:true, errorMensaje: err['sqlMessage'] }
                //[ 'code', 'errno', 'sqlMessage', 'sqlState', 'index', 'sql' ]
            })        
            

            conn.end()                    
        }
        
       
        return res 
    } 



}

module.exports = dbsql;



