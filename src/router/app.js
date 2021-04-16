const mongoose = require('mongoose')
const rateLimit = require('express-rate-limit')
const ejs = require('ejs')
const express = require('express')
const router = express.Router()

const Country = require('../models/country.js')
const countryCodes = require('../utils/countryCodes')

const CACHE_TIME = 60 * 60 // 1 hour

const limit = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	handler: function(req, res) {
		console.log(req.ip + ' has exceeded rate limit')
		res.status(429).send({
			status: 429,
			type: 'error',
			response: 'rate limit exceeded',
			error: {
				text: 'rate limit exceeded',
				limit: req.rateLimit.limit,
				current: req.rateLimit.current,
				remaining: req.rateLimit.remaining,
				resetTime: req.rateLimit.resetTime
			}
		})
	},
	draft_polli_ratelimit_headers: true,
	headers: true
})

router.post('/api/add', limit, async (req, res) => {
	console.log('Country: ' + req.body.country + ' User: ' + req.body.username)
	if (countryCodes[req.body.country] !== undefined) {
		try {
			const country = await Country.findOne({ name: req.body.country })
			if (!country) {
				console.log('country not yet added: ' + req.body.country)
				const query = {
					_id: new mongoose.Types.ObjectId(),
					name: req.body.country,
					isoCode: countryCodes[req.body.country],
					variants: [{
						values: req.body.values,
						addedBy: req.body.username,
						addedAt: new Date()
					}],
					addedAt: new Date()
				}
				const country = new Country(query)
				country.save(async function(err, doc) {
					if (err) {
						console.log(err)
						return res.json({
							status: '400',
							type: 'error'
						})
					}

					console.log('Country added as: ' + doc._id)
					res.json({
						status: '200',
						response: 'success'
					})
				})
			} else {
				console.log(country)
				for (const i in country.variants) {
					if (JSON.stringify(country.variants[i].values) === JSON.stringify(req.body.values)) {
						console.log('variation already in db')
						return res.json({
							status: 201,
							response: 'variation already in db'
						})
					}
				}

				country.variants.push({
					values: req.body.values,
					addedBy: (req.body.username !== undefined && req.body.username !== null) ? req.body.username : undefined,
					addedAt: new Date()
				})

				await country.save(function(err) {
					if (err) {
						console.error(err)
						throw ({ error: err, code: 400 })
					}
					res.json({
						status: 200,
						response: 'success'
					})
				})
			}
		} catch (error) {
			console.log(error)
			res.json({ status: 500, response: 'error' })
		}
	} else {
		console.log(req.body.country + ' is not a valid country')
		res.json({
			status: 400,
			response: 'not a valid country'
		})
	}
})

router.get('/api/get', async (req, res) => {
	const countries = await Country.find()

	res.setHeader('Cache-Control', `max-age=15, s-max-age=${ CACHE_TIME }, stale-while-revalidate, public`)
	res.json({
		status: 200,
		response: 'success',
		data: countries
	})
})

router.get('/api/countries', async (req, res) => {
	const countries = await Country.find()
	const result = []

	for (const i in countries) {
		result.push({
			name: countries[i].name,
			values: countries[i].variants[0].values,
			addedBy: countries[i].variants[0].addedBy
		})
	}

	res.setHeader('Cache-Control', `max-age=15, s-max-age=${ CACHE_TIME }, stale-while-revalidate, public`)
	res.json({
		status: 200,
		response: 'success',
		data: result
	})

})

router.post('/api/check', async (req, res) => {
	console.log(req.body.values)

	const results = []
	const countries = await Country.find()
	for (const i in countries) {
		for (const a in countries[i].variants) {
			let matches = 0

			for (let v = 0; v < req.body.values.length; v++) {
				if (req.body.values[v] === countries[i].variants[a].values[v]) {
					matches++
				}
			}

			results.push({
				country: countries[i].name,
				variation: 'id',
				addedBy: countries[i].variants[a].addedBy,
				addedAt: countries[i].variants[a].addedAt,
				matches: matches
			})
		}
	}

	let max = { matches: 0 }
	for (const i in results) {
		if (results[i].matches > max.matches) {
			max = results[i]
		}
	}

	console.log('max: ' + max.country + ' with ' + max.matches + ' matches')
	res.json({
		status: 200,
		response: 'success',
		data: {
			name: max.country,
			iso: max.isoCode,
			addedBy: max.addedBy,
			addedAt: max.addedAt,
			matches: max.matches
		}
	})

})

router.get('/country', async (req, res) => {
	let country
	if (req.query.iso !== undefined) {
		country = await Country.findOne({ isoCode: req.query.iso })
	} else {
		country = await Country.findOne({ name: req.query.name })
	}

	if (!country) {
		console.log('country not in db')
		return res.redirect('https://country.mxis.ch')
	}

	console.log(country.variants[0])
	const html = await ejs.renderFile('./src/views/country.ejs', { country: country.name, iso: country.isoCode, variations: country.variants })

	res.setHeader('Cache-Control', `max-age=15, s-max-age=${ CACHE_TIME }, stale-while-revalidate, public`)
	return res.send(html)
})

module.exports = router