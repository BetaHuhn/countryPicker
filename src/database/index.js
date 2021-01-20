const mongoose = require('mongoose');

const options = {
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const url = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/colorPicker'

module.exports.connect = function() {
    mongoose.connect(url, options, )
        .then(() => {
            console.log('Database connection successfull')
            return mongoose
        })
        .catch(err => {
            console.error('Fucked up while connecting to the database: ' + err)
            process.exit();
        })

    mongoose.connection.on('error', err => {
        console.error(err);
    });
}