/*jshint -W069 */
/**
 * This API enables you to directly evaluate queries from Zorba.
 * @class ZorbaAPI
 * @param {(string|object)} [domainOrOptions] - The project domain or options object. If object, see the object's optional properties.
 * @param {string} [domainOrOptions.domain] - The project domain
 * @param {object} [domainOrOptions.token] - auth token - object with value property and optional headerOrQueryName and isQuery properties
 */
var ZorbaAPI = (function() {
    'use strict';

    var request = require('request');
    var Q = require('q');

    function ZorbaAPI(options) {
        var domain = (typeof options === 'object') ? options.domain : options;
        this.domain = domain ? domain : 'http://localhost/v1';
        if (this.domain.length === 0) {
            throw new Error('Domain parameter must be specified as a string.');
        }
    }

    /**
     * The request body must contain a main query.
    Optional user-defined library modules can be sent as well.
    By default the query is assumed to be XQuery.
    JSONiq queries must contain their own version declaration using `jsoniq version "1.0";`.
    The response content type depends on the first item of the result.
      * XML node: `application/xml;charset=utf-8`
      * JSON object or array: `application/json;charset=utf-8`
      * Base64 or Hex binary: `binary/octet-stream`
      * Atomic item: `text/plain;charset=utf-8`
      * Empty sequence: no content type

     * @method
     * @name ZorbaAPI#evaluate
     * @param {boolean} stream - Stream the query response. Default is `false`.
    If set to true and an error occurs after part of the response has already been sent to the client, the response status code will be 200.
    In this case, the streaming of the HTTP response will stop and the following string will be sent `"\n\n\nAn error occurred during the processing of the request.\n` followed by the error description.

     * @param {string} query - Main module to evaluate.
     * @param {array} module - User-defined libary modules.
     * 
     */
    ZorbaAPI.prototype.evaluate = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();

        var domain = this.domain;
        var path = '/evaluate';

        var body;
        var queryParameters = {};
        var headers = {};
        var form = {};

        if (parameters['stream'] !== undefined) {
            queryParameters['stream'] = parameters['stream'];
        }

        if (parameters['query'] !== undefined) {
            form['query'] = parameters['query'];
        }

        if (parameters['query'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: query'));
            return deferred.promise;
        }

        if (parameters['module'] !== undefined) {
            form['module'] = parameters['module'];
        }

        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }

        var req = {
            method: 'POST',
            uri: domain + path,
            qs: queryParameters,
            headers: headers,
            body: body
        };
        if (Object.keys(form).length > 0) {
            req.form = form;
        }
        if (typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else {
                if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {

                    }
                }
                if (response.statusCode === 204) {
                    deferred.resolve({
                        response: response
                    });
                } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({
                        response: response,
                        body: body
                    });
                } else {
                    deferred.reject({
                        response: response,
                        body: body
                    });
                }
            }
        });

        return deferred.promise;
    };

    return ZorbaAPI;
})();

exports.ZorbaAPI = ZorbaAPI;