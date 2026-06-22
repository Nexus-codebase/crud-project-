const express = require('express');
const app = express();

// Use static server to serve the Express Yourself Website
app.use(express.static('public'));

// Import and mount the expressionsRouter
const expressionsRouter = require('./expressions.js');
app.use('/expressions', expressionsRouter);

// Import and mount the animalsRouter
const animalsRouter = require('./animals.js');
app.use('/animals', animalsRouter);

// export app for use in main.js and for testing
module.exports = { app };
