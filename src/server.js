const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const compression = require('compression')
const helmet = require('helmet')
const dotenv = require('dotenv')
dotenv.config()

const appRouter = require('./router/app.js')
const middleware = require('./middleware')

const init = () => {

	require('./database').connect()

	app.use(middleware.log())

	app.use(express.static('src/public'))
	app.use(express.json({ limit: '1mb' }))
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))

	app.use(compression())
	app.use(helmet())
	app.use(cors())
	app.use(helmet.hidePoweredBy({ setTo: 'Nokia 3310' }))
	app.use((req, res, next) => {
		res.append('answer', '42')
		next()
	})

	app.use(appRouter)

	process.on('unhandledRejection', (reason, p) => {
		console.log('Unhandled Rejection at: Promise ', p, ' reason: ', reason)
	})
	process.on('uncaughtException', (error) => {
		console.log('Shit hit the fan (uncaughtException): ', error)
		// process.exit(1);
	})

	return app
}

module.exports.init = init