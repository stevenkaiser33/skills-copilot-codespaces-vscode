// Create web server that can respond to requests for comments

// Load modules
var http = require('http');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');

// Load the data file
var comments = require('./comments.json');

// Create the server
http.createServer(function (request, response) {
    // Get the URL
    var urlObj = url.parse(request.url);
    var path = urlObj.pathname;

    // Check for the path
    switch (path) {
        case '/':
            // Handle the home page
            fs.readFile('./public/home.html', 'utf8', function (error, contents) {
                if (error) {
                    // Send a 500 error
                    response.writeHead(500, { 'Content-Type': 'text/plain' });
                    response.end('Server error');
                } else {
                    // Send the contents
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(contents);
                }
            });
            break;
        case '/comments':
            // Handle the comments page
            if (request.method == 'GET') {
                // Handle a GET request
                var commentString = JSON.stringify(comments);
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(commentString);
            } else if (request.method == 'POST') {
                // Handle a POST request
                // Read the data
                var postData = '';
                request.on('data', function (chunk) {
                    postData += chunk;
                });
                request.on('end', function () {
                    // Parse the data
                    var postDataObject = querystring.parse(postData);
                    // Add the data to the comments object
                    comments.push(postDataObject);
                    // Write the comments object to the file
                    fs.writeFile('./comments.json', JSON.stringify(comments), function (error) {
                        if (error) {
                            // Send a 500 error
                            response.writeHead(500, { 'Content-Type': 'text/plain' });
                            response.end('Server error');
                        } else {
                            // Send a 200 response
                            response.writeHead(200, { 'Content-Type': 'application/json' });
                            response.end(JSON.stringify(comments));
                        }
                    });
                });
            } else {
                // Send a 405 error
                response.writeHead(405, { 'Content-Type': 'text/plain' });