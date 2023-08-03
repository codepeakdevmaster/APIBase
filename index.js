require("dotenv").config();
const express = require('express');
var http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');
const compression = require('compression');
const db = require("./config/database.config");
const auth = require('./controllers/auth.controller');
const user = require('./controllers/user.controller');
const course = require('./controllers/course.controller');
const batch = require('./controllers/batch.controller');
const lead = require('./controllers/lead.controller');
const tutor = require('./controllers/tutor.controller');
const intern = require('./controllers/intern.controller');
const urls = require('./config/url.config');
const { ValidationError } = require('express-validation');
var Response = require('./middlewares/response.middleware');
var Authorize = require('./middlewares/auth.middleware');

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
app.use(compression());

app.use(Response);
var noAuthUrls = ["/", "/ping", "/auth/login"];
app.use((req, res, next) => { noAuthUrls.includes(req.url) ? next() : Authorize(req, res, next); });

app.get('/', (_, res) => {
    console.log("Someone checked on our servers.");
    res.Success('CodepeakDaily API is up and running');
})

app.get('/ping', (_, res) => {
    console.log('Someone checked our hartbeat, and what? Our heart is beating in the perfect order.');
    res.Success('Pong! CodepeakDaily API is up and running.');
});

app.use('/auth', auth);
app.use('/user', user);
app.use('/course', course);
app.use('/batch', batch);
app.use('/lead', lead);
app.use('/lead/setintern', lead);
app.use('/tutor', tutor);
app.use('/tutor/setuser', tutor);
app.use('/intern', intern);
app.use('/intern/setuser', intern);



app.use(function (err, req, res, next) {
    if (err instanceof ValidationError) {
        console.log(req.body);
        console.error(err);
        console.log(err.details);
        return res.Custom(err.statusCode, err.error);
    }
    return res.Custom(500, "Wrong request", err);
});
//set port
var port = (process.env.PORT || 4000);
app.set('port', port);

var server = http.createServer(app);

server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    console.log('Listening on ' + bind);
}

server.listen(app.get('port'), function () {
    console.log(`Server started on port ${app.get('port')}`);
    db.connect();
});

