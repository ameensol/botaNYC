var async = require('async')
var Phantom = require('phantom')
var EventEmitter = require('events').EventEmitter
var fs = require('fs')

var Scraper = module.exports = function() {
  if (!(this instanceof Scraper)) return new Scraper()
  this.url = "https://a127-jobs.nyc.gov/jobsearch.html?category=ITT"
}

// allows the Scraper to emit events
Scraper.prototype.__proto__ = EventEmitter.prototype

Scraper.prototype.start = function(cb) {
  var self = this

  Phantom.create('--ignore-ssl-errors=yes', '--ssl-protocol=tlsv1', function(ph) {

    ph.createPage(function(page) {

      // handle errors that happen on the page
      page.set('onError', function(msg, trace) {
        console.log('= onError()')
        var msgStack = ['  ERROR: ' + msg]
        if (trace) {
          msgStack.push('  TRACE:')
          trace.forEach(function(t) {
              msgStack.push('    -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''))
          })
        }
        console.log(msgStack.join('\n'))
      })

      page.set('onResourceError', function(resourceError) {
          page.reason = resourceError.errorString;
          page.reason_url = resourceError.url;
      })

      console.log("about to open: " + self.url)

      page.open(self.url, function(status) {
        if (status !== "success") {
          console.log("Error opening url \"" + page.reason_url + "\": " + page.reason);
          return cb(new Error('failed to open url'))
        }
        setTimeout(function() {
          console.log("waiting for page to load: " + self.url)
          wait(function(test) {
            return page.evaluate(function() {
              var logo = document.querySelectorAll('.logo')
              var iframe = document.getElementById('ifrm')
              var table = $(iframe).contents().find('.PSLEVEL1GRIDWBO')
              if (!table || table.length === 0) return false
              return true
            }, test)
          }, function (err) {
            if (err) {
              ph.exit()
              return cb(err)
            }
            console.log("finished loading page: " + self.url)
            page.evaluate(function() {
              var iframe = document.getElementById('ifrm')
              var table = $(iframe).contents().find('.PSLEVEL1GRIDWBO')
              var rows = $(table).find('tr')

              var data = []
              for (var i=1; i<rows.length; i++) {

                var getData = function(row, column) {
                  return $($(row).find('td')[column]).find('span').text()
                }

                rowData = {
                  date: getData(rows[i], 0),
                  title: getData(rows[i], 1),
                  id: getData(rows[i], 2),
                  location: getData(rows[i], 3),
                  agency: getData(rows[i], 4)
                }

                rowData.link = "https://a127-jobs.nyc.gov/?jobPath=psc/nycjobs/EMPLOYEE/HRMS/c/HRS_HRS.HRS_CE.GBL?Page=HRS_CE_JOB_DTL&Action=A&JobOpeningId="+rowData.id+"&SiteId=1&PostingSeq=1"

                data.push(rowData)
              }
              return data
            }, function (data) {
              ph.exit()
              return cb(null, data)
            })
          }.bind(self), 30000)
        }, 1000)
      })
    })
  })
}

// allows the scraper to repeatedly test if the page is loaded
function wait(testFx, onReady, maxWait, start) {
  var self = this
  var start = start || new Date().getTime()
  console.log("loading... " + (new Date().getTime() - start))
  if (new Date().getTime() - start < maxWait) {
    testFx(function(result) {
      if (result) {
        onReady()
      } else {
        setTimeout(function() {
          wait.call(self, testFx, onReady, maxWait, start)
        }, 500)
      }
    })
  } else {
    return onReady(new Error('page timed out'))
  }
}
