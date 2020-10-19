const express = require('express');
const mongoose = require('mongoose');//1. Se puede requerir antes o después de express
const Nota = require('./models/Nota');// Para separar la definición de los modelos en un archivo diferente, separado de las rutas
const cookieSession = require('cookie-session');
const app = express();

mongoose.connect('mongodb://localhost:27017/notas',{userUrlParser: true});// 2. hacer la conexión
// const NotaSchema = mongoose.Schema({
//   title: String,
//   body: String
// });
// const Nota = mongoose.model('nota', NotaSchema);

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(express.urlencoded({extended:true}));
app.use(cookieSession({secret:'Cadena_secreta', maxAge:86400*1000}));

//Muestra la lista de notas
app.get('/', async (req, res) =>{
  const notas = await Nota.find();
  res.render('index', {notas});
});

//Muestra el formulario para crear una nota
app.get('/notas/new', (req, res) => {
  res.render('new');
});

//Permite Crear una nota
app.post('/notas', async (req, res, next) =>{
  const data = {
    title: req.body.title,
    body: req.body.body
  }

  try{
    const nota = new Nota(data);
    await nota.save();
  }catch(e){
    return next(e);
  }
  res.redirect('/');
});

app.listen(3000,() => console.log('Escuchando en puerto 3000...'))
