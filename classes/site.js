const moment = require('moment');

class Site {
	constructor(object) {
        this.id = object.site_id;
		this.name = object.name;
		this.url = object.url;
		this.selector = object.selector;
		this.mostRecent = object.most_recent;
		this.updatedAt = moment(object.updated_at);
		this.lastSeen = moment(object.last_seen);
	}

    toString() {
        return `${this.name} (${this.id}, ${this.url}, ${this.selector})`;
    }
}

module.exports = Site;