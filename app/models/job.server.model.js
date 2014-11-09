'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Job Schema
 */
var JobSchema = new Schema({
	agency: {
		type:String,
		trim:true
	},
	date: {
		type:String,
		trim:true
	},
	id: {
		type:String,
		trim:true
	},
	link: {
		type:String,
		trim:true
	},
	location: {
		type:String,
		trim:true
	},
	title: {
		type:String,
		trim:true
	},
	tweeted: {
		type:Boolean,
		default:false
	},
	created: {
		type: Date,
		default:Date.now
	}
});

mongoose.model('Job', JobSchema);
