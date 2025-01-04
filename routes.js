const express = require('express')
const app = require("./config/config.js")
const hbs = require("express-handlebars")
const path = require("path")
const Ip = require('./api/ip.js')
const MySql = require('./mysql/connection.js')
const User = require('./models/User.js')


app.engine("hbs", hbs.engine({ extname: "hbs" }))
app.set("view engine", "hbs")
app.set("views", path.join(__dirname + "/views"))
app.use(express.static(path.join(__dirname + "/images/")))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get("/", async(req, res)=>{
  const ip = await Ip()
  const mysql = await MySql()
  try{
    const user = await User.findOne({
      where: {
        ip: ip.ip
      }
    })

    if(user===null){
      res.redirect("/login")
    }else{
      res.render("home", { subtitle: "- Sua plataforma de notícias e conteudos relacionados á Tecnologia e Informação" })
    }
  }catch(error){
    res.status(500).send("INTERNAL SERVER ERROR")
  }
})
app.get('/login', async(req, res)=>{
  const ip = await Ip()
  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })
  if(user === null){
    res.render('login', { subtitle: "- Login" })
  }else{
    res.redirect('/')
  }
})
app.get("/cadastro", async(req, res)=>{
  const ip = await Ip()
  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })
  if(user === null){
    res.render("cadastro", { subtitle: "- Cadastrar novo usuario" })
  }else{
    res.redirect('/')
  }
})