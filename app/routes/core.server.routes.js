'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core');
	var jobs = require('../../app/controllers/jobs');
	app.route('/').get(core.index);
	app.route('/rss').get(jobs.listMW, core.rss);
};
