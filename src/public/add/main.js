/* main.js - Maximilian Schiller 2020 */
const div = document.querySelector('#flag')
const x = 15
const y = 9

let color = 'black'
let down = false

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
		}
	})
	s.addEventListener('mousedown', (e) => {
		e.target.style.backgroundColor = color
	})
})

div.addEventListener('mousedown', () => {
	down = true
})

div.addEventListener('mouseup', () => {
	down = false
})

function getArr() {
	const ret = []
	document.querySelectorAll('.pixel').forEach((s) => {
		ret.push(s.style.backgroundColor)
	})
	console.log(ret)
	return ret
}

async function get() {
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
		document.getElementById('count').innerHTML = 'All Flags (' + json.data.length + ')'
		const list = document.getElementById('list')
		for (const i in json.data) {
			const li = document.createElement('li')
			li.innerHTML = `<p>${ json.data[i].name }: ${ json.data[i].variants.length + ((json.data[i].variants.length !== 1) ? ' variations' : ' variation') } - <a href="/country?iso=${ json.data[i].isoCode }">View</a></p>`
			list.appendChild(li)
		}
	} else {
		console.log(json)
		const error = document.getElementById('error')
		error.innerHTML = 'Oh! An Error occurred.'
	}
}

get()

const white = [ 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white' ]

// eslint-disable-next-line no-unused-vars
async function add() {
	const country = document.getElementById('country').value
	const values = getArr().map((x) => {return x === '' ? 'white' : x.split(' ')[0]})
	const name = document.getElementById('name').value
	if (country === undefined || country == null || country === '' || country === 'Country') {
		console.log('no country selected')
		const error = document.getElementById('error')
		error.style.color = 'red'
		error.innerHTML = 'Error: You have to select a country from the dropdown menu first'
		return
	} else if (JSON.stringify(values) === JSON.stringify(white)) {
		console.log('nothing drawn')
		const error = document.getElementById('error')
		error.style.color = 'red'
		error.innerHTML = 'Error: You have to draw something first'
		return
	}
	console.log('Values:' + values)
	console.log('Name: ' + name)
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ country: country, values: values, username: name })
	}
	const response = await fetch('/api/add', options)
	const json = await response.json()
	if (json.status === 400) {
		console.log(json)
		const error = document.getElementById('error')
		error.style.color = 'red'
		error.innerHTML = 'Error: Not a valid country'
	} else if (json.status === 200) {
		console.log(json)
		const error = document.getElementById('error')
		error.style.color = '#000'
		error.innerHTML = 'Yay, your flag was added!'
		get()
	} else if (json.status === 201) {
		console.log(json)
		const error = document.getElementById('error')
		error.style.color = 'red'
		error.innerHTML = 'Error: Somebody already drew exactly that. Maybe try drawing the flag in a different way or try another country'
	} else {
		console.log(json)
		const error = document.getElementById('error')
		error.style.color = 'red'
		error.innerHTML = 'Error'
	}
}