require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const logger = require('morgan');
const auth = require('./controllers/authcontroller');

const app = express();
app.use(cors());
app.use(logger(function (tokens, req, res) {
    return [
        Date(),
        req.headers['authorization'],
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ');
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


app.get('/ping', (req, res) => {
    res.json({ message: 'pong! CodepeakDaily API is up and running.' });
});

app.use('/auth', auth);
//set port
app.set('port', (process.env.PORT || 4000));

app.listen(app.get('port'), function () {
    console.log(`Server started on port ${app.get('port')}`);
    require("./config/database").connect();
});