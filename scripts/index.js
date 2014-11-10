var Scraper = require('./scrape')
var mongoose = require('mongoose')
var uriUtil = require('mongodb-uri')
var async = require('async')
var fs = require('fs')

var nconf = require('nconf')
nconf.file({ file: __dirname + '/../config.json' });
var file = nconf.get();

var config = file[file.NODE_ENV];

var mongodbUri = config.mongoURI;
var mongooseUri = uriUtil.formatMongoose(mongodbUri);

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };


mongoose.connect(mongooseUri, options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

  // TODO fix mongo schema registration race condition
  var Job = mongoose.model('Job')
  var Session = mongoose.model('Scrape')

  // every hour, check for new job postings
  var scrape = function (wait) {
    setTimeout(function() {
      var scraper = new Scraper()

      scraper.start(function(err, jobs) {
        if (err) throw err
        console.log(jobs)
        // for each job listing, check if a job listing with that id exists in
      // the database. If it does, do nothing. If it doesn't, save it to the
      // database and send out a tweet.

        var newJobs = [];
        async.each(jobs, function(job, done) {
          Job.findOne({ id: job.id}).exec(function(err, doc) {
            if (err) return done(err)
            console.log(doc)
            if (!doc) { // job doesn't exist in database
              var jobDoc = new Job(job)
              jobDoc.save()
              newJobs.push(jobDoc)

              // TODO Tweet out taht a job has been saved
              // TODO set "tweeted" field to true
            }
            return done(null)
          })

        }, function(err) {
          if (err) throw err // TODO
          var session = new Session({ jobs: newJobs })
          session.save()

          scrape(3600000) // wait an hour for each scrape after the first
        })
      })
    }, wait)
  }

  scrape(0) // don't wait before the first scrape
})
