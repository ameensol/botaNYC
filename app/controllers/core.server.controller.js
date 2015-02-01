'use strict';

// var RSS = require('rss');
var Feed = require('feed')

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null
	});
};

exports.rss = function (req, res) {
	var feed = new Feed({
		title: 'NYC Tech Jobs',
		link: 'http://example.com/rss.xml',
		description: 'RSS Feed of NYC Tech Jobs'
	})

	req.jobs.forEach(function (job) {
		feed.addItem({
			title: job.title,
			link: job.link,
			description: 'hello',
			guid: job.id
		})
	})

	var xml = feed.render('rss-2.0')
	res.set('Content-Type', 'text/xml');
	res.send(xml)
	/*
	res.render('rss', {
		xml: req.jobs
	});*/
}
