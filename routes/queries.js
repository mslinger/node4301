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
        
        if(i == 5 || i == (genres.length-1)){
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

        statement += `SELECT Year, GenreType, COUNT(GenreType)/(SELECT COUNT(GenreType) FROM Genre JOIN Movie ON Genre.MovieID = Movie.ID WHERE Year = ${i})*100 AS Total 
                FROM Genre JOIN Movie on Movie.ID = Genre.MovieID WHERE Year = ${i} 
                GROUP BY GenreType, Year`;

        if(i != to_year){
            statement += ` UNION `;
        }          
    }
    
    statement = `SELECT Year, GenreType, Total FROM(` + statement + `) WHERE ${where_clause} ORDER BY GenreType ASC, YEAR ASC`;

    const result = await query(statement);
    
    for(let i= 0; i < years.length; i++){
        years[i] = years[i].toString();
    }
    
    let genreData = {
        labels: years,
        datasets: []
    };

    let chartOptions = {
        legend: {
            display: true,
            position: 'top',
            labels: {
                boxWidth: 80,
            }
        },
        scales: {
        },
        plugins: {
            title: {
                display: true,
                font: {
                    size: 22
                },
                text: `Percentage of Movie Genres From ${years[0]} to ${years[years.length-1]}`
            }
        }
    };
    
    let dataGenre1 = {
        label: "",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 1)'
    };    
    
    let dataGenre2 = {
        label:"",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 1)'
    };
    
    let dataGenre3 = {
        label:"",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(38, 166, 154, 1)',
        backgroundColor: 'rgba(38, 166, 154, 1)'
    };
    
    let dataGenre4 = {
        label:"",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(142, 36, 170, 1)',
        backgroundColor: 'rgba(142, 36, 170, 1)'
    };
    
    let dataGenre5 = {
        label:"",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(46, 42, 93, 1)',
        backgroundColor: 'rgba(46, 42, 93, 1)'
    };

    for(const genre of final_genres){

        if(dataGenre1.label == ""){
            dataGenre1.label = genre;
        }
        else if(dataGenre2.label == ""){
            dataGenre2.label = genre;
        }
        else if(dataGenre3.label == ""){
            dataGenre3.label = genre;
        }
        else if(dataGenre4.label == ""){
            dataGenre4.label = genre;
        }
        else if(dataGenre5.label == ""){
            dataGenre5.label = genre;
        }
    }

    let data_Genres = [dataGenre1, dataGenre2, dataGenre3, dataGenre4, dataGenre5];
            
    for(let i=0; i < final_genres.length; i++){
            
        for(let j=0; j < years.length; j++){ 
                
            multiple = years.length;
            data_Genres[i].data.push(result[(i*multiple)+j][2]);
        }
    }   
        
    for(let i=0; i < final_genres.length; i++){
        genreData.datasets.push(data_Genres[i]);
    }

    res.render('queryone.ejs', {pagetitle: "Flix - Query One", chartOptions: chartOptions, data: genreData, second_query: true}); 
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