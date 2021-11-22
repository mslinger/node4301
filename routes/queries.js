const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/queryone', (req, res, next) => {
    res.render('queryone.ejs', {pagetitle: "Flix - Query One"}); 
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