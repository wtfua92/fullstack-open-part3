// eslint-disable no-undef

const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useCreateIndex: true })
  .then(() => {
    console.log('DB connected');
  })
  .catch((e) => {
    console.log('DB connection failed', e.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  number: {
    type: String,
    unique: true,
    required: true,
    minlength: 8
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

personSchema.plugin(unique);

module.exports = mongoose.model('Person', personSchema);