const express = require('express')
const app = require("./config/config.js")
const hbs = require("express-handlebars")
const path = require("path")
const Ip = require('./api/ip.js')
const MySql = require('./mysql/connection.js')
const User = require('./models/User.js')
const Post = require('./models/Post.js')


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
      res.render("home", { nomeMenu: user['nome'], subtitle: "- Sua plataforma de notícias e conteudos relacionados á Tecnologia e Informação" })
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
app.post('/login', async(req, res)=>{
  const ip = await Ip()
  const mysql = await MySql()
  const { email, senha } = await req.body
  const user = await User.findOne({
    where: {
      email,
      senha
    }
  })
  if(user===null){
    const error = `
    <div class="alert alert-danger" role="alert">
      Email ou senha inválidos!
    </div>
    `
    res.render('login', { subtitle: "- Login", error })
    console.error("Email ou senha Inválidos.")
  }else{
    const [ update, rows ] = await mysql.query(`UPDATE users SET ip = '${ip.ip}' WHERE email = '${email}' AND senha = '${senha}'`)
    console.log(update)
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
app.post('/cadastro', async(req, res)=>{
  const { nome, email, senha } = await req.body
  const formatNome = nome.replace(' ', '').toLowerCase()
  const ip = await Ip()
  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })
  const findUserExists = await User.findOne({
    where: {
      nome: formatNome,
      email
    }
  })
  if(findUserExists === null){
    const newUser = await User.create({
      nome: req.body.nome,
      email: req.body.email,
      senha: senha,
      biografia: "Sou um novo usuário!",
      ip: ip.ip
    })
    console.log(newUser)
    res.redirect('/')
  }else{
    const notify = `
      <div class="alert alert-danger" role="alert">
        Já existe um usuário com o nome <strong>${nome}</strong> ou email <strong>${email}</strong>. Por favor, tente novamente.
      </div>
    `
    res.render('cadastro', {
      subtitle: "- Cadastrar novo usuario",
      notify
    })
  }
})
app.get('/publicar', async(req, res)=>{
  const ip = await Ip()
  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })
  if(user === null){
    res.redirect('/login')
  }else{
    res.render('publicar', { subtitle: "- Publicar novo conteúdo" })
  }
})
app.post('/publicar', async(req, res)=>{
  const { titulo, conteudo, fonte } = await req.body
  const ip = await Ip()
  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })
  if(user === null){
    res.redirect('/login')
  }else{
    const newPost = await Post.create({
      titulo,
      conteudo,
      fonte,
      nome: user["nome"]
    })
    console.log(newPost)
    res.redirect(`/@${newPost["nome"]}/${newPost["id"]}`)
  }
})
app.get("/@:nome", async(req, res)=>{
  const nome = await req.params.nome
  const ip = await Ip()
  const mysql = await MySql()

  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })
  
  if(user === null){
    res.redirect("/login")
  }else{
    const btn = `
      <button type="button" class="btn btn-sm btn-secondary">Editar perfil</button>
    `
    const userFind = await User.findOne({
      where: {
        nome
      }
    })
    if(user["nome"] === userFind["nome"]){
      res.render("profile", { btn, nomeMenu: user['nome'] })
    }else{
      res.render("profile", { nomeMenu: user['nome'] })
    }
  }
})