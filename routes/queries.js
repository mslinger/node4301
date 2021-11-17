const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/queries', (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'queries.html'));    
});

module.exports = router;