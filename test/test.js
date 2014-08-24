var www = 'http://'+ location.hostname + ':3000';

var queryAPI = function( inUrl, inType, inCallback, inError ) {
	$.ajax({
		url: inUrl,
		type: inType,
		crossDomain: true,
		dataType: "json",
		success: inCallback,
		error: inError
	});
};

var fetchError = function( xhr, status ) {
	ok(false, "Error retriving data error code " + status );
};

test( "retrieve events", function() {
	stop();
	var fetchSuccess = function( data ) {
		ok( data.DummyCheckSums === "-1393793961,-567785358,-533442047,-1393793961", "DummyCheckSum check" );
		ok( data.Events.length > 0, "Has multiple events");
		start();
	};
	
	queryAPI( www + "/conferences/events", "GET", fetchSuccess, fetchError );
});

test( "retrieve past events", function() {
	stop();
	var now = moment("2014-04-18T03:25:23.690Z");
	var fetchSuccess = function( data ) {
		ok( data.length === 28, "Set of past items is not 28" );
		for(var i=0; data[i]; i++) {
			ok( now.isAfter(data[i].momentEndDate), "Event is not before now");
		}
		start();
	};

	queryAPI( www + "/conferences/events/past?date=2014-04-18T03:25:23.690Z", "GET", fetchSuccess, fetchError );
});

test( "retrieve inprogress event on end date", function() {
	stop();
	var now = moment("08/26/2013","MM/DD/YYYY");
	var fetchSuccess = function( data ) {
		ok(data.length === 1, "Only one event was retrieved." );
		ok(data[0].Id === "FSE2013", "Retrieved the right event.");
		start();
	};
	queryAPI( www + "/conferences/events/inprogress?date="+now.toISOString(), "GET", fetchSuccess, fetchError );
});

test( "retrieve inprogress event on start date", function() {
	stop();
	var now = moment("08/18/2013","MM/DD/YYYY");
	var fetchSuccess = function( data ) {
		ok(data.length === 1, "Only one event was retrieved." );
		ok(data[0].Id === "FSE2013", "Retrieved the right event.");
		start();
	};
	queryAPI( www + "/conferences/events/inprogress?date="+now.toISOString(), "GET", fetchSuccess, fetchError );
});

test( "retrieve inprogress event on middle date", function() {
	stop();
	var now = moment("08/23/2013","MM/DD/YYYY");
	var fetchSuccess = function( data ) {
		ok(data.length === 1, "Only one event was retrieved." );
		ok(data[0].Id === "FSE2013", "Retrieved the right event.");
		start();
	};
	queryAPI( www + "/conferences/events/inprogress?date="+now.toISOString(), "GET", fetchSuccess, fetchError );
});

test( "retrieve upcoming events", function() {
	stop();
	var now = moment("08/23/2010","MM/DD/YYYY");
	var fetchSuccess = function( data ) {
		ok(data.length > 0, "Retrieved list of events." );
		for(var i=0; data[i]; i++) {
			ok( now.isBefore(data[i].momentStartDate), "Events all come after this date.");
		}
		start();
	};
	queryAPI( www + "/conferences/events/upcoming?date="+now.toISOString(), "GET", fetchSuccess, fetchError );
});

test( "retrieve event ICSE2014", function() {
	stop();
	var fetchSuccess = function( data ) {
		ok( data.Id === "ICSE2014", "Id check" );
		ok( data.Name === "ICSE 2014", "Name check" );
		ok( data.Version >= 1, "Version is 1 or greater");
		ok( data.File === "2014ICSE.json", "File check");
		ok( data.StartDate === "2014-05-31", "Start date check");
		ok( data.EndDate === "2014-06-07", "End date check");
		ok( data.Description, "Has description");
		ok( data.Icon === "2014ICSE.png", "icon check");
		ok( data.Image === "2014ICSE.png", "image check");
		
		start();
	};

	queryAPI( www + "/conferences/event/ICSE2014", "GET", fetchSuccess, fetchError );
});

test( "retrieve event ICSE2014 icon image", function() {
	stop();
	var $image = $('<img>');

	$image.load(function() {
		ok(true, "Successfully loaded image.");
		start();
	});
	$image.error(function(e) {
		ok(false, "Successfully loaded image.");
		start();
	});
	
	$image.attr('src', www + "/conferences/event/ICSE2014/icon");
});

test( "retrieve event ICSE2014 image", function() {
	stop();
	var $image = $('<img>');

	$image.load(function() {
		ok(true, "Successfully loaded image.");
		start();
	});
	
	$image.error(function(e) {
		ok(false, "Successfully loaded image.");
		start();
	});
	
	$image.attr('src',www + "/conferences/event/ICSE2014/image");
});

test( "retrieve event ICSE2014 people", function() {
	stop();
	var fetchSuccess = function( data ) {
		ok( data.length > 0, "Conference has people");
		var flag = false;
		for(var i=0; data[i]; i++){
			if(data[i].Name === "Reid Holmes"){
				flag = true;
				break;
			}
		}
		ok(flag, "Found Reid in People");
		start();
	};
	
	queryAPI(www + "/conference/ICSE2014/people", "GET", fetchSuccess, fetchError);
});

test( "retrieve event ICSE2014 sessions", function() {
	stop();
	var fetchSuccess = function( data ) {
		ok( data.length > 0, "Conference has sessions");
		start();
	};
	queryAPI(www + "/conference/ICSE2014/sessions", "GET", fetchSuccess, fetchError);
});

test( "retrieve event ICSE2014 people by key", function() {
	stop();
	var fetchSuccess = function( data ) {
		ok(data.Name === "Reid Holmes", "Found Reid in People");
		start();
	};
	
	queryAPI(www + "/conference/ICSE2014/people/Reid%20Holmes%20%40%20University%20of%20Waterloo%2C%20Canada", "GET", fetchSuccess, fetchError);
});

test( "retrieve event ICSE2014 session by key", function() {
	stop();
	var fetchSuccess = function( data ) {
		ok(data.Title === "ICSE 2014 - Main Research Track", "Found Session");
		start();
	};
	
	queryAPI(www + "/conference/ICSE2014/session/2014-06-04%2009%3A00%20ICSE%202014%20-%20Main%20Research%20Track", "GET", fetchSuccess, fetchError);
});

test( "retrieve event ICSE2014 item by key", function() {
	stop();
	var fetchSuccess = function( data ) {
		ok(data.Title === "Cowboys, Ankle Sprains, and Keepers of Quality: How Is Video Game Development Different from Software Development?", "Item has title");
		ok(data.Type === "Full Paper", "Item has type.");
		start();
	};
	
	queryAPI(www + "/conference/ICSE2014/item/icse14main-p007-p", "GET", fetchSuccess, fetchError);
});

test( "retrieve event ICSE2014 items", function() {
	stop();
	var fetchSuccess = function( data ) {
		ok( data.length > 0, "Conference has items");
		
		start();
	};
	queryAPI(www + "/conference/ICSE2014/items", "GET", fetchSuccess, fetchError);
});

test( "retrieve event ICSE2014 revision", function() {
	stop();
	var fetchSuccess = function( data ) {
		ok( data.revision === 1390292066, "Conference has revision");
		
		start();
	};
	queryAPI(www + "/conference/ICSE2014/revision", "GET", fetchSuccess, fetchError);
});