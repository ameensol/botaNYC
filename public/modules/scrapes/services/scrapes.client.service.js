'use strict';

//Scrapes service used to communicate Scrapes REST endpoints
angular.module('scrapes').factory('Scrapes', ['$resource',
	function($resource) {
		return $resource('scrapes/:scrapeId', { scrapeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);