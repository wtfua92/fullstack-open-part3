require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const Person = require('./models/Person');
const errorHandler = require('./middleware/errorHandler');
const unknownEndpoint = require('./middleware/unknownEndpoint');

const app = express();

logger.token('body', function (req) { return req.method === 'POST' ? JSON.stringify(req.body) : null; });

app.use(require('cors')());
app.use(logger(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    '-',
    tokens['response-time'](req, res), 'ms',
    tokens['body'](req, res)
  ].join(' ');
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join('build')));

app.get('/api/info', (req, res) => {
  Person.find({}).then((result) => {
    const message = `Phone Book has ${result.length} entries. ${new Date()}`;
    if (result.length > 0) {
      res.send(message);
    } else {
      res.send('Phone Book is empty');
    }
  });
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then((result) => {
    if (result.length > 0) {
      res.json(result.map(r => r.toJSON()));
    } else {
      res.json({ message: 'Phone Book is empty' });
    }
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((result) => {
      if (result) {
        res.json(result.toJSON());
      } else {
        res.status(404).json({ message: `Contact ${req.params.id} wasn't found` });
      }
    })
    .catch((err) => next(err));
});

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;
  const newPerson = new Person({
    name,
    number
  });

  newPerson.save()
    .then((result) => {
      res.json(result.toJSON());
    })
    .catch((e) => next(e));
});

app.put('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndUpdate(req.params.id, req.body, { new: true } )
    .then((updatedPerson) => {
      res.json(updatedPerson.toJSON());
    })
    .catch((e) => next(e));
});


app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((e) => next(e));
});

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;