const express = require('express')
const app = require("./config/config.js")
const hbs = require("express-handlebars")
const path = require("path")


app.engine("hbs", hbs.engine({ extname: "hbs" }))
app.set("view engine", "hbs")
app.set("views", path.join(__dirname + "/views"))
app.use(express.static(path.join(__dirname + "/images/")))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get("/", async(req, res)=>{
  res.render("home")
})