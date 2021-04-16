/* main.js - Maximilian Schiller 2020 */

const div = document.querySelector('#flag')
const x = 15
const y = 9

let color = 'black'
let down = false

const map = [ 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'white', 'black' ]
let countries = []

const urlString = window.location.href
const url = new URL(urlString)

let code = url.searchParams.get('code')
if (code) {
	const colors = []
	// eslint-disable-next-line no-undef
	code = BigInt('0x' + code).toString(10)
	console.log(code)
	code.split('').forEach(function(c) {
		colors.push(map[parseInt(c)])
	})
	console.log(colors)
	div.innerHTML = ''
	for (const i in colors) {
		const span = document.createElement('span')
		span.classList.add('pixel')
		span.style.backgroundColor = colors[i]
		div.appendChild(span)
	}
	document.querySelectorAll('#colselect>span').forEach((s) => {
		s.addEventListener('click', (e) => {
			color = e.target.id
		})
	})
	document.querySelectorAll('.pixel').forEach((s) => {
		s.addEventListener('mouseover', (e) => {
			if (down) {
				e.target.style.backgroundColor = color
				classify()
			}
		})
		s.addEventListener('mousedown', (e) => {
			e.target.style.backgroundColor = color
			classify()
		})
	})
	div.addEventListener('mousedown', () => {
		down = true
	})

	div.addEventListener('mouseup', () => {
		down = false
	})
	get(function() {
		classify()
	})
} else {
	init()
	get()
}

function init() {
	for (let i = 0; i < x * y; i++) {
		div.appendChild(document.createElement('span'))
			.classList.add('pixel')
	}
	document.querySelectorAll('#colselect>span').forEach((s) => {
		s.addEventListener('click', (e) => {
			color = e.target.id
		})
	})

	document.querySelectorAll('.pixel').forEach((s) => {
		s.addEventListener('mouseover', (e) => {
			if (down) {
				e.target.style.backgroundColor = color
				classify()
			}
		})
		s.addEventListener('mousedown', (e) => {
			e.target.style.backgroundColor = color
			classify()
		})
	})

	div.addEventListener('mousedown', () => {
		down = true
	})

	div.addEventListener('mouseup', () => {
		down = false
	})
}

function getArr() {
	const ret = []
	document.querySelectorAll('.pixel').forEach((s) => {
		ret.push(s.style.backgroundColor)
	})
	console.log(ret)
	return ret
}

// eslint-disable-next-line no-unused-vars
function hash() {
	const values = getArr().map((x) => {return x === '' ? 'white' : x.split(' ')[0]})
	let result = values.map((x) => map.indexOf(x))
	result = result.join('')
	// eslint-disable-next-line no-undef
	const newCode = BigInt(result).toString(16)
	const resp = 'https://flags.mxis.ch/?code=' + newCode
	const $body = document.getElementsByTagName('body')[0]
	const $tempInput = document.createElement('INPUT')
	$body.appendChild($tempInput)
	$tempInput.setAttribute('value', resp)
	$tempInput.select()
	document.execCommand('copy')
	$body.removeChild($tempInput)
	const span = document.getElementById('share')
	span.innerHTML = 'Link copied'
	setTimeout(function() {
		span.innerHTML = 'Or copy Link to Flag'
	}, 1000)
}

async function get(cb) {
	document.getElementById('list').innerHTML = ''
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	}
	const response = await fetch('/api/get', options)
	const json = await response.json()
	if (json.status === 200) {
		console.log(json)
		countries = json.data
		document.getElementById('count').innerHTML = 'All Flags (' + json.data.length + ')'
		const list = document.getElementById('list')
		for (const i in json.data) {
			const li = document.createElement('li')
			li.innerHTML = `<p>${ json.data[i].name }: ${ json.data[i].variants.length + ((json.data[i].variants.length !== 1) ? ' variations' : ' variation') } - <a href="/country?iso=${ json.data[i].isoCode }">View</a></p>`
			list.appendChild(li)
		}
		if (cb !== undefined) {
			return cb()
		}
	} else {
		console.log(json)
		const error = document.getElementById('error')
		error.innerHTML = 'Oh! An Error occurred.'
	}
}

function classify() {
	const values = getArr().map((x) => {return x === '' ? 'white' : x.split(' ')[0]})
	console.log(values)
	const results = []
	for (const i in countries) {
		for (const a in countries[i].variants) {
			let matches = 0
			for (let v = 0; v < values.length; v++) {
				if (values[v] === countries[i].variants[a].values[v]) {
					matches++
				}
			}
			results.push({
				name: countries[i].name,
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
	const error = document.getElementById('error')
	error.style.color = '#000'
	if (max.name === undefined) {
		error.innerHTML = 'No country recognized'
	} else {
		error.innerHTML = 'Selected Country: ' + max.name + ' (Score: ' + Math.round(max.matches / 135 * 100) + '%)'
	}
}