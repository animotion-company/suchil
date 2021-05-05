const DBSQL = require('../../dbController')

class Expediente {
    sql = null;
    constructor(){
        this.sql = new DBSQL()
    }
    async getList(){

        let expedientes = await this.sql.consulta({
            query:'SELECT ec.expediente_clinico_id as id,ec.fecha_alta as fecha,CONCAT(p.nombres,\' \',p.apellido_paterno) AS nombre_completo , ec.enviado_por_dr, '+  
            'ec.diagnostico, ec.motivoConsulta, ec.comentarios, ec.estatura_inicial, ec.peso_inicial, \'IMC\' AS imc, \'EDIT\' AS hist  FROM expediente_clinico AS ec INNER JOIN personas AS p ON p.persona_id = ec.persona_id ORDER BY expediente_clinico_id desc',
            params:[]
        })  
        return expedientes        
    }

}


module.exports = Expediente