/*jshint -W069 */
/*global angular:false */
angular.module('zorba-api', [])
    .factory('ZorbaAPI', ['$q', '$http', '$rootScope', function($q, $http, $rootScope) {
        'use strict';

        /**
         * This API enables you to directly evaluate queries from Zorba.
         * @class ZorbaAPI
         * @param {(string|object)} [domainOrOptions] - The project domain or options object. If object, see the object's optional properties.
         * @param {string} [domainOrOptions.domain] - The project domain
         * @param {string} [domainOrOptions.cache] - An angularjs cache implementation
         * @param {object} [domainOrOptions.token] - auth token - object with value property and optional headerOrQueryName and isQuery properties
         * @param {string} [cache] - An angularjs cache implementation
         */
        var ZorbaAPI = (function() {
            function ZorbaAPI(options, cache) {
                var domain = (typeof options === 'object') ? options.domain : options;
                this.domain = typeof(domain) === 'string' ? domain : 'http://localhost/v1';
                if (this.domain.length === 0) {
                    throw new Error('Domain parameter must be specified as a string.');
                }
                cache = cache || ((typeof options === 'object') ? options.cache : cache);
                this.cache = cache;
            }

            ZorbaAPI.prototype.$on = function($scope, path, handler) {
                var url = domain + path;
                $scope.$on(url, function() {
                    handler();
                });
                return this;
            };

            ZorbaAPI.prototype.$broadcast = function(path) {
                var url = domain + path;
                //cache.remove(url);
                $rootScope.$broadcast(url);
                return this;
            };

            ZorbaAPI.transformRequest = function(obj) {
                var str = [];
                for (var p in obj) {
                    var val = obj[p];
                    if (angular.isArray(val)) {
                        val.forEach(function(val) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(val));
                        });
                    } else {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(val));
                    }
                }
                return str.join("&");
            };

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
                var deferred = $q.defer();

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

                var url = domain + path;
                var options = {
                    timeout: parameters.$timeout,
                    method: 'POST',
                    url: url,
                    params: queryParameters,
                    data: body,
                    headers: headers
                };
                if (Object.keys(form).length > 0) {
                    options.data = form;
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.transformRequest = ZorbaAPI.transformRequest;
                }
                $http(options)
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        if (parameters.$cache !== undefined) {
                            parameters.$cache.put(url, data, parameters.$cacheItemOpts ? parameters.$cacheItemOpts : {});
                        }
                    })
                    .error(function(data, status, headers, config) {
                        deferred.reject({
                            status: status,
                            headers: headers,
                            config: config,
                            body: data
                        });
                    });

                return deferred.promise;
            };

            return ZorbaAPI;
        })();

        return ZorbaAPI;
    }]);