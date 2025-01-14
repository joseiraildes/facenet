const express = require('express')
const app = require("./config/config.js")
const hbs = require("express-handlebars")
const path = require("path")
const Ip = require('./api/ip.js')
const MySql = require('./mysql/connection.js')
const User = require('./models/User.js')
const Post = require('./models/Post.js')
const { marked } = require('marked')
const Comentario = require('./models/Comentario.js')

app.use(express.static(path.join(__dirname + "/images/")))

app.engine("hbs", hbs.engine({ extname: "hbs" }))
app.set("view engine", "hbs")
app.set("views", path.join(__dirname + "/views"))
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
      const [ posts, rows ] = await mysql.query(`
        SELECT *
        FROM posts
        ORDER BY post_like DESC
      `)
      res.render("home", { nomeMenu: user['nome'], subtitle: "- Sua plataforma de notícias e conteudos relacionados á Tecnologia e Informação", posts })
    }
  }catch(error){
    console.log(error)
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
      conteudo: marked(conteudo),
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

  const [ findUser, ROWS ] = await mysql.query(`
    SELECT *
    FROM users
    WHERE nome = '${nome}'
  `)

  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })
  

  if(user === null){
    res.redirect("/login")
  }else{
    const btn = `
      <button type="button" class="btn btn-sm btn-secondary" onclick="location.href='/editar/perfil'">Editar perfil</button>
    `

    const userFind = await User.findOne({
      where: {
        nome
      }
    })

    if(user["nome"] === userFind["nome"]){
      res.render("profile", { subtitle: `- ${nome}`, btn, nomeMenu: user['nome'], user: findUser })
    
    }else{
      res.render("profile", { subtitle: `- ${nome}`, nomeMenu: user['nome'], user: findUser })
    }
  }
})
app.get('/editar/perfil', async(req, res)=>{
  const ip = await Ip()
  const mysql = await MySql()
  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })
  if(user === null){
    res.redirect('/login')
  }else{
    const [ editProfile, rows ] = await mysql.query(`SELECT * FROM users WHERE ip = '${ip.ip}'`)
    res.render('editar_perfil', { subtitle: "- Editar meu Perfil", user: editProfile, nomeMenu: user['nome'] })
  }
})
app.post('/editar/perfil', async(req, res)=>{
  const { nome, email, senha, biografia } = await req.body
  const ip = await Ip()
  const mysql = await MySql()

  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })

  if(user === null){
    res.redirect('/login')
  }else{
    const update = await User.update({
      nome,
      email,
      senha,
      biografia: marked(biografia)
    },{
      where: {
        ip: ip.ip
      }
    }
    )
    console.log(update)
    res.redirect(`/@${nome}`)
  }
})
app.get('/@:nome/conteudos', async(req, res)=>{
  const ip = await Ip()
  const mysql = await MySql()
  const { nome } = await req.params
  
  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })

  if(user === null){
    res.redirect('/login')
  }else{
    const [ findUser, ROWS ] = await mysql.query(`
      SELECT *
      FROM users
      WHERE nome = '${nome}'
    `)
    const [ selectPosts, rows ] = await mysql.query(`
      SELECT *
      FROM posts
      WHERE nome = '${nome}'
    `)
    res.render('conteudos', { subtitle: `- ${nome}`, nomeMenu: user['nome'], posts: selectPosts, user: findUser })
  }
})

app.get('/@:nome/:id', async(req, res)=>{
  const ip = await Ip()
  const mysql = await MySql()
  const { nome, id } = await req.params

  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })

  if(user === null){
    res.redirect('/login')
  }else{
    const [ post, rows ] = await mysql.query(`
      SELECT *
      FROM posts
      WHERE nome = '${nome}' AND id = ${id}
    `)
    const [ comments, rowsCo ] = await mysql.query(`
      SELECT *
      FROM comentarios
      WHERE post_id = ${id}
      ORDER BY id DESC

    `)

    res.render('post', { subtitle: `- ${post[0]['titulo']}`, nomeMenu: user['nome'], post, comments })
  }
})
app.post('/@:nome/:id/comentar', async(req, res)=>{
  const ip = await Ip()
  const mysql = await MySql()
  const { nome, id } = await req.params
  const { comentario } = req.body

  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })

  if(user===null){
    res.redirect('/login')
  }else{
    const newComment = await Comentario.create({
      post_id: id,
      nome: user['nome'],
      comentario: marked(comentario)
    })
    console.log(newComment)

    res.redirect(`/@${nome}/${id}`)
  }
})
app.post('/@:nome/:id/like', async(req, res)=>{
  const ip = await Ip()
  const mysql = await MySql()
  const { nome, id } = await req.params

  const user = await User.findOne({
    where: {
      ip: ip.ip
    }
  })

  if(user === null){
    res.redirect('/login')
  }else{
    const [ like, rows ] = await mysql.query(`
      UPDATE posts
      SET post_like = post_like + 1
      WHERE nome = '${nome}'
      AND id = ${id}
    `)
    console.log(like)
    res.redirect(`/@${nome}/${id}`)
  }
})