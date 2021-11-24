const express = require('express');
const path = require('path');
const query = require('../util/query.js')

const router = express.Router();

router.get('/queryone', (req, res, next) => {
    res.render('queryone.ejs', {pagetitle: "Flix - Query One", data: 0}); 
});

router.post('/queryone', async (req, res, next) => {

    const input_year = req.body.year;
    const statement = `SELECT GenreType(Runtime), COUNT(GenreType) FROM (SELECT GenreType FROM Movie JOIN Genre on Movie.ID = Genre.MovieID WHERE Year = ${input_year}) GROUP BY GenreType`;
    const result = await query(statement);

    res.render('queryone.ejs', {pagetitle: "Flix - Query One", year: input_year, data: result}); 
});

router.get('/querytwo', (req, res, next) => {
    res.render('querytwo.ejs', {pagetitle: "Flix - Query Two"}); 
});

router.get('/querythree', (req, res, next) => {
    res.render('querythree.ejs', {pagetitle: "Flix - Query Three"}); 
});

router.get('/queryfour', (req, res, next) => {
    res.render('queryfour.ejs', {pagetitle: "Flix - Query Four"}); 
});

router.get('/queryfive', (req, res, next) => {
    res.render('queryfive.ejs', {pagetitle: "Flix - Query Five"}); 
});

module.exports = router;