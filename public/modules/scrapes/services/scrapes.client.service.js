'use strict';

//Scrapes service used to communicate Scrapes REST endpoints
angular.module('scrapes').factory('Scrapes', ['$resource',
	function($resource) {
		return $resource('scrapes/:scrapeId', { scrapeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			activate: {
				method: 'POST',
				url: 'scraper'
			},
			check: {
				method: 'GET',
				url: 'scraper'
			},
			deactivate: {
				method: 'DELETE',
				url: 'scraper'
			}
		});
	}
]);
