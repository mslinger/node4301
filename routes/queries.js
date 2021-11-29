const express = require('express');
const path = require('path');
const query = require('../util/query.js')

const router = express.Router();

router.get('/queryone', (req, res, next) => {
    res.render('queryone.ejs', {pagetitle: "Flix - Query One", data: 0, year: 0}); 
});

router.post('/queryone', async (req, res, next) => {
    
    const input_year = req.body.year;
    const desc = req.body.descending;
    const asc = req.body.ascending;
    let statement;

    if(asc == "on" && desc === undefined){
        statement = `SELECT GenreType, COUNT(GenreType) as Total FROM (SELECT GenreType FROM Movie JOIN Genre on Movie.ID = Genre.MovieID WHERE Year = ${input_year}) GROUP BY GenreType ORDER BY Total ASC`;
    }
    else if(desc == "on" && asc === undefined){
        statement = `SELECT GenreType, COUNT(GenreType) as Total FROM (SELECT GenreType FROM Movie JOIN Genre on Movie.ID = Genre.MovieID WHERE Year = ${input_year}) GROUP BY GenreType ORDER BY Total DESC`;
    }
    else{
        statement = `SELECT GenreType, COUNT(GenreType) FROM (SELECT GenreType FROM Movie JOIN Genre on Movie.ID = Genre.MovieID WHERE Year = ${input_year}) GROUP BY GenreType`;
    }
    const result = await query(statement);

    res.render('queryone.ejs', {pagetitle: "Flix - Query One", year: input_year, data: result, first_query: true}); 
});

router.post('/queryonep2', async (req, res, next) => {
    
    const from_year = req.body.fromyear;
    const to_year = req.body.toyear;
    const genres = req.body.genres;
    
    let years = [];    

    let final_genres = [];

    let where_clause = ``;

    for(let i=0; i < genres.length; i++){

        final_genres.push(genres[i]);
        
        if(i == 5 | i == (genres.length-1)){
            where_clause += `GenreType = '${genres[i]}'`;
            break;            
        }
        else{
            where_clause += `GenreType = '${genres[i]}' OR `;
        }        
    }
    
    let statement = ``;

    for(let i=from_year; i <= to_year; i++){

        years.push(i);
        
        if(i == to_year){            
            statement += `SELECT Year, GenreType, COUNT(GenreType)/(SELECT COUNT(GenreType) FROM Genre JOIN Movie ON Genre.MovieID = Movie.ID WHERE Year = ${i})*100 AS Total 
            FROM Genre JOIN Movie on Movie.ID = Genre.MovieID WHERE Year = ${i}
            GROUP BY GenreType, Year`;
        }
        else{            
            statement += `SELECT Year, GenreType, COUNT(GenreType)/(SELECT COUNT(GenreType) FROM Genre JOIN Movie ON Genre.MovieID = Movie.ID WHERE Year = ${i})*100 AS Total 
                FROM Genre JOIN Movie on Movie.ID = Genre.MovieID WHERE Year = ${i} 
                GROUP BY GenreType, Year`;
            statement += ` UNION `;
        }   
    }
    
    statement = `SELECT Year, GenreType, Total FROM(` + statement + `) WHERE ${where_clause} ORDER BY GenreType ASC, YEAR ASC`;
    
    for(let i= 0; i < years.length; i++){
        years[i] = years[i].toString();
    }
    const result = await query(statement);    

    res.render('queryone.ejs', {pagetitle: "Flix - Query One", years: years, data: result, genres: final_genres, second_query: true}); 
});

router.get('/querytwo', async (req, res, next) => {
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