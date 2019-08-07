const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');
const apiRouter = require('./api/api')

const app = express();

const PORT = process.env.port || 5500 ;


app.use(bodyParser.json());
app.use(cors());
app.use(errorHandler());
app.use(morgan('dev'));


app.use('/api', apiRouter);















app.listen(PORT, () => {
    console.log(`Currently listening on port ${PORT}`)
});

module.exports = app;