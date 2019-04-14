// Import necessary files...
require("dotenv").config();
var keys = require("./keys.js");
var axios = require('axios');
var moment = require('moment');
var Spotify = require('node-spotify-api');
var fs = require("fs");
// Bringing in the gitignored spotify keys from keys.js
var spotify = new Spotify(keys.spotify);

// Switch statement to interpret user input. Each valid command triggers a function.
var command = process.argv[2];
var commandWithSearch = process.argv.slice(2).join(': ');
fs.appendFile('log.txt', '\n' + commandWithSearch, function(err) {
    if (err) {
        console.log(err);
    } 
})
switch (command) {
    case 'concert-this':
        
        concertThis();
        break;

    case 'spotify-this-song':
        spotifyThisSong();
        break;

    case 'movie-this':
        movieThis();
        break;

    case 'do-what-it-says':
        doWhatItSays();
        break;

    default: console.log('Not a valid command.');
}


// Define functions to be called inside the switch statement.
function concertThis(arg) {
    // Store user artist input as arg variable.
    arg = process.argv.slice(3).join(' ');
    console.log('concert data...');

    // Make axios request using the constructed URL to include the user's search term.
    axios
        .get('https://rest.bandsintown.com/artists/' + arg + '/events?app_id=codingbootcamp')
        .then(function (response) {
            // If the artist exists in the system but has no upcoming shows, response.data returns an empty array. If it's empty, log the message below.
            if (response.data.length < 1) {
                console.log('##########################');
                console.log(`Hmmm... Doesn't look like there are any upcoming shows booked for ${arg}.`);
                console.log('');
            }
            // If the artist doesn't exist in the system, response.data returns a 'not found' error.
            if (response.data.includes('Not found')) {
                console.log('##########################');
                console.log(`Sorry, we couldn\'t find any results for ${arg}.`);
                console.log('');
            } else {
                // Iterate through response.data to log info about each show.
                for (i = 0; i < response.data.length; i++) {
                    console.log('##########################');

                    // Event date
                    const date = moment(response.data[i].datetime).format('dddd, MMMM Do YYYY, h:mm a');
                    console.log(`Date: ${date}`);
                    try {
                        // Name of venue
                        console.log(`Venue: ${response.data[i].venue.name}`);
                    } catch (error) {
                        console.error(error);
                    }

                    // Venue location
                    console.log(`City: ${response.data[i].venue.city}, ${response.data[i].venue.region} ${response.data[i].venue.country}`)

                    // Space between entries
                    console.log('');
                }
            }
        })
}

// This function will be called in 2 cases: 
// 1. When the spotifyThis method is run and process.argv[3] is present, we call this function and pass in the search term.
// 2. When the doWhatItSays method is run, we call this function, passing in the releveant info from random.txt. 
function spotifyRequest(search) {

    // Spotify API request...
    spotify
        .search({
            type: 'track',
            query: search
        })
        .then(function (response) {
            // If no results are returned for user's search, print this message.
            if (response.tracks.items.length < 1) {
                console.log('');
                console.log('##########################');
                console.log('');
                console.log(`Sorry, we couldn't find any results for ${search}.`)
                console.log('');
                console.log('##########################');
                console.log('');
                process.exit();
            }

            // Iterate through 'items' object and log info.
            for (i = 0; i < response.tracks.items.length; i++) {
                console.log('');
                console.log('##########################');
                console.log('');

                // Artist name
                console.log(`Artist: ${response.tracks.items[i].album.artists[0].name}`);

                // Song name
                console.log(`Title: ${response.tracks.items[i].name}`);

                // Album name
                console.log(`Album: ${response.tracks.items[i].album.name}`);

                // Preview link
                if (response.tracks.items[i].preview_url === null) {
                    console.log(' - Preview unavailable - ')
                } else {
                    console.log(`Preview: ${response.tracks.items[i].preview_url}`);
                }
                // Spacing between entries
                console.log('');
                console.log('##########################');
                console.log('');
            }
        });
}



// The main purpose of this function is to parse the Spotify search term and call the appropriate method to make request.
function spotifyThisSong(str) {
    // Initialize arg to match the more common use case.
    arg = process.argv[3];
    // If this function was invoked by doWhatItSays, redefine arg to be the passed in term from random.txt
    if (str) {
        arg = str;
        console.log('str path');
        spotifyRequest(arg);
        // If the user runs the spotify-this-song command with a search, we pass in that search while calling spotifyRequest
    } else if (process.argv[3]) {
        console.log('argv path')
        console.log('Spotify song data...');
        spotifyRequest(arg);
    } else {
        // If no search term, default to 'The Sign' by Ace of Base. 
        // Because we have a specifically defined endpoint, we use .request intstead of .search
        console.log('Ace path')
        spotify
            .request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
            .then(function (data) {
                console.log('');
                console.log('##########################');
                console.log('');
                console.log(`Artist: ${data.album.artists[0].name}`);
                console.log(`Title: ${data.name}`);
                console.log(`Album: ${data.album.name}`);
                console.log(`Preview: ${data.preview_url}`);
                console.log('');
                console.log('##########################');
                console.log('');
                process.exit();
            });
    }

}

function movieThis() {
    // If the user entered a movie...
    if (process.argv[3]) {
        var arg = process.argv[3]
        // If no movie is searched, default to Mr. Nobody.
    } else {
        var arg = 'Mr. Nobody';
    }
    console.log('Movie data...');
    // Axios request to OMDB
    axios.get("http://www.omdbapi.com/?t=" + arg + "&y=&plot=short&apikey=trilogy").then(
        function (response) {
            console.log(response.data);
            // If response returns undefined, or if IMDB score is missing display this message. 
            // (Done this way to prevent the unhandled promise messaging that occurs when a mostly empty movie object returns)
            if (response.data.Title === undefined || response.data.Year === undefined || response.data.imdbRating === 'N/A') {
                console.log('');
                console.log('##########################');
                console.log('');
                console.log('Sorry, we don\'t have any record of that movie.')
                console.log('');
                console.log('##########################');
                console.log('');
            } else {
                // Otherwise, print response info.
                console.log('');
                console.log('##########################');
                console.log(`Title: ${response.data.Title}`);
                console.log(`Released in: ${response.data.Year}`);
                console.log(`IMDB Rating: ${response.data.imdbRating}`);
                console.log(`Rotten Tomatoes: ${response.data.Ratings[1].Value}`);
                console.log(`Produced in: ${response.data.Country}`);
                console.log(`Language: ${response.data.Language}`);
                console.log(`Plot Summary: ${response.data.Plot}`);
                console.log(`Starring: ${response.data.Actors}`);
                console.log('##########################');
                console.log('');
            }
        }
    )
};

function doWhatItSays() {
    console.log('Doing what it says...');
    // Read contents of random.txt
    fs.readFile("random.txt", "utf8", function (error, data) {
        // Log any errors...
        if (error) {
            console.log(error);
        }
        console.log(data);
        // Split data string on comma separator
        var dataArr = data.split(',');
        console.log(dataArr[1]);
        // Call the spotifyThisSong function, passing in the song title from random.txt
        spotifyThisSong(dataArr[1]);
    });
}

