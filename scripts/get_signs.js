const request = require('request');
const cheerio = require('cheerio');

const MongoClient = require('mongodb').MongoClient;
const mongoURL =
    'mongodb://herokuUser:user332211@ds117965.mlab.com:17965/heroku_jj0khzm2';

MongoClient.connect(mongoURL, function(err, db) {
    if (err) throw err;
    db.collection('signs').remove();
    db.createCollection('signs');
    db.close();
});

let urls = createURLs();
let pages = [
    ...urls.dailyURLs,
    ...urls.weeklyURLs,
    ...urls.monthlyURLs,
    ...urls.yearlyURLs
];
let scrapers = pages.map(scraper);

Promise.all(scrapers).then(
    function(info) {
        const signs = [
            'Aries',
            'Taurus',
            'Gemini',
            'Cancer',
            'Leo',
            'Virgo',
            'Libra',
            'Scorpio',
            'Sagittarius',
            'Capricorn',
            'Aquarius',
            'Pisces'
        ];
        MongoClient.connect(mongoURL, function(err, db) {
            for (let index = 0; index < pages.length; index++) {
                if (index === 48) {
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
                    let signsIndex = index - 12;

                    db
                        .collection('signs')
                        .update({ name: signs[signsIndex] }, { $set: { week: info[index] } });
                } else if (index > 23 && index <= 35) {
                    let signsIndex = index - 24;

                    db
                        .collection('signs')
                        .update({ name: signs[signsIndex] }, { $set: { month: info[index] } });
                } else {
                    let signsIndex = index - 36;

                    db
                        .collection('signs')
                        .update({ name: signs[signsIndex] }, { $set: { year: info[index] } });
                }
            }
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
                let info = $(
                        '#daily > div > div.col.m12.l9.padding-right-35.padding-right-sm-0 > div.row.margin-bottom-0 > p.margin-top-xs-0'
                    )
                    .text()
                    .trim()
                    .replace(/Ganesha/g, 'Altair');
                resolve(info);
            }
        });
    });
}

function createURLs() {
    let obj = {
        dailyURLs: [],
        weeklyURLs: [],
        monthlyURLs: [],
        yearlyURLs: []
    };
    const signs = [
        'Aries',
        'Taurus',
        'Gemini',
        'Cancer',
        'Leo',
        'Virgo',
        'Libra',
        'Scorpio',
        'Sagittarius',
        'Capricorn',
        'Aquarius',
        'Pisces'
    ];
    signs.forEach(sign => {
        let day =
            'https://www.ganeshaspeaks.com/horoscopes/daily-horoscope/' + sign;
        obj['dailyURLs'].push(day);
        let week =
            'https://www.ganeshaspeaks.com/horoscopes/weekly-horoscope/' + sign;
        obj['weeklyURLs'].push(week);
        let month =
            'https://www.ganeshaspeaks.com/horoscopes/monthly-horoscope/' + sign;
        obj['monthlyURLs'].push(month);
        let year =
            'https://www.ganeshaspeaks.com/horoscopes/yearly-horoscope/' + sign;
        obj['yearlyURLs'].push(year);
    });

    return obj;
}