const { init } = require('./server')
const runningAt = require('running-at')

/**
 * Start server on given port
 */
async function startServer() {
	try {
		const app = init()
		const PORT = process.env.PORT || 3000
		app.listen(PORT, () => runningAt.print(PORT))
	} catch (error) {
		console.error('Server setup failed. Wrong server IP or authentication?')
		console.error(error)
		process.exit(1)
	}
}

startServer()