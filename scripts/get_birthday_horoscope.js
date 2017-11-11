const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');

const MongoClient = require('mongodb').MongoClient;
const mongoURL =
    'mongodb://herokuUser:user332211@ds117965.mlab.com:17965/heroku_jj0khzm2';

MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    db.collection('birthday-horoscope-today').remove();
    db.createCollection('birthday-horoscope-today');
    db.close();
});

let url = createURL();

scraper(url).then(
    function(info) {
        let burthDayInfo = {
            zodiac: info[0],
            element: info[1],
            planet_influence: info[2],
            career: info[3],
            symbol: info[4],
            celebritiesTitle: info[5],
            celebrities: info[6],
            numberAndCard: info[7]
        };
        MongoClient.connect(mongoURL, function(err, db) {
            db
                .collection('birthday-horoscope-today')
                .insertOne(burthDayInfo, function(err, res) {
                    if (err) throw err;
                    db.close();
                });
        });
    },
    function(err) {
        // At least one of request went wrong.
        throw err;
    }
);

function scraper(url) {
    const request = require('request');

    return new Promise(function(resolve, reject) {
        request(url, function(err, resp, body) {
            let $ = cheerio.load(body);
            if (err) {
                reject(err);
            } else {
                var list = [];
                $(
                        'body > div.page-wrapper > div:nth-child(2) > div:nth-child(1) > div.col-xs-12.content-container > div > section > section'
                    )
                    .find('section > section > p')
                    .each(function(index, element) {
                        list.push(
                            $(element)
                            .text()
                            .replace(/\n/g, ' ')
                            .trim()
                        );
                    });
                resolve(list);
            }
        });
    });
}

function createURL() {
    let todayFormated = moment().format('MMMMDD');
    let url = `https://www.famousbirthdays.com/horoscope/${todayFormated}.html`;

    return url.toLowerCase();
}