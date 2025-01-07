const User = require("../models/User.js");
const db = require("../sequelize/connection.js");

async function checkUser(name, email){
  const fincUser = await User.findOne({
    where: {
      name,
      email
    }
  })
  if(user === null){
    return false;
  }else{
    return true;
  }
}

module.exports = checkUser