require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const logger = require('morgan');
const db = require("./config/database.config");
const auth = require('./controllers/auth.controller');
const user = require('./controllers/user.controller');
const course = require('./controllers/course.controller');
const batch = require('./controllers/batch.controller');
const { ValidationError } = require('express-validation');

const app = express();
app.use(cors());
app.use(logger(function (tokens, req, res) {
    return [
        Date(),
        req.headers['authorization'] ? '[WA]' : '[WOA]',
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


app.get('/ping', (_, res) => {
    console.log('Someone checked our hartbeat, and what? Our heart is beating in the perfect order.');
    res.json({ message: 'Pong! CodepeakDaily API is up and running.' });
});

app.use('/auth', auth);
app.use('/user', user);
app.use('/course', course);
app.use('/batch', batch);
app.use(function (err, req, res, next) {
    if (err instanceof ValidationError) {
        console.log(req.body);
        console.log(err);
        console.log(err.details);
        return res.status(err.statusCode).json({
            status: err.statusCode,
            message: err.error
        });
    }
    return res.status(500).json({
        status: 500,
        message: "Wrong request",
        data: err
    });
});

//set port
app.set('port', (process.env.PORT || 4000));

app.listen(app.get('port'), function () {
    console.log(`Server started on port ${app.get('port')}`);
    db.connect();
});