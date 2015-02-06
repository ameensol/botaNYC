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

  var data = JSON.parse(fs.readFileSync('data.json'))
  var oldJobs = data.jobs

  var newJobs = jobs.filter(function (job) {
    if (!oldJobs || !oldJobs.length) return true
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

  data.jobs = oldJobs.concat(newJobs)
  fs.writeFileSync('data.json', JSON.stringify(data))
  console.log('Saved new Jobs')
})
