const express = require('express');
const request = require('superagent');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const Site = require('./classes/site')

//TODO YT doesn't work

const util = require('./util/util');
const config = require('./config');
const db = require('./util/db');

const app = express();
app.set('view engine', 'pug');
app.use(cookieParser());
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(config.port, () => { util.debug(`App started on port ${config.port}`); });

let authenticator = async function(req, res, next) {
	if (req.url !== '/login' && !(req.cookies && req.cookies[config.cookieName])) {
		res.redirect('/login');
		return;
	}

	next();
};

app.use(authenticator);

app.get('/', function(req, res) {
	res.redirect('/viewAll');
});

app.get('/login', function(req, res) {
	res.render('login');
});

app.post('/login', function(req, res) {
	let email = req.body.email;

	if (!email) {
		res.render('login', { error: 'Invalid email' });
	} else {
		res.cookie(config.cookieName, email, { expires: moment().add(config.timeToSessionExpireMillis, 'ms').toDate() });
		res.redirect('/viewAll');
	}
});

app.get('/logout', function(req, res) {
	res.clearCookie(config.cookieName);
	res.redirect('/login');
});

app.get('/viewAll', async function(req, res) {
	const email = req.cookies[config.cookieName];
	let user = await db.getUserWithSites(email);

	let subscriptionsByRank = user.subscriptions.reduce((acc, sub) => {
		let index = sub.rank - 1;
		if (acc[index]) {
			acc[index].push(sub);
		} else {
			acc[index] = [sub];
		}
		return acc;
	}, {});

  	res.render('viewAll', { user, subscriptionsByRank });
});

app.get('/editSite/:id', async function(req, res) {
	const { id } = req.params;

	const subscription = await db.getSiteById(id);

	res.render('editSite', {...subscription});
});

app.post('/editSite/:id', async function(req, res) {
	const email = req.cookies[config.cookieName];
	const { id } = req.params;
	const { name, url, selector, rank } = req.body;

	await db.editSite(id, name, url, selector);
	await db.editSubscription(id, email, rank);

	res.redirect('/viewAll');
});

app.get('/addSite', function(req, res) {
	res.render('addSite');
});

app.post('/addSite', async function(req, res) {
	const { name, url, selector, rank } = req.body;
	const email = req.cookies[config.cookieName];
	let site = new Site({
		name: name, 
		url: url, 
		selector: selector,
		most_recent: undefined,
		lastSeen: undefined,
		updatedAt: undefined
	});
	util.debug(`Adding {${url}} with selector {${selector}}`);
	await db.addSite(name, url, selector, email, rank);
	await updateSite(site);
	res.redirect('/viewAll');
});

app.post('/update', async function(req, res) {
	const { id } = req.body;
	util.debug(`Marking subscription {${id}} as viewed`);
	await db.markSubscriptionAsViewed(id);
	res.redirect('/viewAll');
});

app.post('/unsubscribe', async function (req, res) {
	const { id } = req.body;
	const email = req.cookies[config.cookieName];
	util.debug(`Unsubscribing {${email}} from subscription {${id}}`);
	await db.unsubscribe(id);
	res.redirect('/viewAll');
});

let updateSite = async function(site) {
	let newestDOM;
	try {
		newestDOM = await request.get(site.url);
	} catch (e) {
		util.debug(`Site ${site.name} at ${site.url} does not exist`);
		return;
	}
	let newest = util.queryDOM(newestDOM, site.selector);

	if (!newest) {
		util.debug(`Could not read data for {${site.name}} at {${site.url}} using {${site.selector}}`);
		return;
	}
	newest = newest.outerHTML;

	if (newest !== site.mostRecent) {
		await db.updateSiteContent(newest, site.url);
		util.debug(`New data for {${site.name}} at ${new Date()}`);
	}
};

let updateAllSites = async function() {
	let sites = await db.getAllSites();

	util.debug(`Checking for site updates at ${moment()}`);
	sites.forEach(async site => {
		updateSite(site);
	});
};

updateAllSites();
setInterval(updateAllSites, config.timeToCheckMillis);