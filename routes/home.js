const express = require('express');
const path = require('path');
const query = require('../util/query.js');


const router = express.Router();

router.get('/', async (req, res, next) => {

    const statement = `SELECT COUNT(ID) FROM Movie`;
    const result = await query(statement);

    res.render('index.ejs', {pagetitle: "Flix", movies: result});   
});

router.post('/', async (req, res, next) => {
    
    
    const statement = `SELECT SUM(Total) FROM (
        SELECT COUNT(MovieID) AS Total FROM Actor
        UNION ALL SELECT COUNT(MovieID) FROM Awards
        UNION ALL SELECT COUNT(MovieID) FROM BoxOffice
        UNION ALL SELECT COUNT(MovieID) FROM CriticRatings
        UNION ALL SELECT COUNT(MovieID) FROM Director
        UNION ALL SELECT COUNT(MovieID) FROM Genre
        UNION ALL SELECT COUNT(ID) FROM Movie
        UNION ALL SELECT COUNT(MovieID) FROM MovieLanguages
        UNION ALL SELECT COUNT(MovieID) FROM ReleasedIn
    )`;
    const result = await query(statement);

    const statement2 = `SELECT COUNT(ID) FROM Movie`;
    const result2 = await query(statement2);
    
    res.render('index.ejs', {pagetitle: "Flix", total: result, movies: result2, hidden: 'block'});
});

module.exports = router;