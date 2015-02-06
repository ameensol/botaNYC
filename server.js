var fs = require('fs')
var http = require('http')
var exec = require('child_process').exec
var cap = require('title-capitalization')

console.log('Starting webserver')
http.createServer(function (req, res) {

  var data = JSON.parse(fs.readFileSync('data.json'))
  var lastScrape = data.lastScrape
  var jobs = data.jobs

  var now = new Date().getTime()
  if (!lastScrape || lastScrape - now > 6*60*60*1000) {
    lastScrape = now
    console.log('executing scraper process')
    fs.writeFileSync('data.json', JSON.stringify(data))
    var child = exec('node index.js', function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    })
  }

  var xml = '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
  xml += '\t<channel>\n'
  xml += '\t<title>NYC Civic Tech Jobs</title>\n'
  xml += '\t<description>An RSS feed of jobs!</description>\n'
  xml += '\t<link>https://enigmatic-beach-3406.herokuapp.com</link>\n'
  xml += '\t<atom:link href="https://enigmatic-beach-3406.herokuapp.com" rel="self" type="application/rss+xml" />'

  // If there are no jobs, output nothing
  if (jobs && jobs.length > 0) {
    // sort by time of creation (newest first)
    jobs = jobs.sort(function (a, b) {
      return b.created - a.created
    })

    // take the most recent 20
    jobs = jobs.splice(0, 20)


    jobs.forEach(function (job) {

      // Proper Capitalization
      job.title = cap(job.title.toLowerCase())
      job.location = cap(job.location.toLowerCase())
      job.agency = cap(job.agency.toLowerCase())

      xml += '\t\t<item>\n'
      xml += '\t\t\t<title>'+job.title+'</title>\n'
      xml += '\t\t\t<description><![CDATA['+
        job.title+' in '+job.location+' for '+job.agency
      +']]></description>\n'
      xml += '\t\t\t<link><![CDATA['+job.link+']]></link>\n'
      xml += '\t\t\t<guid isPermaLink="false">'+job.id+'</guid>\n'
      xml += '\t\t</item>\n'
    })
  }

  xml += '\t</channel>'
  xml += '</rss>'

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(xml);
}).listen(process.env.PORT || 3000);
