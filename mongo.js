const mongoose = require('mongoose');
const [_, __, password, name, number] = process.argv;

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model('Person', personSchema);

if (!password) {
    console.log('you must provide DB password');
    process.exit(1);
}

mongoose.connect(`mongodb+srv://wtfua92:${password}@phonebook-oo4hj.mongodb.net/PhoneBook?retryWrites=true&w=majority`, {useNewUrlParser: true}).then(() => {
    console.log('DB connected');
});

if (password && (!name && !number)) {
    Person.find({}).then((result) => {
        if (result.length > 0) {
            console.log('phonebook');
            result.forEach(({name, number}) => {
                console.log(`${name} ${number}`);
            });
        } else {
            console.log('phonebook is empty');
        }
        mongoose.connection.close();
        process.exit(0);
    });
}

const newPerson = new Person({
    name,
    number
});

newPerson.save().then(() => {
    console.log(`${name} was saved`);
    mongoose.connection.close();
    process.exit(0);
});

