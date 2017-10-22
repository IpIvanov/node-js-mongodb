const scrape = require('./scripts/scrape');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cron = require('node-cron');
const request = require('request');
const cheerio = require('cheerio');
const router = express.Router();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', router);


const MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb://herokuUser:user332211@ds117965.mlab.com:17965/heroku_jj0khzm2";

// all of our routes will be prefixed with /api

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});

router.get('/signs', function(request, response) {
    MongoClient.connect(mongoURL, function(err, db) {
        if (err) throw err;
        db.collection('signs').find({}).toArray(function(err, result) {
            if (err) throw err;
            response.json(result);
            db.close();
        });
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

cron.schedule('0 4 * * *', function() {
    MongoClient.connect(mongoURL, function(err, db) {
        if (err) throw err;
        db.collection('signs').remove();
        db.createCollection('signs');
        db.close();
    });

    let urls = createURLs();
    let pages = [...urls.dailyURLs, ...urls.weeklyURLs, ...urls.monthlyURLs];
    let scrapers = pages.map(scraper);

    Promise.all(scrapers).then(function(info) {
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        MongoClient.connect(mongoURL, function(err, db) {
            for (let index = 0; index < pages.length; index++) {
                if (pages.length === 33) {
                    //close db if all the signs info is saved to the db
                    db.close();
                    return;
                }
                if (index <= 11) {
                    let obj = {};
                    obj['name'] = signs[index];
                    obj['day'] = info[index];

                    db.collection('signs').insertOne(obj, function(err, res) {
                        if (err) throw err;
                    });
                } else if (index > 11 && index <= 23) {
                    db.collection('signs').find().forEach(function(doc) {
                        db.collection('signs').update({ _id: doc._id }, { $set: { 'week': info[index] } });
                    });
                } else {
                    db.collection('signs').find().forEach(function(doc) {
                        db.collection('signs').update({ _id: doc._id }, { $set: { 'month': info[index] } });
                    });
                }
            }
        });


    }, function(err) {
        // At least one of request went wrong.
        throw err;
    });
});

function scraper(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(err, resp, body) {
            let $ = cheerio.load(body);
            if (err) {
                reject(err);
            } else {
                let info = $('#daily > div > div.col.m12.l9.padding-right-35.padding-right-sm-0 > div.row.margin-bottom-0 > p.margin-top-xs-0').text().trim()
                resolve(info);
            }
        });
    });
}

function createURLs() {
    let obj = {
        dailyURLs: [],
        weeklyURLs: [],
        monthlyURLs: []
    };
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    signs.forEach((sign) => {
        let day = 'https://www.ganeshaspeaks.com/horoscopes/daily-horoscope/' + sign;
        obj['dailyURLs'].push(day);
        let week = 'https://www.ganeshaspeaks.com/horoscopes/weekly-horoscope/' + sign;
        obj['weeklyURLs'].push(week);
        let month = 'https://www.ganeshaspeaks.com/horoscopes/monthly-horoscope/' + sign;
        obj['monthlyURLs'].push(month);
    });

    return obj;
}