const mongoose = require('mongoose');

const NotaSchema = mongoose.Schema({
  title: String,
  body: String
});
const Nota = mongoose.model('nota', NotaSchema);

module.exports = Nota;
