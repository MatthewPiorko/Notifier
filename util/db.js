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
        return results.rows.map(result => new Site({ ...result, site_id: result.id }));
    },
	getSiteById: async (id) => {
		let results = (await pool.query('SELECT *, sub.id as id, s.id as site_id from subscription sub JOIN site s ON sub.site_id=s.id WHERE sub.id=$1', [id])).rows;
		if (results.length != 1) {
			//TODO error handling
		}
		return new Subscription(results[0]);
	},
	getUserWithSites: async (email) => {
		let results = (await pool.query('SELECT *, sub.id as id, s.id as site_id FROM subscription sub JOIN site s ON sub.site_id=s.id WHERE sub.email=$1 ORDER BY sub.rank, s.name', [email])).rows;
		return new User(email, results.map(result => new Subscription(result)));
	},
	updateSiteContent: async (mostRecentContent, id) => {
		let results = await pool.query('UPDATE site SET most_recent=$1, updated_at=NOW() WHERE id=$2', [mostRecentContent, id]);
	},
    addSite: async (name, url, selector, email, rank) => {
        let newSite = await pool.query('INSERT INTO site (name, url, selector, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *', [name, url, selector]);
        let newId = newSite.rows[0].id;
        let subscription = await pool.query('INSERT INTO subscription (email, site_id, last_seen, rank) VALUES ($1, $2, NOW(), $3)', [email, newId, rank]);

        return newSite;
    },
	editSubscription: async (id, name, url, selector, rank) => {
        //TODO if new name/url/selector, make new site. then delete old site if nobody else is using
		let results = (await pool.query('UPDATE subscription SET rank=$1 WHERE id=$2 RETURNING *', [rank, id])).rows[0];
        let siteId = results.site_id;
        let siteResults = (await pool.query('UPDATE site SET name=$1, url=$2, selector=$3 WHERE id=$4 RETURNING *', [name, url, selector, siteId])).rows[0];
        let updated = { ...siteResults, ...results, id: results.id, site_id: siteResults.id };
        return new Subscription(updated);
	},
	markSubscriptionAsViewed: async (id) => {
		let results = await pool.query('UPDATE subscription SET last_seen=NOW() WHERE id=$1', [id]);
	},
	unsubscribe: async (id) => {
		let results = await pool.query('DELETE FROM subscription WHERE id=$1', [id]);
	}
}