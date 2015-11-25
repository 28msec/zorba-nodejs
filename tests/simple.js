'use strict';

require('jasmine2-pit');

var _ = require('lodash');

var ZorbaAPI = require('../lib/zorba-api').ZorbaAPI;

describe("Test Arithmetic Operation: ", function() {
    pit("string", function() {
        var api = new ZorbaAPI('http://zorba-server-dev-f13fb543-1.wcandillon.cont.tutum.io:81/v1');
        return api.evaluate({
            query: '1 + 1'
        }).then(function(result){
            expect(result.body).toBe('2');
        });
    });

    pit("json", function() {
        var api = new ZorbaAPI('http://zorba-server-dev-f13fb543-1.wcandillon.cont.tutum.io:81/v1');
        return api.evaluate({
            query: 'jsoniq version "1.0"; { foo: true }'
        }).then(function(result){
            expect(_.isEqual(result.body, { foo: true })).toBe(true);
        });
    });

    pit("xml", function() {
        var api = new ZorbaAPI('http://zorba-server-dev-f13fb543-1.wcandillon.cont.tutum.io:81/v1');
        return api.evaluate({
            query: '<foo />'
        }).then(function(result){
            expect(result.body).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<foo/>');
        });
    });

    pit("empty", function() {
        var api = new ZorbaAPI('http://zorba-server-dev-f13fb543-1.wcandillon.cont.tutum.io:81/v1');
        return api.evaluate({
            query: '()'
        }).then(function(result){
            expect(result.body).toBe(undefined);
        });
    });
/*
    pit("binary", function() {
        var api = new ZorbaAPI('http://192.168.99.100:81/v1');
        return api.evaluate({
            query: 'xs:base64Binary("aGVsbG93b3JsZA==")'
        }).then(function(result){
            console.log(result);
        });
    });
    */
});
