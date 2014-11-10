'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Scrape Schema
 */
var ScrapeSchema = new Schema({
	jobs: [{
		type: Schema.ObjectId,
		ref: 'Job'
	}],
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Scrape', ScrapeSchema);
