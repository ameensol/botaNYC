var fs = require('fs')
var http = require('http')

console.log('Starting webserver')
http.createServer(function (req, res) {

  var jobs = JSON.parse(fs.readFileSync('jobs.json'))

  var jobs = jobs.sort(function (a, b) {
    return b.created - a.created
  })

  var xml = '<rss version="2.0">\n'
  xml += '\t<channel>\n'
  xml += '\t<title>NYC Civic Tech Jobs</title>\n'
  xml += '\t<description>An RSS feed of jobs!</description>\n'
  xml += '\t<link>http://google.com</link>\n'

  jobs.forEach(function (job) {
    xml += '\t\t<item>\n'
    xml += '\t\t\t<title>'+job.title+'</title>\n'
    xml += '\t\t\t<description><![CDATA['+
      job.title+' in '+job.location+' for '+job.agency
    +']]></description>\n'
    xml += '\t\t\t<link><![CDATA['+job.link+']]></link>\n'
    xml += '\t\t\t<guid>'+job.id+'</guid>\n'
    xml += '\t\t</item>\n'
  })

  xml += '\t</channel>'
  xml += '</rss>'

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(xml);
}).listen(process.env.PORT || 3000);

// module.exports = server
