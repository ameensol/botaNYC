'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Scrape = mongoose.model('Scrape'),
	Job = mongoose.model('Job'),
	_ = require('lodash'),
	forever = require('forever'),
	async = require('async'),
	Scraper = require('../../scripts/scrape'),
	Twit = require('twit');


/**
 * Create a Scrape
 */
exports.create = function(req, res) {
	var scrape = new Scrape(req.body);
	scrape.user = req.user;

	scrape.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(scrape);
		}
	});
};

/**
 * Show the current Scrape
 */
exports.read = function(req, res) {
	res.jsonp(req.scrape);
};

/**
 * Update a Scrape
 */
exports.update = function(req, res) {
	var scrape = req.scrape ;

	scrape = _.extend(scrape , req.body);

	scrape.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(scrape);
		}
	});
};

/**
 * Delete an Scrape
 */
exports.delete = function(req, res) {
	var scrape = req.scrape ;

	scrape.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(scrape);
		}
	});
};

/**
 * List of Scrapes
 */
exports.list = function(req, res) { Scrape.find().sort('-created').populate('user', 'displayName').exec(function(err, scrapes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(scrapes);
		}
	});
};

/**
 * Scrape middleware
 */
exports.scrapeByID = function(req, res, next, id) { Scrape.findById(id).populate('user', 'displayName').exec(function(err, scrape) {
		if (err) return next(err);
		if (! scrape) return next(new Error('Failed to load Scrape ' + id));
		req.scrape = scrape ;
		next();
	});
};

/**
 * Scrape authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.scrape.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

/**
 * Activate Scraper
 * If there is already a scheduled task, cancel it, scrape now, and schedule
 * another
 */
exports.activate = function (req, res, next) {
	if (exports.scheduledScrape && exports.scheduledScrape.id) {
		clearTimeout(exports.scheduledScrape.id)
	}

	var scrapeAfterWait = function (wait) {
		console.log('scraping after: ' + wait)
		exports.scheduledScrape = exports.scheduledScrape || {}
		exports.scheduledScrape.time = new Date().getTime() + wait
		console.log(exports.scheduledScrape.time)
		exports.scheduledScrape.id = setTimeout(function () {

			async.waterfall([
				function initScraper(cb) {
					var scraper = new Scraper()
					scraper.start(function(err, jobs) {
						if (err) return cb(err)
						return cb(null, jobs)
					})
				},
				function findOrCreateJobs(jobs, cb) {
					var newJobs = [];
					async.map(jobs, function(job, done) {
						Job.findOne({ id: job.id}).exec(function(err, doc) {
							if (err) return done(err)
							if (!doc) { // job doesn't exist in database
								doc = new Job(job)
								doc.save()
								newJobs.push(doc)
							}
							return done(null, doc)
						})
					},
					function (err, docs) {
						if (err) return cb(err)
						return cb(null, docs, newJobs)
					})
				},
				function saveSession(jobs, newJobs, cb) {
					var session = new Scrape({ jobs: newJobs })
					session.save()
					return cb(null, jobs)
				},
				function tweetJobs (jobs, cb) {
					var T = new Twit({
							consumer_key:        process.env.twitterKey
						, consumer_secret:     process.env.twitterSecret
						, access_token:        req.user.providerData.token
						, access_token_secret: req.user.providerData.tokenSecret
					})

					async.each(jobs, function (job, done) {
						if (!job.tweeted) {
							var status = ''
							status += job.agency.toLowerCase() + ' seeking ' + job.title.toLowerCase() + '\n\n'
							status += job.location.toLowerCase() + '\n'
							status += job.link

							T.post('statuses/update', { status: status },
							function(err, data, response) {
								if (err && err.code !== 187) { // ignore duplicate status
									return done(err)
								}
								job.tweeted = true
								job.save()
								return done(null)
							})
						} else {
							return done(null)
						}
					}, function (err) {
						if (err) return cb(err)
						return cb(null)
					})
				}
			], function (err) {
				if (err) console.log(err) // fail silently, try again in 1 hour
				return scrapeAfterWait(4*60*60*1000) // wait 4 hours between scrapes
			})
		}, wait)
	}

	scrapeAfterWait(0)
	return next(null)
}

/**
 * Deactivate Scraper
 */
exports.deactivate = function (req, res, next) {
	clearTimeout(exports.scheduledScrape.id)
	delete exports.scheduledScrape
	return next(null)
}

/**
 * Check Scraper Status
 */
exports.checkStatus = function (req, res) {
	if (exports.scheduledScrape) {
		console.log(exports.scheduledScrape)
		return res.jsonp({status: 1, time: exports.scheduledScrape.time})
	} else {
		return res.jsonp({status: 0})
	}
}
