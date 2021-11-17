const express = require('express');
const path = require('path');
const query = require('../util/query.js');

const router = express.Router();

const db = require('../util/dbconfig.js');

router.get('/', async (req, res, next) => {

    const stuff = await query('INSERT SQL STATEMENT');
    console.log(stuff);
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));   
});

module.exports = router;