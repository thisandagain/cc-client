/**
 * Unit test suite.
 *
 * @package API
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var async       = require('async'),
    test        = require('tap').test,
    faker       = require('Faker'),
    argv        = require('optimist')
        .demand(['key', 'user','pass'])
        .argv;

    cclient     = require(__dirname + '/../lib/index.js')(argv.key, argv.user, argv.pass);

/**
 * Suite
 */
async.auto({

    all:    function (callback) {
        cclient.all(callback);
    },

    one:    function (callback) {
        cclient.one('1', callback);
    },

    search: function (callback) {
        cclient.search('andrew@diy.org', callback);
    },

    create: function (callback) {
        cclient.create(faker.Internet.email(), 'ACTION_BY_CUSTOMER', 2, callback);
    },

    test:   ['all', 'one', 'search', 'create', function (callback, obj) {
        test("Component definition", function (t) {
            t.type(cclient, "object", "Component should be an object");
            t.type(cclient.all, "function", "Method should be a function");
            t.type(cclient.one, "function", "Method should be a function");
            t.type(cclient.search, "function", "Method should be a function");
            t.type(cclient.create, "function", "Method should be a function");
            t.end();
        });

        test("All method", function (t) {
            t.type(obj.all, "object", "Results should be an object");
            t.ok((obj.all.entry.length > 0), "Results should be an array with a length greater than 0");
            t.type(obj.all.entry[0].content, "object", "Content should be an object");
            t.end();
        });

        test("Search method", function (t) {
            t.type(obj.search, "object", "Results should be an object");
            t.type(obj.search.entry.content, "object", "Content should be an object");
            t.end();
        });

        test("One method", function (t) {
            t.type(obj.one, "object", "Results should be an object");
            t.type(obj.one.content, "object", "Content should be an object");
            t.end();
        });

        test("Create method", function (t) {
            t.type(obj.create, "object", "Results should be an object");
            t.end();
        });

        callback();
    }]

}, function (err, obj) {
    test("Catch errors", function (t) {
        t.equal(err, null, "Errors should be null");
        t.end();
    });
});
 
