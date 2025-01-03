const express = require("express")
const app = require("./config/config.js")

require("./routes.js")

app.listen(3000, (err)=>{
  if(err) console.log(err)
  console.log("Server running on port 3000")  // Server is listening on port 3000
})