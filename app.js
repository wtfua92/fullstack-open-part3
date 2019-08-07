const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

logger.token('body', function (req) { return req.method === 'POST' ? JSON.stringify(req.body) : null });

const app = express();

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
];

const generateId = () => {
    return Math.floor(Math.random() * Math.floor(1000000));
};

app.use(require('cors'));
app.use(logger('debug'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
    const response = `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `;
    res.send(response);
});

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const contact = persons.find(p => p.id === +req.params.id);
    if (!contact) {
        return res.status(404).end();
    }
    return res.json(contact);
});

app.post('/api/persons', (req, res) => {
    const {name, number} = req.body;
    if (persons.find(p => p.name === name)) {
        return res.json({error: 'name must be unique'});
    }
    if (!name || !number) {
        return res.status(400).json({error: 'name or number is missing'});
    }
    const newPerson = {
        name,
        number,
        id: generateId()
    };
    persons = [...persons, newPerson];
    res.send(`${newPerson.name} was saved to phonebook`);
});

app.delete('/api/persons/:id', (req, res) => {
    const contact = persons.find(p => p.id === +req.params.id);
    if (!contact) {
        return res.status(404).end();
    }
    persons = persons.filter(p => p.id !== +req.params.id);
    res.send('<p>Contact successfully deleted</p>');
});

module.exports = app;
