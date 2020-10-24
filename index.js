const express = require('express');
const mongoose = require('mongoose');//1. Se puede requerir antes o después de express
const Nota = require('./models/Nota');// Para separar la definición de los modelos en un archivo diferente, separado de las rutas
const User = require('./models/User');
const cookieSession = require('cookie-session');
const PORT = process.env.PORT || 3000;

const app = express();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notas',{userUrlParser: true});// 2. hacer la conexión
// const NotaSchema = mongoose.Schema({
//   title: String,
//   body: String
// });
// const Nota = mongoose.model('nota', NotaSchema);

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(express.urlencoded({extended:true}));
app.use(cookieSession({secret:'Cadena_secreta', maxAge:86400*1000}));

app.use("/assets", express.static("assets"));

const requireUser = (req, res, next) => {
  if (!res.locals.user) {
    return res.redirect("/login");
  }

  next();
};
app.use(async (req, res, next) => {
  const userId = req.session.userId;
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      res.locals.user = user;
    } else {
      delete req.session.userId;
    }
  }

  next();
});

//Muestra la lista de notas
app.get('/', requireUser, async (req, res) =>{
  const notas = await Nota.find({user:res.locals.user});
  res.render('index', {notas});
});

//Muestra el formulario para crear una nota
app.get('/notas/new', requireUser, async (req, res) => {
  const notas = await Nota.find({user:res.locals.user});
  res.render('new', {notas});
});

//Permite Crear una nota
app.post('/notas', requireUser, async (req, res, next) =>{
  const data = {
    title: req.body.title,
    body: req.body.body,
    user: res.locals.user
  }

  try{
    const nota = new Nota(data);
    await nota.save();
  }catch(e){
    return next(e);
  }
  res.redirect('/');
});

//Muestra una nota
app.get('/notas/:id', requireUser, async (req, res) => {
  const notas = await Nota.find({user:res.locals.user});
  const nota = await Nota.findById(req.params.id);
  res.render('show', {notas:notas,currentNote: nota})
})

//Muestra el formulario para ctualizar una Nota
app.get('/notas/:id/edit', requireUser, async(req, res, next) =>{
  try{
    const notas = await Nota.find({user:res.locals.user});
    const nota = await Nota.findById(req.params.id);
    res.render('edit',{notas:notas, currentNote: nota});
  }catch(e){
      return next(e);
  }
});
//Actualiza una Nota
app.patch("/notas/:id/", requireUser, async (req, res, next) =>{
      const id = req.params.id;
      const nota = await Nota.findById(id);

      nota.title = req.body.title;
      nota.body = req.body.body;

      try{
        await nota.save({});
        res.status(204).send({});
      }catch(e){
        return next (e);
      }
});

//Borra una Nota
app.delete('/notas/:id', requireUser, async (req, res, next) =>{
  try{
    await Nota.deleteOne({_id: req.params.id});
    res.status(204).send({});
  }catch(e){
    return next(e);
  }
});

//Formuario Registro Usuario
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async(req, res, next) => {
  try{
    const user = await User.create({
    email: req.body.email,
    password: req.body.password
  });
  res.redirect('/login');
  }catch(err){
    return next(err);
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async(req, res, next) =>{
  try{
    const user = await User.authenticate(req.body.email, req.body.password);
    if (user) {
      req.session.userId = user._id;
      return res.redirect('/');
    }else{
      res.render('/login', {error:'Wrong password or email. Try again!'})
    }
  }catch(err){return next(err);}
});

app.get("/logout", requireUser, (req, res) => {
  res.session = null;
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/login");
});

app.listen(PORT, () => console.log(`Escuchando en puerto ${PORT}...`))
