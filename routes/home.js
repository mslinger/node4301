const express = require('express');
const path = require('path');
const query = require('../util/query.js');


const router = express.Router();

router.get('/', async (req, res, next) => {

    //value and year are zero due to initial loading of the graph
    //Can figure that out later
    const statement = `SELECT COUNT(ID) FROM Movie;`;
    const result = await query(statement);

    res.render('index.ejs', {pagetitle: "Flix", movies: result[0][0]});   
});

router.post('/', async (req, res, next) => {
    
    //Need error checking, most likely client side
    const input_year = req.body.year;
    const statement = `SELECT AVG(Runtime) FROM Movie WHERE Year = ${input_year}`;
    const result = await query(statement);
    
    res.render('index.ejs', {pagetitle: "Result", year: input_year , value: result[0][0]});
});

module.exports = router;