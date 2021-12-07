const express = require('express');
const path = require('path');
const query = require('../util/query.js')

const router = express.Router();

router.get('/queryone', (req, res, next) => {
    res.render('queryone.ejs', {pagetitle: "Flix - Genres", data: 0, year: 0}); 
});

//Genre per year
router.post('/queryone', async (req, res, next) => {
    
    let input_year = req.body.year;
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

    let data_labels = [];
    let data_values = [];

    for(let i=0; i < result.length; i++){

        if(result[i][0] != null){
            data_labels.push(result[i][0]);
            data_values.push(result[i][1]);
        }
    }

    let genreData = {
        labels: data_labels,
        datasets: [{
            label: 'Number of Movies',
            data: data_values,
            backgroundColor: [
                'rgba(54, 162, 235, 0.65)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };

    let chartOptions = {
        options: {
            scales: {
                y:{
                    beginAtZero: true
                }
            },
            responsive: true
        },
        plugins: {
            title: {
                display: true,
                font: {
                    size: 22
                },
                text: `Number of Movies By Genre Type From ${input_year}`,
            }
        }
    };

    res.render('queryone.ejs', {pagetitle: "Flix - Genres", data: genreData, chartOptions: chartOptions, first_query: true}); 
});

//Genre percentage over years
router.post('/queryonep2', async (req, res, next) => {
    
    let from_year = req.body.fromyear;
    let to_year = req.body.toyear;
    let genres = req.body.genres;
        
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

    if(from_year > to_year){
        let temp = from_year;
        to_year = from_year;
        from_year = temp;
    }

    if(genres === undefined){
        genres = ["Drama"];
    }
    
    let years = [];    

    let final_genres = [];

    let where_clause = ``;

    //if only one genre
    if(typeof genres == "string"){
        let tempStr = genres;
        genres = [];
        genres.push(tempStr);
    }

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
                min: 0,
                title: {
                    display: true,
                    text: "Percentage of Total Movies"
                }
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

    res.render('queryone.ejs', {pagetitle: "Flix - Genres", chartOptions: chartOptions, data: genreData, second_query: true}); 
});

router.get('/querytwo', async (req, res, next) => {
    res.render('querytwo.ejs', {pagetitle: "Flix - Earnings"}); 
});

//Earnings per month
router.post('/querytwo', async (req, res, next) => {

    const input_year = req.body.year;

    let statement = ``;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];    
        
    statement += `SELECT Month, SUM(Earnings) AS "Month Earnings" FROM (SELECT SUBSTR(Released, 4, 3) AS Month, Earnings, Year FROM Movie JOIN BoxOffice ON Movie.ID = BoxOffice.MovieID)
        WHERE Year = ${input_year} AND Month IS NOT NULL GROUP BY Month`;    

    const result = await query(statement);        

    let monthlyData = {
        data: [],
        backgroundColor: ['rgba(54, 81, 235,1)','rgba(54, 81, 200,1)','rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(38, 166, 154, 1)', 'rgba(142, 36, 170, 1)', 'rgba(46, 42, 93, 1)', 'rgba(2,55,136,1)', 'rgba(255,108,17,1)', 'rgba(45,226,230,1)', 'rgba(93, 164, 166,1)','rgba(140,30,255,1)'],
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
    
    
    res.render('querytwo.ejs', {pagetitle: "Flix - Earnings", data: pieData, chartOptions: chartOptions, first_query: true}); 
});

router.get('/querythree', (req, res, next) => {
    res.render('querythree.ejs', {pagetitle: "Flix - Oscars"}); 
});

//Actors, Oscars
router.post('/querythree', async (req, res, next) => {

    let from_year = req.body.fromyear;
    let to_year = req.body.toyear;    

    let statement = `SELECT FullName, SUM(Oscars) FROM (
        SELECT FullName, Oscars, Year FROM Movie JOIN Actor ON Movie.ID = Actor.MovieID JOIN Awards ON Movie.ID = Awards.MovieID WHERE Oscars > 0)
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
                text: `Actors That Worked on Most Awarded Oscar Movies from ${from_year} to ${to_year}`,
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
        ActorData.labels.push(result[i][0].replace("'", " "));
        data.data.push(result[i][1]);
    }

    ActorData.datasets.push(data);

    res.render('querythree.ejs', {pagetitle: "Flix - Oscars", first_query: true, data: ActorData, chartOptions: chartOptions}); 
});

//Directors, Oscars
router.post('/querythreep2', async (req, res, next) => {

    let from_year = req.body.fromyear;
    let to_year = req.body.toyear;    

    let statement = `SELECT FullName, SUM(Oscars) FROM (
        SELECT FullName, Oscars, Year FROM Movie JOIN Director ON Movie.ID = Director.MovieID JOIN Awards ON Movie.ID = Awards.MovieID WHERE Oscars > 0)
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
                text: `Directors That Worked on Most Awarded Oscar Movies from ${from_year} to ${to_year}`,
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
        DirectorData.labels.push(result[i][0].replace("'", " "));
        data.data.push(result[i][1]);
    }

    DirectorData.datasets.push(data);

    res.render('querythree.ejs', {pagetitle: "Flix - Oscars", second_query: true, data: DirectorData, chartOptions: chartOptions}); 
});

//Ratings, Oscars
router.post('/querythreep3', async (req, res, next) => {

    let from_year = req.body.fromyear;
    let to_year = req.body.toyear;
 
    let statement = `SELECT Year, CAST(AVG(MetaScore) AS decimal(5,2)), CAST(AVG(RottenTomatoes) AS decimal(5,2)), CAST(AVG(ImdbAvg)*10 AS decimal(5,2)) 
    FROM (SELECT * FROM CriticRatings JOIN (SELECT MovieID as ID, Year, ImdbAvg FROM Movie JOIN Awards ON Movie.ID = Awards.MovieID WHERE Oscars > 0) ON CriticRatings.MovieID = ID)
    GROUP BY Year ORDER BY YEAR ASC`
    
    statement = `SELECT * FROM (` + statement + `) WHERE Year BETWEEN ${from_year} AND ${to_year}`;

    const result = await query(statement);    

    let chartOptions = {
        options: {
            scales: {
                y:{
                    beginAtZero: true
                }
            },
            responsive: true
        },
        plugins: {
            title: {
                display: true,
                font: {
                    size: 22
                },
                text: `Average Consumer and Critic Ratings of Oscar Awarded Films from ${from_year} to ${to_year}`,
            }
        }
    };

    let RatingsData = {
        labels: [],
        datasets: []
    };
    
    let RottenTomatoes = {
        label: "RottenTomaotes",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 1)'
    };    
    
    let MetaScore = {
        label:"MetaScore",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 1)'
    };
    
    let ImdbAvg = {
        label:"Imdb",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(38, 166, 154, 1)',
        backgroundColor: 'rgba(38, 166, 154, 1)'
    };

    //load years into labels
    for(let i=from_year; i <= to_year; i++){
        RatingsData.labels.push(i);        
    }

    //load data into respect objects
    for(let i=0; i < result.length; i++){
        RottenTomatoes.data.push(result[i][2]);
        MetaScore.data.push(result[i][1]);
        ImdbAvg.data.push(result[i][3]);
    }

    RatingsData.datasets = [MetaScore, RottenTomatoes, ImdbAvg];
    

    res.render('querythree.ejs', {pagetitle: "Flix - Oscars", third_query: true, data: RatingsData, chartOptions: chartOptions}); 
});

router.get('/queryfour', (req, res, next) => {
    res.render('queryfour.ejs', {pagetitle: "Flix - Runtime"}); 
});

//Runtime per month
router.post('/queryfour', async (req, res, next) => {

    let user_years = req.body.years;    

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let years = [];

    //if only one year
    if(typeof user_years == "string"){
        let tempInt = parseInt(user_years);
        user_years = [];
        user_years.push(tempInt);
    }
    
    for(let i=0; i < user_years.length; i++){
        
        years.push(user_years[i]);
        
        if(i == 3 || i == (user_years.length-1)){
            break;          
        }                
    }

    let statement = ``;

    for(let i=0; i < years.length; i++){

        statement += `SELECT Month, Year, CAST(AVG(Runtime) as decimal(5,2)) FROM (
        SELECT Runtime, substr(released, 4, 3) as Month, Year FROM Movie)
        WHERE Month IS NOT NULL AND Year = ${years[i]}
        GROUP BY Month, Year`;

        if(i != years.length-1){
            statement += ` UNION `;
        }
        else{
            statement += ` ORDER BY Year`;
        }

    }

    const result = await query(statement);

    let year_label = "";

    for(let i=0; i < years.length; i++){
        year_label += `${years[i]}` ;

        if(i != years.length-1){
            year_label += ", "
        }
    }
    
    let dataYear1 = {
        label: "",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(54, 162, 235, .85)',
        borderWidth: 1,        
    };    
    
    let dataYear2 = {
        label:"",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rbga(193, 30, 222, 1)',
        backgroundColor: 'rgba(38, 166, 154, .85)',
        borderWidth: 1,
    };
    
    let dataYear3 = {
        label:"",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(99, 164, 255,1)',
        backgroundColor: 'rgba(255, 99, 132, .85)',
        borderWidth: 1,
    };

    let dataYear4 = {
        label:"",
        data: [],
        lineTension: 0,
        fill: false,
        borderColor: 'rgba(95, 31, 222, 1)',
        backgroundColor: 'rgba(190, 31, 222, .85)',
        borderWidth: 1,
    };

    let runtimeData = {
        labels: months,
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
                min: 0,
                title: {
                    display: true,
                    text: "Runtime in Minutes"
                },
            }
        },
        plugins: {
            title: {
                display: true,
                font: {
                    size: 22
                },
                text: `Average Runtime of Movies Per Month from ${year_label}`
            }
        }
    };

    for(let i=0; i < years.length; i++){
        
        if(dataYear1.label == ""){
            dataYear1.label = years[i].toString();
        }
        else if(dataYear2.label == ""){
            dataYear2.label = years[i].toString();
        }
        else if(dataYear3.label == ""){
            dataYear3.label = years[i].toString();
        }
        else if(dataYear4.label == ""){
            dataYear4.label = years[i].toString();
        }
    }

    let yearData = [dataYear1, dataYear2, dataYear3, dataYear4];

    for(let i=0; i < yearData.length; i++){

        for(let j=0; j < months.length; j++){
            
            for(let k=0; k < result.length; k++){

                if(yearData[i].label == result[k][1] && result[k][0] == months[j]){
                    yearData[i].data.push(result[k][2]);
                }
            }
        }
    }

    for(let i=0; i < years.length; i++){
        runtimeData.datasets.push(yearData[i]);
    }
    
    res.render('queryfour.ejs', {pagetitle: "Flix - Runtime", chartOptions: chartOptions, data: runtimeData, first_query: true}); 
});

router.get('/queryfive', (req, res, next) => {
    res.render('queryfive.ejs', {pagetitle: "Flix - Ratings"}); 
});

//Histogram per year from RT, IMDb, or Meta
router.post('/queryfive', async (req, res, next) => {
    
    let input_year = req.body.year;
    const imdb = req.body.imdb;
    const rotten = req.body.rotten;
    const meta = req.body.meta;   

    let statement = ``;
    let source = ``;
    let source_title = '';

    if(rotten == "on" && imdb === undefined && meta === undefined){
         source = `RottenTomatoes`;
         source_title = "Rotten Tomatoes";
    }
    else if(meta == "on" && imdb === undefined && rotten === undefined){
        source = `MetaScore`;
        source_title = "MetaScore";
    }
    else if(imdb == "on" && meta === undefined && rotten === undefined){
        source = `imdbavg`;
        source_title = "IMDb";
    }
    else{
        source = `imdbavg`;
        source_title = "IMDb";
    }

    let ranges = [0,10,20,30,40,50,60,70,80,90,100];

    for(let i=0; i < ranges.length-1;i++){            

        if(i == ranges.length-2){
           statement += `SELECT COUNT(${source}) FROM (SELECT imdbavg*10 AS imdbavg, RottenTomatoes, MetaScore, Year FROM Movie JOIN CriticRatings ON Movie.ID = CriticRatings.MovieID)
           WHERE Year = ${input_year} and ${source} >= ${ranges[i]} and ${source} <= ${ranges[i+1]}`;
        }
        else{
            statement += `SELECT COUNT(${source}) FROM (SELECT imdbavg*10 AS imdbavg, RottenTomatoes, MetaScore, Year FROM Movie JOIN CriticRatings ON Movie.ID = CriticRatings.MovieID)
           WHERE Year = ${input_year} and ${source} >= ${ranges[i]} and ${source} < ${ranges[i+1]}`;
        }

        if(i != ranges.length-2){
            statement += ` UNION ALL `;
        }
    }  

    const result = await query(statement);   
    
    let data_values = [];
    let data_labels = ["0-10","10-20","20-30","30-40","40-50","50-60","60-70","70-80","80-90","90-100"];

    for(let i=0; i < result.length; i++){        
        data_values.push(result[i][0]);
    }

    let RatingData = {
        labels: data_labels,
        datasets: [{
            label: 'Number of Ratings',
            data: data_values,
            backgroundColor: [
                'rgba(38, 166, 154, .65)'                
            ],
            borderColor: [                
                'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1,
            barPercentage: 1,
            categoryPercentage: 1,
        }]
    };

    let chartOptions = {
        scales: {
            y:{
                beginAtZero: true,
                title:{
                    display: true,
                    text: "Number of Total Ratings",
                }                    
            }            
        },        
        plugins: {
            title: {
                display: true,
                font: {
                    size: 22
                },
                text: `Histogram of Ratings From ${source_title} for ${input_year} Movies`,
            }
        }
    };

    res.render('queryfive.ejs', {pagetitle: "Flix - Ratings", data: RatingData, chartOptions: chartOptions, first_query: true}); 
});

module.exports = router;