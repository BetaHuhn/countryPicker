const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: {
		type: String,
		required: true,
		unique: true
	},
	isoCode: {
		type: String,
		required: true,
		unique: true
	},
	variants: [{
		_id: false,
		values: [],
		addedBy: {
			type: String
		},
		addedAt: {
			type: Date
		}
	}],
	addedAt: {
		type: Date,
		required: true
	}
})

const Country = mongoose.model('Country', schema)
module.exports = Country