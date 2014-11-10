'use strict';

//Setting up route
angular.module('scrapes').config(['$stateProvider',
	function($stateProvider) {
		// Scrapes state routing
		$stateProvider.
		state('listScrapes', {
			url: '/scrapes',
			templateUrl: 'modules/scrapes/views/list-scrapes.client.view.html'
		}).
		state('createScrape', {
			url: '/scrapes/create',
			templateUrl: 'modules/scrapes/views/create-scrape.client.view.html'
		}).
		state('viewScrape', {
			url: '/scrapes/:scrapeId',
			templateUrl: 'modules/scrapes/views/view-scrape.client.view.html'
		}).
		state('editScrape', {
			url: '/scrapes/:scrapeId/edit',
			templateUrl: 'modules/scrapes/views/edit-scrape.client.view.html'
		});
	}
]);