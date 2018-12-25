var express = require("express");
var host = express();
var app = express();
var api = express();

app.get('/', (req, res) => {
    console.log('app');
    
    res.send(req.headers);
})

api.get('/', (req, res) => {
    console.log('api');
    
    res.send(req.headers);
})

const vhost = (subdomain, app) => (req, res, next) => {
    let host = req.headers.host.split(':')[0];
    if (host.startsWith(subdomain)) {
        return app(req, res, next);
    } else {
        next();
    }
}

host.use(vhost('api', api))

host.get('*', (req, res) => {
    res.send('Duong dan ko ton tai');
})

host.listen(3000, () => console.log('running'));