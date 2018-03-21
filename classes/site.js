const moment = require('moment');

class Site {
	constructor(object) {
		this.name = object.name;
		this.url = object.url;
		this.selector = object.selector;
		this.mostRecent = object.most_recent;
		this.updatedAt = moment(object.updated_at);
		this.lastSeen = moment(object.last_seen);
	}
}

module.exports = Site;