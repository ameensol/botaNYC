var Scraper = require('./scrape')
var async = require('async')
var fs = require('fs')

var scraper = new Scraper()

scraper.start(function(err, jobs) {
  if (err) return console.log(err)
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

  console.log('There are ' + newJobs.length + ' new jobs')
  if (!newJobs || newJobs.length === 0) return

  newJobs = newJobs.map(function (job) {
    job.created = new Date().getTime()
    return job
  })

  var allJobs = oldJobs.concat(newJobs)
  fs.writeFileSync('jobs.json', JSON.stringify(allJobs))
  console.log('Saved new Jobs')
})
