const mongoose = require('mongoose');

const NotaSchema = mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: String,
  body: String
});

NotaSchema.methods.truncateBody = function(){
  if (this.body && this.body.length > 75) {
    return this.body.substring(0,70) + "..."
  }
  return this.body;
}

const Nota = mongoose.model('nota', NotaSchema);

module.exports = Nota;
