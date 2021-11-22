const express = require('express');
const path = require('path');
const query = require('../util/query.js');


const router = express.Router();

router.get('/', async (req, res, next) => {

    //value and year are zero due to initial loading of the graph
    //Can figure that out later
    res.render('index.ejs', {pagetitle: "Flix", color1: 'rgba(245, 40, 145, 0.8)', value: 0, year: 0});   
});

router.post('/', async (req, res, next) => {
    
    //Need error checking, most likely client side
    const input_year = req.body.year;
    const statement = `SELECT AVG(Runtime) FROM Movie WHERE Year = ${input_year}`;
    const result = await query(statement);
    
    res.render('index.ejs', {pagetitle: "Result", year: input_year , value: result[0][0]});
});

module.exports = router;