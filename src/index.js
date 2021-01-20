const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const cors = require('cors')
const compression = require('compression');
const helmet = require('helmet');
const { getClientIp } = require('request-ip')
const dotenv = require('dotenv');
dotenv.config();
require('./database').connect()

const appRouter = require('./router/app.js')
const middleware = require("./middleware")

app.use(middleware.log())

app.use(express.static('src/public'));
app.use(express.json({ limit: '1mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(helmet.hidePoweredBy({ setTo: 'Nokia 3310' }));
app.use((req, res, next) => {
    res.append('answer', '42');
    next();
});

app.use(appRouter)

const port = process.env.PORT || 3000
app.listen(port, () => console.log('listening on port ' + port));

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});
process.on('uncaughtException', (error) => {
    console.log('Shit hit the fan (uncaughtException): ', error);
    //process.exit(1);
})

app.get('/test', (request, response) => {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log('Got a test request from: ' + ip);
    response.json({
        status: '200',
        response: "GET request successfull"
    });
});

app.post('/test', (request, response) => {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log('Got a test request from: ' + ip);
    response.json({
        status: '200',
        response: "POST request successfull"
    });
});

app.use(function(req, res, next) {
    const ip = getClientIp(req)
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    var time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
    console.log(time + " " + req.method + " " + req.originalUrl + ' request from: ' + ip + " -> 404");
    res.status(404);
    if (req.accepts('json')) {
        res.send({ status: 404, response: 'Not found' });
        return;
    }
    res.type('txt').send('Not found');
});
