var Scraper = require('./scrape')
var async = require('async')
var fs = require('fs')
var server = require('./server') // starts the webserver

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

      var oldJobs = JSON.parse(fs.readFileSync('jobs.json'))

      var newJobs = jobs.filter(function (job) {
        var matching = oldJobs.filter(function (oldJob) {
          return oldJob.id == job.id
        })
        return matching.length === 0
      })

      newJobs = newJobs.map(function (job) {
        job.created = new Date().getTime()
        return job
      })

      console.log('There are ' + newJobs.length + ' new jobs')
      var allJobs = oldJobs.concat(newJobs)
      fs.writeFileSync('jobs.json', JSON.stringify(allJobs))
      console.log('Saved Jobs')

      scrape(6*60*60*1000)

    })
  }, wait)
}

scrape(0) // don't wait before the first scrape
