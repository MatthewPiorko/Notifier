CREATE TABLE site (
	id SERIAL PRIMARY KEY, 
	name TEXT NOT NULL, 
	url TEXT NOT NULL, 
	selector TEXT NOT NULL, 
	most_recent TEXT, 
	updated_at TIMESTAMP NOT NULL);

CREATE TABLE subscription (
	id SERIAL PRIMARY KEY, 
	email TEXT NOT NULL, 
	site_id INTEGER NOT NULL, 
	last_seen TIMESTAMP NOT NULL, 
	rank SMALLINT NOT NULL,

	CONSTRAINT rank_check CHECK (rank >= 0 AND rank <= 3));

INSERT INTO site (name, url, selector, updated_at) VALUES ('Questionable Content', 'www.questionablecontent.net', '#container > div.row > div.small-12.medium-expand.column > img', NOW());
INSERT INTO site (name, url, selector, updated_at) VALUES ('Oxygen Not Included', 'http://steamcommunity.com/games/457140/announcements/', '#announcementsContainer > .announcement > .large_title', NOW());

INSERT INTO subscription (email, site_id, last_seen) VALUES ('test', 1, NOW());
INSERT INTO subscription (email, site_id, last_seen) VALUES ('test', 2, NOW());