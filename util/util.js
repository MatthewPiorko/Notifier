const { JSDOM } = require('jsdom');

module.exports = {
	// HTMLObject, String -> HTMLObject
	queryDOM: function(domObject, selector) {
        let domElement = new JSDOM(domObject.text).window.document;
        if (selector) {
	       	return domElement.querySelector(selector);
        } else {
            return domElement.documentElement;
        }
	},
	debug: function(str) {
		console.log(str);
	}
}