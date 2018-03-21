const { Pool, Client } = require('pg');
const config = require('../config');
const Site = require('../classes/site');
const User = require('../classes/user');
const Subscription = require('../classes/subscription')

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

module.exports = {
	getAllSites: async () => {
		let results = await pool.query('SELECT * FROM site');
		return results.rows.map(result => new Site(result));
	},
	getSiteById: async (id) => {
		let results = (await pool.query('SELECT *, sub.id as id from subscription sub JOIN site s ON sub.site_id=s.id WHERE sub.id=$1', [id])).rows;
		if (results.length === 0) {
			//TODO error handling
		}
		return new Subscription(results[0]);
	},
	getUserWithSites: async (user) => {
		//TODO id clash between site and subscription
		let results = (await pool.query('SELECT *, sub.id as id FROM subscription sub JOIN site s ON sub.site_id=s.id WHERE sub.email=$1 ORDER BY sub.rank, s.name', [user])).rows;
		if (results.length === 0) {
			//TODO error handling
			return undefined;
		}
		return new User(results[0].email, results.map(result => new Subscription(result)));
	},
	updateSiteContent: async (mostRecentContent, url) => {
		let results = await pool.query('UPDATE site SET most_recent=$1, updated_at=NOW() WHERE url=$2', [mostRecentContent, url]);
	},
	editSite: async (id, name, url, selector) => {
		let results = await pool.query('UPDATE site SET name=$1, url=$2, selector=$3 WHERE id=$4', [name, url, selector, id]);
	},
	editSubscription: async (id, email, rank) => {
		let results = await pool.query('UPDATE subscription SET rank=$1 WHERE id=$2 and email=$3', [rank, id, email]);
	},
	addSite: async (name, url, selector, email, rank) => {
		let inserted = await pool.query('INSERT INTO site (name, url, selector, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *', [name, url, selector]);
		let newId = inserted.rows[0].id;
		let subscription = await pool.query('INSERT INTO subscription (email, site_id, last_seen, rank) VALUES ($1, $2, $3, NOW())', [email, newId, rank]);
	},
	markSubscriptionAsViewed: async (id) => {
		let results = await pool.query('UPDATE subscription SET last_seen=NOW() WHERE id=$1', [id]);
	},
	unsubscribe: async (id) => {
		let results = await pool.query('DELETE FROM subscription WHERE id=$1', [id]);
	}
}