/**
* Created with ConferoV3.
* User: rylan
* Date: 2014-03-23
* Time: 01:46 AM
* To change this template use Tools | Templates.
*/


var fs = require('fs');
var express = require('express');
var moment = require('moment');
var crypto = require('crypto');
var app = express();


var shasum = crypto.createHash('sha1');
shasum.update(moment().toISOString());

var ETag = shasum.digest('hex');

app.use(express.compress());

var data = require( './ConferoData.js');

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Cache-Control', 'public');
	res.set('Content-Type', 'application/json');
	res.setHeader('ETag', ETag ); //Will invalidate browser cache.
	next();
});

app.get('/conferences/events', function(req, res){
	var eventData = data.Confero.getEventIndex();
	if( eventData ){
		res.status(200);
		res.send(eventData);
	} else {
		res.status(404);
		res.send("Event data not found.");
	}
});

app.get('/conferences/events/:temporal', function(req, res){
	var temporal = req.params.temporal;
	if( temporal ) {
		var date = req.query.date ? moment(req.query.date) : moment();
		var result = data.Confero.getEventsByTemporal( temporal, date);
		
		if( result ) {
			res.status(200);
			res.send(result);
			return;
		}
	}
	res.status(404);
	res.send(temporal + " not found");
});

app.get('/conferences/event/:id', function(req, res){
	var eventId = req.params.id;
	var result;
	if( eventId ) {
		result = data.Confero.getEventById(eventId);
		
		if( result ){
			res.status(200);
			res.send(result);
			return;
		}
	}
	res.status(404);
	res.send(eventId + " not found");
});

app.get('/conferences/event/:id/icon', function(req, res) {
	var eventId = req.params.id;

	if( eventId ){
		result = data.Confero.getEventById(eventId);
	
		if( result ) {
			var img = fs.readFileSync(__dirname +'/data/icon200/' + result.Icon );
			if( img ) {
				res.writeHead(200, {'Content-Type': 'image/png'});
				res.end( img, 'binary' );
				return;
			}
		}
	}
	res.status(404);
	res.send(eventId + " not found");
});

app.get('/conferences/event/:id/image', function(req, res) {
	var eventId = req.params.id;

	if( eventId ){
		result = data.Confero.getEventById(eventId);
	
		if( result ) {
			var img = fs.readFileSync(__dirname +'/data/icon200/' + result.Image);
			if( img ) {
				res.writeHead(200, {'Content-Type': 'image/png'});
				res.end( img, 'binary' );
				return;
			}
		}
	}
	res.status(204);
	res.send(eventId + " not found");
});

app.get('/conference/:id/authors', function(req, res) {
	var conferenceId = req.params.id;

	if( conferenceId ){
		var conference = data.Confero.getConferenceById(conferenceId);
		if(conference) {
			res.status( 200 );
			res.send( conference.People );
			return;
		}
	}
	res.status(404);
	res.send(conferenceId + " not found");
});

app.get('/conference/:id', function(req, res) {
	var conferenceId = req.params.id;

	if( conferenceId ){
		var conference = data.Confero.getConferenceById(conferenceId);
		if(conference){
			res.status( 200 );
			res.send( conference );
			return;
		}
	}
	res.status(404);
	res.send(conferenceId + " not found");
});

app.get('/conference/:id/info', function(req, res) {
	var conferenceId = req.params.id;

	if( conferenceId ){
		var conference = data.Confero.getConferenceById(conferenceId);
		if(conference){
			var data = {};
			for(var d in conference ){
				if(conference.hasOwnProperty(d) && 
					d !== "Sessions" &&
					d !== "SessionsByKey" &&
					d !== "Items" &&
					d !== "ItemsByKey" &&
					d !== "People" &&
					d !== "PeopleByKey" ) {

					data[d] = conference[d];
				}
			}
			res.status( 200 );
			res.send( data);

			return;
		}
	}
	res.status(404);
	res.send(conferenceId + " not found");
});

app.get('/conference/:id/revision', function(req, res) {
	var conferenceId = req.params.id;

	if( conferenceId ){
		var conference = data.Confero.getConferenceById(conferenceId);
		if(conference){
			res.status( 200 );
			res.send( { revision: conference.DataRevision} );
			return;
		}
	}
	res.status(404);
	res.send(conferenceId + " not found");
});

app.get('/conference/:id/sessions', function(req, res) {
	var conferenceId = req.params.id;

	if( conferenceId ){
		var conference = data.Confero.getConferenceById(conferenceId);
		if(conference){
			res.status( 200 );
			res.send( conference.Sessions );
			return;
		}
	}
	res.status(404);
	res.send(conferenceId + " not found");
});

app.get('/conference/:id/items', function(req, res) {
	var conferenceId = req.params.id;

	if( conferenceId ){
		var conference = data.Confero.getConferenceById(conferenceId);
		if( conference ) {
			res.status(200);
			res.send( conference.Items );
			return;
		}
	}
	res.status(404);
	res.send(conferenceId + " not found");
});

app.get('/conference/:id/author/:key', function(req, res) {
	var conferenceId = req.params.id;
	var authorKey = decodeURIComponent(req.params.key);

	if( conferenceId && authorKey ){
		var author = data.Confero.getAuthorByKey(conferenceId, authorKey);
		if(author){
			res.status(200);
			res.send( author );
			return;
		}
	}
	res.status(404);
	res.send(conferenceId + " or " + authorKey + "not found");
});

app.get('/conference/:id/session/:key', function(req, res) {
	var conferenceId = req.params.id;
	var sessionKey = decodeURIComponent(req.params.key);

	if( conferenceId && sessionKey ){
		var session = data.Confero.getSessionByKey(conferenceId, sessionKey);
		if(session){
			res.status(200);
			res.send( session );
			return;
		}
	}
	res.status(404);
	res.send(conferenceId + " or " + authorKey + "not found");
});

app.get('/conference/:id/item/:key', function(req, res) {
	var conferenceId = req.params.id;
	var itemKey = decodeURIComponent(req.params.key);

	if( conferenceId && itemKey ){
		var item = data.Confero.getItemByKey(conferenceId, itemKey);
		if(item){
			res.status(200);
			res.send( item );
			return;
		}
	}
	res.status(404);
	res.send(conferenceId + " or " + authorKey + "not found");
});

var server = app.listen(3000, function() {
	console.log('Listening on port %d', server.address().port);
});