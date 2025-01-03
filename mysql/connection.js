const mysql = require("mysql2")

async function MySql(){
  const connection = await mysql.createPool({
    uri: "mysql://root:OgUqmWhavfiibStHCCAIQKpcLPFGUsYy@junction.proxy.rlwy.net:48810/railway"
  })

  const pool = connection.promise()
  return pool
}

moduele.exports = MySql