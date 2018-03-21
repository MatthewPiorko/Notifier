const Site = require('./site')
const moment = require('moment')

class Subscription {
	constructor(object) {
		this.id = object.id;
		this.site = new Site(object);
		this.lastSeen = moment(object.last_seen);
		this.rank = object.rank;
	}
}

module.exports = Subscription;