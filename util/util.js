const { JSDOM } = require('jsdom');

module.exports = {
	// HTMLObject, String -> HTMLObject
	queryDOM: function(domObject, selector) {
		return new JSDOM(domObject.text).window.document.querySelector(selector);
	},
	debug: function(str) {
		//TODO check debug mode, write to log file?
		console.log(str);
	}
}