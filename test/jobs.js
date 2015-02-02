var assert = require('assert')
var fs = require('fs')

before('created jobsTest.json', function () {
  fs.writeFileSync('jobsTest.json', '[]')
})

after('destroy jobsTest.json', function () {
  fs.unlinkSync('jobsTest.json')
})

describe('jobs', function () {
  var oldJobs = [{title: 'Old Job', id: '1', created: 1}]
  var jobs = [{title: 'Old Job', id: '1', created: 1},
              {title: 'New Job', id: '2', created: 2}]

  describe('.read', function () {
    it('should read jobsTest.json', function () {
      var data = fs.readFileSync('jobsTest.json')
      assert(data, 'unable to open jobsTest.json')
    })
  })

  describe('.parse', function () {
    it('should parse jobsTest.json', function () {
      var data = JSON.parse(fs.readFileSync('jobsTest.json'))
      assert(data, 'unable to parse jobsTest.json')
    })
  })

  describe('.write', function () {
    it('should write to jobsTest.json', function () {
      fs.writeFileSync('jobsTest.json', JSON.stringify(jobs))
      assert(true)
    })
  })

  describe('get new jobs', function () {
    it('should filter out old jobs', function () {
      var newJobs = jobs.filter(function (job) {
        var matching = oldJobs.filter(function (oldJob) {
          return oldJob.id == job.id
        })
        return matching.length === 0
      })
      assert(newJobs.length === 1 && newJobs[0].id === '2', 'failed to find new jobs')
    })
  })

  describe('sort jobs', function () {
    it('should sort jobs in reverse chronological order', function () {
      jobs = jobs.sort(function (a, b) {
        return b.created - a.created
      })
      assert(jobs[0].created == 2)
    })
  })
})
