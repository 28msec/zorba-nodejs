'use strict';

require('jasmine2-pit');

var ZorbaAPI = require('../lib/zorba-api').ZorbaAPI;

describe("Test Arithmetic Operation: ", function() {
    pit("add(1, 1)", function() {
        var api = new ZorbaAPI('http://192.168.99.100:81/v1');
        return api.evaluate({
            query: '1 + 1'
        }).then(function(result){
            expect(result.response.body).toBe('2');
        });
    });
});