require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const logger = require('morgan');
logger.token('body', function (req) { return req.method === 'POST' ? JSON.stringify(req.body) : null });

const Person = require('./models/Person');

const app = express();

app.use(require('cors')());
app.use(logger(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        '-',
        tokens['response-time'](req, res), 'ms',
        tokens['body'](req, res)
    ].join(' ')
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/persons', (req, res) => {
    Person.find({}).then((result) => {
        if (result.length > 0) {
            res.json(result.map(r => r.toJSON()));
        } else {
            res.json({message: 'Phone Book is empty'});
        }
    });
});

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id)
        .then((result) => {
            if (result) {
                res.json(result.toJSON());
            } else {
                res.json({message: `Contact ${req.params.id} wasn't found`});
            }
        })
        .catch(() => {
            res.json({message: 'malformed id'});
        });
});

app.post('/api/persons', (req, res) => {
    const {name, number} = req.body;
    const newPerson = new Person({
        name,
        number
    });

    newPerson.save()
        .then((result) => {
            res.json(result.toJSON());
        })
        .catch((e) => {
            res.status(400).json({message: 'something went wrong', error: 'message'});
        });
});
//
// app.delete('/api/persons/:id', (req, res) => {
//     const contact = persons.find(p => p.id === +req.params.id);
//     if (!contact) {
//         return res.status(404).end();
//     }
//     persons = persons.filter(p => p.id !== +req.params.id);
//     res.send('<p>Contact successfully deleted</p>');
// });

module.exports = app;