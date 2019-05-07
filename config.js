module.exports = {
	port: 3000,
	timeToCheckMillis: 1000 * 60 * 30,
	cookieName: 'email',
	timeToSessionExpireMillis: 1000 * 60 * 60 * 8,
	db: {
		host: 'localhost',
		port: 5432,
		database: 'notify',
		password: 'password',
		user: 'postgres'
	}
};