/**
 * Created with ConferoV3.
 * User: rylan
 * Date: 2014-05-08
 * Time: 01:40 AM
 * To change this template use Tools | Templates.
 */
exports.Confero = (function() {
    var moment = require("moment");
    var eventIndex = require(__dirname + '/data/EventIndex.json');
    var eventByKey = {};
    var conferenceCache = {};
    for(var i = 0; eventIndex.Events[i]; i++) {
        eventIndex.Events[i].momentStartDate = moment(eventIndex.Events[i].StartDate, "MM/DD/YYYY");
        eventIndex.Events[i].momentEndDate = moment(eventIndex.Events[i].EndDate, "MM/DD/YYYY");
        eventIndex.Events[i].momentEndDate.hour(23);
        eventIndex.Events[i].momentEndDate.minute(59);
        eventByKey[eventIndex.Events[i].Id] = eventIndex.Events[i];
    }
    eventIndex.Events.sort(function compare(a, b) {
        if(a.momentEndDate.isAfter(b.momentEndDate)) {
            return -1;
        } else if(a.momentEndDate.isBefore(b.momentEndDate)) {
            return 1;
        } else {
            if(a.momentStartDate.isAfter(b.momentStartDate)) {
                return -1;
            }
            if(a.momentStartDate.isBefore(b.momentStartDate)) {
                return 1;
            }
            return 0;
        }
    });
    return {
        getEventIndex: function() {
            return eventIndex;
        },
        getEventById: function(id) {
            return eventByKey[id];
        },
        getEventsByTemporal: function(temporal, date) {
            var events = [];
            for(var i = 0; eventIndex.Events[i]; i++) {
                if(temporal === "past" && eventIndex.Events[i].momentEndDate.isBefore(date)) {
                    events.push(eventIndex.Events[i]);
                } else if(temporal === "upcoming" && date.isBefore(eventIndex.Events[i].momentStartDate)) {
                    events.push(eventIndex.Events[i]);
                } else if(temporal === "inprogress" && (
                    (date.isBefore(eventIndex.Events[i].momentEndDate) || date.isSame(eventIndex.Events[i].momentEndDate)) && (date.isAfter(eventIndex.Events[i].momentStartDate) || date.isSame(eventIndex.Events[i].momentStartDate)))) {
                    events.push(eventIndex.Events[i]);
                }
            }
            return events;
        },
        getConferenceById: function(id) {
            var i, j;
            if(!conferenceCache[id]) {
                var event = this.getEventById(id);
                conferenceCache[id] = require(__dirname + '/data/conferences/' + event.File);
                if(conferenceCache[id]) {
                    conferenceCache[id].Version = event.Version;
                    conferenceCache[id].Sessions.sort(function compare(a, b) {
                        var atime = a.Time.split('-');
                        var btime = b.Time.split('-');
                        var aStartTime = moment(a.Day + ' ' + atime[0].trim(), 'YYYY-MM-DD HH:mm');
                        var bStartTime = moment(b.Day + ' ' + btime[0].trim(), 'YYYY-MM-DD HH:mm');
                        var aEndTime = moment(a.Day + ' ' + atime[1].trim(), 'YYYY-MM-DD HH:mm');
                        var bEndTime = moment(b.Day + ' ' + btime[1].trim(), 'YYYY-MM-DD HH:mm');
                        if(aStartTime.isAfter(bStartTime)) {
                            return 1;
                        } else if(aStartTime.isBefore(bStartTime)) {
                            return -1;
                        } else {
                            if(aEndTime.isAfter(bEndTime)) {
                                return 1;
                            }
                            if(aEndTime.isBefore(bEndTime)) {
                                return -1;
                            }
                            return 0;
                        }
                    });
                    if(!conferenceCache[id].PeopleByKey) {
                        conferenceCache[id].PeopleByKey = {};
                        for(i = 0; conferenceCache[id].People[i]; i++) {
                            conferenceCache[id].PeopleByKey[conferenceCache[id].People[i].Key] = conferenceCache[id].People[i];
                        }
                    }
                    if(!conferenceCache[id].SessionsByKey) {
                        conferenceCache[id].SessionsByKey = {};
                        conferenceCache[id].SessionByPaperKey = {};
                        for(i = 0; conferenceCache[id].Sessions[i]; i++) {
                            conferenceCache[id].SessionsByKey[conferenceCache[id].Sessions[i].Key] = conferenceCache[id].Sessions[i];
                            if(conferenceCache[id].Sessions[i].Items) {
                                for(j = 0; conferenceCache[id].Sessions[i].Items[j]; j++) {
                                    conferenceCache[id].SessionByPaperKey[conferenceCache[id].Sessions[i].Items[j]] = conferenceCache[id].Sessions[i].Key;
                                }
                            }
                        }
                    }
                    if(!conferenceCache[id].ItemsByKey) {
                        conferenceCache[id].ItemsByKey = {};
                        for(i = 0; conferenceCache[id].Items[i]; i++) {
                            conferenceCache[id].ItemsByKey[conferenceCache[id].Items[i].Key] = conferenceCache[id].Items[i];
                        }
                    }
                }
            }
            return conferenceCache[id];
        },
        getPersonByKey: function(conferenceId, peopleKey) {
            var conference = this.getConferenceById(conferenceId);
            if(conference) {
                return conference.PeopleByKey[peopleKey];
            }
        },
        getSessionByKey: function(conferenceId, sessionKey) {
            var conference = this.getConferenceById(conferenceId);
            if(conference) {
                return conference.SessionsByKey[sessionKey];
            }
        },
        getItemByKey: function(conferenceId, itemKey) {
            var conference = this.getConferenceById(conferenceId);
            if(conference) {
                return conference.ItemsByKey[itemKey];
            }
        },
        getSessionByPaperKey: function(conferenceId, paperKey) {
            var conference = this.getConferenceById(conferenceId);
            if(conference) {
                return this.getSessionByKey(conferenceId, conference.SessionByPaperKey[paperKey]);
            }
        }
    };
})();