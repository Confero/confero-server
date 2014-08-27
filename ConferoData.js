/**
 * Created with ConferoV3.
 * User: rylan
 * Date: 2014-05-08
 * Time: 01:40 AM
 * To change this template use Tools | Templates.
 */
exports.Confero = (function() {
    var moment = require("moment");
    var eventIndex = require(__dirname + '/data/conf-data/EventIndex.json');
    var eventByKey = {};
    var conferenceCache = {};
    for(var i = 0; eventIndex.Events[i]; i++) {
        eventIndex.Events[i].momentStartDate = moment(eventIndex.Events[i].StartDate, "YYYY-MM-DD");
        eventIndex.Events[i].momentEndDate = moment(eventIndex.Events[i].EndDate, "YYYY-MM-DD");
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
                conferenceCache[id] = require(__dirname + '/data/conf-data/data/' + event.File);
                if(conferenceCache[id]) {
                    conferenceCache[id].Version = event.Version;
                    conferenceCache[id].Sessions.sort(function compare(a, b) {
                        var atime = a.Time.split('-');
                        var btime = b.Time.split('-');
                        var aStartTime, bStartTime, aEndTime, bEndTime;
                        if(atime[0].indexOf('m') > -1) { //old standard
                            aStartTime = moment(a.Day + ' ' + atime[0].trim(), 'MM-DD-YYYY HH:mm a');
                            bStartTime = moment(b.Day + ' ' + btime[0].trim(), 'MM-DD-YYYY HH:mm a');
                            aEndTime = moment(a.Day + ' ' + atime[1].trim(), 'MM-DD-YYYY HH:mm a');
                            bEndTime = moment(b.Day + ' ' + btime[1].trim(), 'MM-DD-YYYY HH:mm a');
                        } else { //new standard
                            aStartTime = moment(a.Day + ' ' + atime[0].trim(), 'YYYY-MM-DD HH:mm');
                            bEndTime = moment(b.Day + ' ' + btime[1].trim(), 'YYYY-MM-DD HH:mm');
                            bStartTime = moment(b.Day + ' ' + btime[0].trim(), 'YYYY-MM-DD HH:mm');
                            aEndTime = moment(a.Day + ' ' + atime[1].trim(), 'YYYY-MM-DD HH:mm');
                        }
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
                        conferenceCache[id].ItemsKeyByPeopleKey = {};
                        conferenceCache[id].ItemsByKey = {};
                        for(i = 0; conferenceCache[id].Items[i]; i++) {
                            conferenceCache[id].ItemsByKey[conferenceCache[id].Items[i].Key] = conferenceCache[id].Items[i];
                            for(j = 0; conferenceCache[id].Items[i].Authors[j]; j++) {
                                if(conferenceCache[id].ItemsKeyByPeopleKey[conferenceCache[id].Items[i].Authors[j]]) {
                                    conferenceCache[id].ItemsKeyByPeopleKey[conferenceCache[id].Items[i].Authors[j]].push(conferenceCache[id].Items[i].Key);
                                } else {
                                    conferenceCache[id].ItemsKeyByPeopleKey[conferenceCache[id].Items[i].Authors[j]] = [conferenceCache[id].Items[i].Key];
                                }
                            }
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
        },
        getItemsByPeopleKey: function(conferenceId, peopleKey) {
            var conference = this.getConferenceById(conferenceId);
            if(conference) {
                var itemKeys = conference.ItemsKeyByPeopleKey[peopleKey];
                var items = [];
                for(var i = 0; itemKeys[i]; i++) {
                    items.push(this.getItemByKey(conferenceId, itemKeys[i]));
                }
                return items;
            }
        },
        getSessionsByPeopleKey: function(conferenceId, peopleKey) {
            var conference = this.getConferenceById(conferenceId);
            if(conference) {
                var items = this.getItemsByPeopleKey(conferenceId, peopleKey);
                var sessions = [];
                for(var i = 0; items[i]; i++) {
                    sessions.push(this.getSessionByPaperKey(conferenceId, items[i].Key));
                }
                return sessions;
            }
        }
    };
})();