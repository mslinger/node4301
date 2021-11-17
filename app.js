const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// const db = require('./util/database.js');

const app = express();

const queryRoutes = require('./routes/queries.js');
const homeRoutes = require('./routes/home.js');

app.use(express.urlencoded({ extended: true }))
// app.use(express.static(path.join(__dirname, 'public')));


app.use(queryRoutes);
app.use(homeRoutes);

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(3000);