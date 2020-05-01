const express = require('express')
const Country = require('../models/model.js')
let mongoose = require('mongoose')
const rateLimit = require("express-rate-limit");
const countryCodes = require('../utils/countryCodes')
const router = express.Router()

const limit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    handler: function(req, res, /*next*/ ) {
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
            var country = await Country.findOne({ name: req.body.country })
            if(!country){
                console.log("country not yet added: " + req.body.country)
                var _id = new mongoose.Types.ObjectId();
                var query = {
                    _id: _id,
                    name: req.body.country,
                    isoCode: countryCodes[req.body.country],
                    variants:[{
                        values: req.body.values,
                        addedBy: (req.body.username != undefined && req.body.username != null) ? req.body.username : undefined,
                        addedAt: CurrentDate(),
                    }],
                    addedAt: CurrentDate(),  
                }
                try {
                    let country = new Country(query)
                    country.save(async function(err, doc) {
                        if (err) {
                            console.log(err)
                            res.json({
                                status: '400',
                                type: 'error'
                            });
                        } else {
                            //console.log(doc)
                            console.log("Country added as: " + doc._id)
                            res.json({
                                status: '200',
                                response: "success"
                            });
                        }
                    })
                } catch (error) {
                    console.log(error)
                    res.json({
                        status: '400',
                        type: 'error'
                    });
                }
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
                    addedAt: CurrentDate(),
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
    var countries = await Country.find()
    res.json({
        status: 200,
        response:"success",
        data: countries
    })
        
})

router.post('/api/check', async(req, res) => {
    console.log(req.body.values)
    var results = []
    var countries = await Country.find()
    for(i in countries){
        for(a in countries[i].variants){
            var matches = 0;
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
    var max = {matches: 0};
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
    if(req.query.iso != undefined){
        var country = await Country.findOne({isoCode: req.query.iso})
    }else{
        var country = await Country.findOne({name: req.query.name})
    }
    if(!country){
        console.log("country not in db")
        return res.redirect("https://country.mxis.ch")
    }
    console.log(country.variants[0])
    res.render("country.ejs", {country: country.name, iso: country.isoCode, variations: country.variants})    
})

function CurrentDate() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    var current_date = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    return current_date;
}

module.exports = router