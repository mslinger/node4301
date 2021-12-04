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

    let statement = `SELECT GenreType, COUNT(GenreType) as Total FROM (SELECT GenreType FROM Movie JOIN Genre on Movie.ID = Genre.MovieID WHERE Year = ${input_year}) GROUP BY GenreType`;


    if(asc == "on" && desc === undefined){
         statement += ` ORDER BY Total ASC`;
    }
    else if(desc == "on" && asc === undefined){
        statement += ` ORDER BY Total DESC`;
    }
    else{
        statement += ` ORDER BY GenreType ASC`;
    }
    const result = await query(statement);

    res.render('queryone.ejs', {pagetitle: "Flix - Query One", year: input_year, data: result, first_query: true}); 
});

router.post('/queryonep2', async (req, res, next) => {
    
    let from_year = req.body.fromyear;
    let to_year = req.body.toyear;
    const genres = req.body.genres;
    
    if(from_year < 1970){
        from_year = 1970;
    }
    else if(to_year > 2020){
        to_year = 2020;
    }
    else if(to_year == from_year){
        to_year = parseInt(to_year);
        to_year += 1;
    }
    
    let years = [];    

    let final_genres = [];

    let where_clause = ``;

    for(let i=0; i < genres.length; i++){

        final_genres.push(genres[i]);
        
        if(i == 4 || i == (genres.length-1)){
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
            y: {
                min: 0
            }
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

    //fill DataGenres data with zeros [0,0,...,0]
    for(let i= 0; i < data_Genres.length; i++){
        
        for(let j=0; j < years.length; j++){
            data_Genres[i].data.push(0);
        }
    }

    let dataGenres_length = [];

    //Get length of each genre
    for(let j=0; j < data_Genres.length; j++){
        
        let count = 0;
        for(let i=0; i < result.length; i++){

            if(data_Genres[j].label == result[i][1]){
                count += 1;
            }
        }
        if(count > 0){
            dataGenres_length.push(count);
        }
    }
    
    let index_jump = 0;
    for(let i=0; i < final_genres.length; i++){
            
        multiple = index_jump;        
        for(let j=0; j < dataGenres_length[i]; j++){

            //Gets year, subtracts base year to set index for data
            //e.g., 1991-1970 = 21
            result_genre_year = parseInt(result[(i*multiple)+j][0]);
            target_index = result_genre_year - from_year;
            data_Genres[i].data[target_index] = result[(i*multiple)+j][2];     
        }
        index_jump = dataGenres_length[i];
    }   
        
    for(let i=0; i < final_genres.length; i++){
        genreData.datasets.push(data_Genres[i]);
    }

    res.render('queryone.ejs', {pagetitle: "Flix - Query One", chartOptions: chartOptions, data: genreData, second_query: true}); 
});

router.get('/querytwo', async (req, res, next) => {
    res.render('querytwo.ejs', {pagetitle: "Flix - Query Two"}); 
});

router.post('/querytwo', async (req, res, next) => {

    const input_year = req.body.year;

    let statement = ``;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for(let i=0; i < 12; i++){
        
        statement += `SELECT Month, SUM(Earnings) AS "Month Earnings" FROM (SELECT SUBSTR(Released, 4, 3) AS Month, Earnings, Year FROM Movie JOIN BoxOffice ON Movie.ID = BoxOffice.MovieID
                WHERE Released LIKE '%${months[i]}%' AND Year = ${input_year}) GROUP BY Month, Year`;

        if(i != months.length-1){
            statement += ` UNION `;
        }        
    }

    const result = await query(statement);    

    // let monthslabels = [];       

    let monthlyData = {
        data: [],
        backgroundColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(38, 166, 154, 1)', 'rgba(142, 36, 170, 1)', 'rgba(46, 42, 93, 1)', 'rgba(2,55,136,1)', 'rgba(255,108,17,1)', 'rgba(45,226,230,1)', 'rgba(93, 164, 166,1)','rgba(140,30,255,1)', 'rgba(19,71,125,1)', 'rgba(243,206,117,1)'],
        hoverOffset: 5
    }

    for(let i=0; i < 12; i++){

        for(let j=0; j < 12; j++){
            if(result[j][0] == months[i]){
                monthlyData.data.push(result[j][1]);
            }
        }        
    }    

    let pieData = {
        labels:months,
        datasets: [monthlyData],
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
                text: `Total Movie Earnings Per Month From ${input_year}`
            }
        },
        responsive: false,
    }; 
    
    
    res.render('querytwo.ejs', {pagetitle: "Flix - Query Two", data: pieData, chartOptions: chartOptions, first_query: true}); 
});

router.get('/querythree', (req, res, next) => {
    res.render('querythree.ejs', {pagetitle: "Flix - Query Three"}); 
});

router.post('/querythree', async (req, res, next) => {

    let from_year = req.body.fromyear;
    let to_year = req.body.toyear;    

    let statement = `SELECT FullName, SUM(Oscars) FROM (
        SELECT FullName, Oscars, Year FROM Movie JOIN Actor ON Movie.ID = Actor.MovieID JOIN Awards ON Movie.ID = Awards.MovieID WHERE Oscars IS NOT NULL)
        WHERE Year BETWEEN ${from_year} AND ${to_year}
        GROUP BY FullName, Oscars
        ORDER BY OSCARS DESC`;

    
    statement = `SELECT * FROM (` + statement + `) WHERE ROWNUM < 11`;

    const result = await query(statement);   

    let chartOptions = {
        indexAxis: 'y',
        elements: {
            bar: {
              borderWidth: 2,
            }
        },
        scales: {
            y:{
                beginAtZero: true,                
            }
        },        
        plugins: {
            legend: {
              position: 'top',
            },
            title: {
                display: true,
                text: `Actors That Worked on Most Awarded Oscar Films from ${from_year} to ${to_year}`,
                font: {
                    size: 22
                }
            }
        },
        responsive: true,        
    };

    let ActorData = {
        labels: [],
        datasets: []
    };
    
    let data = {        
        label: "Number of Oscars",
        data: [],
        borderColor: ['rgba(142, 36, 170, 1)'], 
        backgroundColor: ['rgba(38, 166, 154, .65)']              
    };

    for(let i=0; i < result.length; i++ ){        
        ActorData.labels.push(result[i][0]);
        data.data.push(result[i][1]);
    }

    ActorData.datasets.push(data);

    res.render('querythree.ejs', {pagetitle: "Flix - Query Three", first_query: true, data: ActorData, chartOptions: chartOptions}); 
});

router.post('/querythreep2', async (req, res, next) => {

    let from_year = req.body.fromyear;
    let to_year = req.body.toyear;    

    let statement = `SELECT FullName, SUM(Oscars) FROM (
        SELECT FullName, Oscars, Year FROM Movie JOIN Director ON Movie.ID = Director.MovieID JOIN Awards ON Movie.ID = Awards.MovieID WHERE Oscars IS NOT NULL)
        WHERE Year BETWEEN ${from_year} AND ${to_year}
        GROUP BY FullName, Oscars
        ORDER BY OSCARS DESC`;

    
    statement = `SELECT * FROM (` + statement + `) WHERE ROWNUM < 11`;

    const result = await query(statement);   

    let chartOptions = {
        indexAxis: 'y',
        elements: {
            bar: {
              borderWidth: 1,
            }
        },
        scales: {
            y:{
                beginAtZero: true,                
            }
        },        
        plugins: {
            legend: {
              position: 'top',
            },
            title: {
                display: true,
                text: `Directors That Worked on Most Awarded Oscar Films from ${from_year} to ${to_year}`,
                font: {
                    size: 22
                }
            }
        },
        responsive: true,        
    };

    let DirectorData = {
        labels: [],
        datasets: []
    };
    
    let data = {        
        label: "Number of Oscars",
        data: [],
        borderColor: ['rgba(142, 36, 170, 1)'], 
        backgroundColor: ['rgba(38, 166, 154, .65)']              
    };

    for(let i=0; i < result.length; i++ ){        
        DirectorData.labels.push(result[i][0]);
        data.data.push(result[i][1]);
    }

    DirectorData.datasets.push(data);

    res.render('querythree.ejs', {pagetitle: "Flix - Query Three", second_query: true, data: DirectorData, chartOptions: chartOptions}); 
});

router.get('/queryfour', (req, res, next) => {
    res.render('queryfour.ejs', {pagetitle: "Flix - Query Four"}); 
});

router.get('/queryfive', (req, res, next) => {
    res.render('queryfive.ejs', {pagetitle: "Flix - Query Five"}); 
});

module.exports = router;