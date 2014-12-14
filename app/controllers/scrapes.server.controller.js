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


var nconf = require('nconf')
nconf.file({ file: __dirname + '/../../config.json' });
var file = nconf.get();
var config = file[file.NODE_ENV];

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
	if (exports.scheduledScrape) {
		clearTimeout(exports.scheduledScrape)
	}

	var scrapeAfterWait = function (wait) {
		console.log('scraping after: ' + wait)
		exports.scheduledScrape = setTimeout(function () {
			var scraper = new Scraper()

			scraper.start(function(err, jobs) {
				if (err) return console.log(err)
				// for each job listing, check if a job listing with that id exists in
				// the database. If it does, do nothing. If it doesn't, save it to the
				// database and send out a tweet.

				var newJobs = [];
				async.each(jobs, function(job, done) {
					Job.findOne({ id: job.id}).exec(function(err, doc) {
						if (err) return done(err)
						if (!doc) { // job doesn't exist in database
							doc = new Job(job)
							doc.save()
							newJobs.push(doc)
						}

						console.log(doc)

						if (!doc.tweeted) {
							var T = new Twit({
									consumer_key:        config.twitter.key
								, consumer_secret:     config.twitter.secret
								, access_token:        req.user.providerData.token
								, access_token_secret: req.user.providerData.tokenSecret
							})

							var status = ''
							status += doc.agency.toLowerCase() + ' seeking ' + doc.title.toLowerCase() + '\n\n'
							status += doc.location.toLowerCase() + '\n'
							status += doc.link

							T.post('statuses/update', { status: status },
							function(err, data, response) {
								if (err) return done(err)
								throw 'stop'
								doc.tweeted = true
								doc.save()
								return done(null)
							})
						} else {
							return done(null)
						}
					})

				}, function(err) {
					if (err) throw err // TODO
					var session = new Scrape({ jobs: newJobs })
					session.save()

					scrapeAfterWait(config.wait) // wait for the amount of time set in the config
				})
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
	clearTimeout(exports.scheduledScrape)
	delete exports.scheduledScrape
	return next(null)
}

/**
 * Check Scraper Status
 */
exports.checkStatus = function (req, res) {
	if (exports.scheduledScrape) {
		return res.jsonp(1)
	} else {
		return res.jsonp(0)
	}
}
