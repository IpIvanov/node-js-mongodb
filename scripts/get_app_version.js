const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');

const MongoClient = require('mongodb').MongoClient;
const mongoURL =
    'mongodb://herokuUser:user332211@ds117965.mlab.com:17965/heroku_jj0khzm2';

MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    db.collection('app-version').remove();
    db.createCollection('app-version');
    db.close();
});

let url =
    'https://play.google.com/store/apps/details?id=com.ipivanov.altairshoroscopes';

scraper(url).then(
    function(info) {
        let appVersion = {
            version: info
        };
        MongoClient.connect(mongoURL, function(err, db) {
            db.collection('app-version').insertOne(appVersion, function(err, res) {
                if (err) throw err;
            });
            db.close();
        });
    },
    function(err) {
        // At least one of request went wrong.
        throw err;
    }
);

function scraper(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(err, resp, body) {
            let $ = cheerio.load(body);
            if (err) {
                reject(err);
            } else {
                let info = $('div.meta-info:nth-child(3) > div:nth-child(2)')
                    .text()
                    .trim();

                resolve(info);
            }
        });
    });
}