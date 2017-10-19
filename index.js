var express = require('express');
var app = express();
var cron = require('node-cron');
var MongoClient = require('mongodb').MongoClient;
var puppeteer = require('puppeteer');
var url = "mongodb://herokuUser:user332211@ds117965.mlab.com:17965/heroku_jj0khzm2";

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
  scrape('https://github.com', 'h1.lh-condensed-ultra').then(res => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      console.log("Database created!");
      console.log(res, '--> Scraped text')

      // var myobj = { name: "Company Inc", address: "Highway 37" };
      // db.collection("customers").insertOne(myobj, function(err, res) {
      //     if (err) throw err;
      //     console.log("1 document inserted");
      //     db.close();
      // });
    });
  });
});

//exceute every 1 min
cron.schedule('*/1 * * * *', function() {
  var shell = require('./child_helper');

  var commandList = [
    "node script1.js",
    "node script2.js"
  ]

  shell.series(commandList, function(err) {
    //    console.log('executed many commands in a row'); 
    console.log('done')
  });
});

async function scrape(url, selector) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1025, height: 768 });
  await page.goto(url);
  //await page.screenshot({ path: 'screenshots/github.png' });
  const scrapedText = await page.evaluate((selector) => {
    return document.body.querySelector(selector).textContent
  }, selector);
  
  browser.close();

  return scrapedText;
}