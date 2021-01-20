const mongoose = require('mongoose')
const rateLimit = require("express-rate-limit");
const ejs = require('ejs')
const express = require('express')
const router = express.Router()

const Country = require('../models/country.js')
const countryCodes = require('../utils/countryCodes')

const limit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    handler: function(req, res,) {
        console.log(req.ip + " has exceeded rate limit")
        res.status(429).send({
            status: 429,
            type: 'error',
            response: "rate limit exceeded",
            error: {
                text: 'rate limit exceeded',
                limit: req.rateLimit.limit,
                current: req.rateLimit.current,
                remaining: req.rateLimit.remaining,
                resetTime: req.rateLimit.resetTime
            }
        });
    },
    draft_polli_ratelimit_headers: true,
    headers: true
});

router.post('/api/add', limit, async(req, res) => {
    console.log("Country: " + req.body.country + " User: " + req.body.username)
    if(countryCodes[req.body.country] != undefined){
        try {
            const country = await Country.findOne({ name: req.body.country })
            if(!country){
                console.log("country not yet added: " + req.body.country)
                const query = {
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.country,
                    isoCode: countryCodes[req.body.country],
                    variants:[{
                        values: req.body.values,
                        addedBy: req.body.username,
                        addedAt: currentDate(),
                    }],
                    addedAt: currentDate(),  
                }
                const country = new Country(query)
                country.save(async function(err, doc) {
                    if (err) {
                        console.log(err)
                        return res.json({
                            status: '400',
                            type: 'error'
                        });
                    }

                    console.log("Country added as: " + doc._id)
                    res.json({
                        status: '200',
                        response: "success"
                    });
                })
            }else{
                console.log(country)
                for(i in country.variants){
                    if(JSON.stringify(country.variants[i].values) == JSON.stringify(req.body.values)){
                        console.log("variation already in db")
                        return res.json({
                            status: 201,
                            response: 'variation already in db'
                        })
                    }
                }

                country.variants.push({
                    values: req.body.values,
                    addedBy: (req.body.username != undefined && req.body.username != null) ? req.body.username : undefined,
                    addedAt: currentDate(),
                })

                await country.save(function(err) {
                    if (err) {
                        console.error(err);
                        throw ({ error: err, code: 400 })
                    }
                    res.json({
                        status: 200,
                        response: 'success'
                    })
                });
            }
        } catch (error) {
            console.log(error)
            res.json({ status: 500, response: "error" })
        }
    }else{
        console.log(req.body.country + " is not a valid country")
        res.json({
            status: 400,
            response: "not a valid country"
        })
    }
});

router.get('/api/get', async(req, res) => {
    const countries = await Country.find()
    res.json({
        status: 200,
        response:"success",
        data: countries
    })  
})

router.get('/api/countries', async(req, res) => {
    const countries = await Country.find()
    const result = []

    for(i in countries){
        result.push({
            name: countries[i].name,
            values: countries[i].variants[0].values,
            addedBy: countries[i].variants[0].addedBy,
        })
    }

    res.json({
        status: 200,
        response:"success",
        data: result
    })
        
})

router.post('/api/check', async(req, res) => {
    console.log(req.body.values)

    const results = []
    const countries = await Country.find()
    for(i in countries){
        for(a in countries[i].variants){
            let matches = 0;

            for (v = 0; v < req.body.values.length; v++) {
                if(req.body.values[v] == countries[i].variants[a].values[v]){
                    matches++
                }
            }

            results.push({
                country: countries[i].name,
                variation: "id",
                addedBy: countries[i].variants[a].addedBy,
                addedAt: countries[i].variants[a].addedAt,
                matches: matches
            })
        }
    }

    const max = { matches: 0 };
    for(i in results){
        if(results[i].matches > max.matches){
            max = results[i]
        }
    }
    
    console.log("max: " + max.country + " with " + max.matches + " matches")
    res.json({
        status: 200,
        response:"success",
        data: {
            name: max.country,
            iso: max.isoCode,
            addedBy: max.addedBy,
            addedAt: max.addedAt,
            matches: max.matches
        }
    })
        
})

router.get('/country', async(req, res) => {
    let country
    if (req.query.iso != undefined) {
        country = await Country.findOne({isoCode: req.query.iso})
    } else {
        country = await Country.findOne({name: req.query.name})
    }

    if (!country) {
        console.log("country not in db")
        return res.redirect("https://country.mxis.ch")
    }

    console.log(country.variants[0])
    const html = await ejs.renderFile('./src/views/country.ejs', { country: country.name, iso: country.isoCode, variations: country.variants })
	return res.send(html)
})

// Would be better to use Date.now()
function currentDate() {
    const dateOb = new Date();
    const date = ("0" + dateOb.getDate()).slice(-2);
    const month = ("0" + (dateOb.getMonth() + 1)).slice(-2);
    const year = dateOb.getFullYear();
    const hours = dateOb.getHours();
    const minutes = dateOb.getMinutes();
    const seconds = dateOb.getSeconds();
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}

module.exports = router