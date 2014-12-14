'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var scrapes = require('../../app/controllers/scrapes');

	// Scrapes Routes
	app.route('/scrapes')
		.get(scrapes.list)
		.post(users.requiresLogin, scrapes.create);

	app.route('/scrapes/:scrapeId')
		.get(scrapes.read)
		.put(users.requiresLogin, scrapes.hasAuthorization, scrapes.update)
		.delete(users.requiresLogin, scrapes.hasAuthorization, scrapes.delete);

	app.route('/scraper')
		.get(scrapes.checkStatus)
		.post(scrapes.activate)
		.delete(scrapes.deactivate)

	// Finish by binding the Scrape middleware
	app.param('scrapeId', scrapes.scrapeByID);
};
