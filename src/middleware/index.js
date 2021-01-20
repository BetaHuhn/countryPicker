const { getClientIp } = require('request-ip')

module.exports = {
    log: () => {
        return (req, res, next) => {
            const ip = getClientIp(req)
            const dateOb = new Date();
            const date = ("0" + dateOb.getDate()).slice(-2);
            const month = ("0" + (dateOb.getMonth() + 1)).slice(-2);
            const year = dateOb.getFullYear();
            const hours = dateOb.getHours();
            const minutes = dateOb.getMinutes();
            const seconds = dateOb.getSeconds();
            const milli = dateOb.getMilliseconds();
            const time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "." + milli;
            console.log(time + " " + req.method + " " + req.originalUrl + ' request from: ' + ip);
            next()
        }
    }
}