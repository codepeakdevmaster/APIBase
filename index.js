const express = require('express');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('morgan');
// const userModel = require('./models/user.model');
const auth = require('./controllers/authcontroller');

const app = express();
app.use(cors());
app.use(logger(function (tokens, req, res) {
    return [
        Date(),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//express session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://dbdevcodepeak:Codepeak001234@cluster0.nbfqojg.mongodb.net/cpdaily?retryWrites=true&w=majority');
const connection = mongoose.connection;
connection.once('open', function () {
    console.log('MongoDB connection established successfully');
})


app.get('/ping', (req, res) => {
    res.json({ message: 'pong! CodepeakDaily API is up and running.' });
});

app.use('/auth', auth);
//set port
app.set('port', (process.env.PORT || 4000));

app.listen(app.get('port'), function () {
    console.log(`Server started on port ${app.get('port')}`);
});