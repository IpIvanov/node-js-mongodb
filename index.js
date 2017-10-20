const scrape = require('./scripts/scrape');
const express = require('express');
const app = express();
const cron = require('node-cron');

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://herokuUser:user332211@ds117965.mlab.com:17965/heroku_jj0khzm2";

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
      console.log(res, '--> Scraped text from https://github.com')

      // const myobj = { name: "Company Inc", address: "Highway 37" };
      // db.collection("customers").insertOne(myobj, function(err, res) {
      //     if (err) throw err;
      //     console.log("1 document inserted");
      //     db.close();
      // });
    });
  });
  scrape('https://www.npmjs.com/', '.title.em-default.type-neutral-11').then(res => {
    console.log(res.trim(), '--> Scraped text from https://www.npmjs.com/')
  });
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