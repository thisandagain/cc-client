/**
 * Node.js client for the Constant Contact API
 *
 * @package cc-client
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var builder = require('xmlbuilder'),
    request = require('request'),
    xml2js  = require('xml2js');

/**
 * Module
 *
 * @param {String} Username
 * @param {String} API key
 */
module.exports = function (apikey, username, password) {

    // Establish API end point & HTTP Basic header
    var host    = 'https://api.constantcontact.com/ws/customers/' + username;
    var auth    = apikey + '%' + username + ':' + password;
    var head    = 'Basic ' + new Buffer(auth).toString('base64');

    /**
     * Generic API client wrapper function.
     *
     * @param {Object} Request parameters
     *
     * @return {Object}
     */
    var client = function (params, callback) {
        // Prefix the host
        if (typeof params.uri === 'undefined') {
            callback('Request URI not specified.');
        } else {
            params.uri = host + params.uri;
        }

        // Inject authentication header
        if (typeof params.headers === 'undefined') {
            params.headers = new Object(null);
        }
        params.headers['Authorization'] = head;

        // HTTP Request
        request(params, function (err, response, body) {
            if (err) {
                callback(err);
            } else {
                parse(body, callback);
            }
        });
    };

    /**
     * Parses an XML response and provides an appropriate callback object.
     *
     * @param {String} Response body
     *
     * @return {Object}
     */
    var parse = function (body, callback) {
        var parser  = new xml2js.Parser();
        parser.parseString(body, function (err, obj) {
            if (err) {
                callback({error:body});
            } else {
                callback(err, obj);
            }
        });
    };

    // ------------------------------------------------

    /**
     * Fetches all contacts.
     *
     * @return {Object}
     */
    var all = function (callback) {
        client({
            method: 'GET',
            uri:    '/contacts'
        }, callback);
    };

    /**
     * Fetches a single contact by ID.
     *
     * @param {String} ID
     *
     * @return {Object}
     */
    var one = function (id, callback) {
        client({
            method: 'GET',
            uri:    '/contacts/' + id
        }, callback);
    };

    /**
     * Searches for a single contact by email address
     *
     * @param {String} Email address
     *
     * @return {Object}
     */
    var search = function (address, callback) {
        client({
            method: 'GET',
            uri:    '/contacts',
            qs:     {
                email: address
            }
        }, callback);
    }

    /**
     * Creates a new contact and adds it to the default list (1).
     *
     * @param {Object} email, first name, last name, zip-code 
     * @param {String} Opt-in source of contact. Enumerated: [ACTION_BY_CUSTOMER, ACTION_BY_CONTACT]
     * @param {Number} List id
     *
     * @return {String}
     */
    var create = function (fields, source, list, callback) {
        // Construct XML body (yes, really... this API requires a freaking ATOM document to be sent over as the body. Fail.)
        var doc = builder.create();
        doc.begin('entry', {'version': '1.0', 'encoding': 'UTF-8'})
            .att('xmlns', 'http://www.w3.org/2005/Atom')
            .ele('title', {'type': 'text'})
            .up()
            .ele('updated', {}, new Date('2008-04-16').toISOString())
            .up()
            .ele('author', {})
            .up()
            .ele('id', {}, 'data:,none')
            .up()
            .ele('summary', {'type': 'text'}, 'Contact')
            .up()
            .ele('content', {'type': 'application/vnd.ctct+xml'})
                .ele('Contact', {'xmlns': 'http://ws.constantcontact.com/ns/1.0/'})
                    .ele('EmailAddress', {}, fields.email)
                    .up()
                    .ele('FirstName', {}, fields.first)
                    .up()
                    .ele('LastName', {}, fields.last)
                    .up()
                    .ele('PostalCode', {}, fields.zip)
                    .up()
                    .ele('OptInSource', {}, source)
                    .up()
                    .ele('ContactLists')
                        .ele('ContactList', {'id': host + '/lists/' + list});

        // Remove line breaks
        var body = doc.toString({pretty:true}).replace(/(\r\n|\n|\r)/gm, '');

        // Request
        client({
            method: 'POST',
            uri:    '/contacts',
            headers: {
                'Content-Type': 'application/atom+xml'
            },
            body:   body
        }, callback);
    };

    // ------------------------------------------------
    // ------------------------------------------------

    return {
        all:        all,
        one:        one,
        search:     search,
        create:     create
    };

};