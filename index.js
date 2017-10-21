const scrape = require('./scripts/scrape');
const express = require('express');
const app = express();
const cron = require('node-cron');
const request = require('request');
const cheerio = require('cheerio');

const MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb://herokuUser:user332211@ds117965.mlab.com:17965/heroku_jj0khzm2";

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

cron.schedule('* * * * *', function() {
    console.log('running a task every minute');
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    // scrape('https://github.com', 'h1.lh-condensed-ultra').then(res => {
    //   MongoClient.connect(url, function(err, db) {
    //     if (err) throw err;
    //     console.log("Database created!");
    //     console.log(res, '--> Scraped text from https://github.com')

    //     const myobj = { name: "Company Inc", address: "Highway 37" };
    //     db.collection("customers").insertOne(myobj, function(err, res) {
    //         if (err) throw err;
    //         console.log("1 document inserted");
    //         db.close();
    //     });
    //   });
    // });


    let dailyHoroscopes = [];
    for (let i = 0; i < signs.length; i++) {
        let url = 'https://www.ganeshaspeaks.com/horoscopes/daily-horoscope/' + signs[i];
        request(url, function(err, resp, body) {
            if (err) throw err;
            $ = cheerio.load(body);
            let info = $('#daily > div > div.col.m12.l9.padding-right-35.padding-right-sm-0 > div.row.margin-bottom-0 > p.margin-top-xs-0').text().trim()
            let key = signs[i];
            let obj = {};
            obj[key] = info;

            console.log(obj)
                // TODO: scraping goes here!
            MongoClient.connect(mongoURL, function(err, db) {
                if (err) throw err;
                console.log("Database created!");
                db.collection("signs-daily").insertOne(obj, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                    db.close();
                });
            });
        });
    }
});

//exceute every 1 min
// cron.schedule('*/1 * * * *', function() {
//   const shell = require('./scripts/run_multiple_scripts');

//   const commandList = [
//     "node ./scripts/script1.js",
//     "node ./scripts/script2.js"
//   ]

//   shell.series(commandList, function(err) {
//     if (err) throw err;
//     console.log('done')
//   });
// });