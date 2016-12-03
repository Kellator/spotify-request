var unirest = require('unirest');
var express = require('express');
var events = require('events');

var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();
    unirest.get('https://api.spotify.com/v1/' + endpoint)
           .qs(args)
           .end(function(response) {
                if (response.ok) {
                    emitter.emit('end', response.body);
                }
                else {
                    emitter.emit('error', response.code);
                }
            });
    return emitter;
};

//when user makes request to /search/:name - make a request to spotify/search endpoint 
var app = express();
var app = express();
app.use(express.static('public'));

app.get('/search/:name', function(req, res) {
    var searchReq = getFromApi('search', {
        q: req.params.name,
        limit: 1,
        type: 'artist',
    });


    searchReq.on('end', function(item) {
        var artist = item.artists.items[0];
        var related = artist.id;
        var relatedSearch = getFromApi('artists/' + related + '/related-artists');
        relatedSearch.on('end', function(data) {
            artist.related = data.artists;
            //write a fx to see how many total (asyn parallel - onReadDir Comp for each fx)
            res.json(artist);
        });
    });
    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });
});
var topTracks = function(artist, callback) {
    console.log(artist);
    var artistTracks = getFromApi('artists/' + artist.id + '/top-tracks');
        artistTracks.on('end', function(data) {
            artist.tracks = data.tracks;
            callback();
        })  
}


app.listen(process.env.PORT || 8080);