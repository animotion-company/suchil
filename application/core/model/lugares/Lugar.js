const DBSQL = require('../../dbController')

class Lugar {
    sql = null;
    constructor(){
        this.sql = new DBSQL()
    }
    async getList(){

        let lugares = await this.sql.consulta({
            query:'SELECT lugar_id as id, descripcion, capacidad, \'EDIT\' AS editar FROM lugares ORDER BY lugar_id desc',
            params:[]
        })  
        return lugares        
    }

    async save(data){
        let res = await this.sql.inserta({
            query:'INSERT INTO lugares (descripcion,capacidad) VALUES(?,?)',
            params:[data.lugar,data.capacidad]
        })        
        

        
        return res
    }

    async getRowInserted(id){
        let lugar = await this.sql.consulta({
            query:'SELECT lugar_id as id, descripcion, capacidad, \'EDIT\' AS editar FROM lugares WHERE lugar_id=?',
            params:[id]
        })  
        return lugar  
    }



}


module.exports = Lugar