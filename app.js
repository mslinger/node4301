const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const queryRoutes = require('./routes/queries.js');
const homeRoutes = require('./routes/home.js');

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

app.use(queryRoutes);
app.use(homeRoutes);

app.use((req, res, next) => {
    res.status(404).render('404.ejs', {pagetitle: "Page Not Found!!"});
});

app.listen(3000);