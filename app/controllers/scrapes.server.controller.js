'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Scrape = mongoose.model('Scrape'),
	_ = require('lodash');

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