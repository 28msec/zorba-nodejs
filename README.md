# Zorba Node Binding
[![Circle CI](https://circleci.com/gh/28msec/zorba-nodejs.svg?style=svg)](https://circleci.com/gh/28msec/zorba-nodejs)

## Install

```bash
$npm install zorba-nodejs
```

## Usage

```javascript
var ZorbaAPI = require('zorba-nodejs').ZorbaAPI;

var api = new ZorbaAPI('http://localhost/v1');
api.evaluate({
    query: '1 + 1'
}).then(function(result){
    console.log(result.body);
});
```

An endpoint for testing is available at http://zorba-server-dev-f13fb543-1.wcandillon.cont.tutum.io:81. It is based on the image docker image at https://hub.docker.com/r/wcandillon/zorba-server-dev/
```javascript
var api = new ZorbaAPI('http://zorba-server-dev-f13fb543-1.wcandillon.cont.tutum.io:81');
```
