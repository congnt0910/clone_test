"use strict";

var httpRequest = function () {
    var self = this;
    self.q = require('q');
    self.debug = require('debug')('httpRequest');
    self.request = require('request');
    self.charles = false;//enable charles bug
    self.charles_proxy = 'http://127.0.0.1:8888/';//proxy of charles

    ///////////////////////////INIT////////////////////////////////
    self.default_timeout = 90000;
    self.timeout = null;
    self.certificate = {};
    self.ssl_method = 'SSLv3_method'; //string/ example 'SSLv3_method'
    self.referer = null; //string/ add referer to header;
    self.jsonPost = false; //boolean/ true if post is json request
    self.header = { // default request header
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
        'Accept': "*/*",
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': "gzip, deflate",
        'Connection': 'Close'
    };
    self.append_header = {}; // object / add more header to request
    self.encoding = false;
    self.followRedirect = false;
    self.jar = self.request.jar(); // jar object
    self.request_list = {};
    self.auto_redirect = true;
};

httpRequest.prototype.install_certificate = function (crt_file, ssl_method) {
    var self = this;
    self.certificate.is_certificate = true;
    self.certificate.crt_file = crt_file;
    self.certificate.ssl_method = ssl_method;
};
// httpRequest.prototype.get_cookie = function () {
//     var self = this;
//     return self.jar._jar.store.idx;
// };
// httpRequest.prototype.set_cookie = function (idx) {
//     var self = this;
//     var CookieStore = require('./cookieStore');
//     var cookie = new CookieStore(false, idx);
//     self.jar = self.request.jar(cookie);
// };

//////////////////////////PRIVATE//////////////////////////////

httpRequest.prototype.create_header = function (append_header) {
    var self = this;
    var head = {};
    if (self.referer !== null) {
        head.referer = self.referer;
        self.referer = null;
    }
    var name, value;
    for (name in self.header) {
        if (!self.header.hasOwnProperty(name)) continue;
        value = self.header[name];
        head[name] = value;
    }
    if (typeof append_header === 'object') {
        for (name in append_header) {
            if (!append_header.hasOwnProperty(name)) continue;
            value = append_header[name];
            head[name] = value;
        }
    }
    return head;
};

httpRequest.prototype.make_request = function (url, requestOption) {
    var self = this;
    return self.q.Promise(function (resolve, reject) {
        //default request option
        requestOption.gzip = true;
        requestOption.jar = self.jar;
        requestOption.timeout = self.timeout || self.default_timeout;
        requestOption.followRedirect = self.followRedirect;
        requestOption.followAllRedirects = self.followRedirect;
        requestOption.pool = {maxSockets: Infinity};
        requestOption.tunnel = false;
        requestOption.strictSSL = false;
        //reset default
        self.append_header = {};
        self.timeout = null;
        self.followRedirect = false;
        //other setup
        if (self.ssl_method && url.indexOf('https://') > -1) {
            requestOption.secureProtocol = self.ssl_method;
        }
        if (self.encoding !== false) {
            requestOption.encoding = self.encoding;
            self.encoding = false;
        }
        if (self.charles) {
            requestOption.proxy = self.charles_proxy;
        }
        if (self.certificate.is_certificate) {
            delete requestOption.secureProtocol;
            requestOption.agentOptions = {
                ca: self.certificate.crt_file,
                secureProtocol: self.certificate.ssl_method
            };
            requestOption.strictSSL = true;
        }
        var req = self.request.defaults(requestOption);
        var request_key = new Date().getTime() + '_' + Math.random();
        self.request_list[request_key] = {};
        self.request_list[request_key].domain = require('domain').create();
        //make request
        return self.request_list[request_key].domain.run(function () {
            return self.request_list[request_key].http = req(url, function (err, res, body) {
                delete self.request_list[request_key];
                if (err) {
                    return reject(err);
                }
                if (!self.auto_redirect || !res.headers.location) {
                    self.auto_redirect = true;
                    return resolve({res: res, body: body});
                }
                self.debug('AUTO REDIRECT');
                self.referer = requestOption.headers && requestOption.headers.referer || null;
                return self.get(require('url').resolve(res.request.uri.href, res.headers.location), {})
                    .then(function (page) {
                        return resolve(page);
                    })
                    .catch(function (err) {
                        return reject(err);
                    })
            });
        });
    });
};


//////////////////////////PUBLIC///////////////////////////////
httpRequest.prototype.get = function (url, query, err_info, debug) {
    var self = this;
    self.debug('GET: ' + url);
    if (debug) self.request.debug = true;
    return self.q.Promise(function (resolve, reject) {
        if (typeof query === 'object') {
            var queryString = require('querystring');
            query = queryString.stringify(query);
        }
        if (typeof query === 'string') {
            url += (query.length > 0 ? '?' : '') + query;
        }
        var requestOption = {};
        requestOption.headers = self.create_header(self.append_header);
        return self.make_request(url, requestOption)
            .then(function (page) {
                return resolve(page);
            })
            .catch(function (err) {
                if (typeof err_info == 'object') {
                    err_info.type = 'httpRequest';
                    err_info.request_type = 'GET';
                    err_info.url = url;
                    err.err_info = err_info;
                }
                return reject(err);
            })
    });
};
httpRequest.prototype.post = function (url, post, err_info, debug) {
    var self = this;
    self.debug('POST: ' + url);
    self.debug('POST DATA: \n', JSON.stringify(post, null, 2), '\n');
    if (!debug) debug = false;
    if (debug) self.request.debug = true;
    return self.q.Promise(function (resolve, reject) {
        var body = '';
        if (typeof post === 'object') {
            var queryString = require('querystring');
            body = queryString.stringify(post);
        }
        if (self.jsonPost) {
            self.append_header['Content-Type'] = 'application/json;charset=utf-8';
        } else {
            self.append_header['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        var requestOption = {};
        requestOption.headers = self.create_header(self.append_header);
        requestOption.method = 'POST';
        requestOption.body = body;
        if (self.jsonPost) {
            requestOption.body = post;
            requestOption.json = true;
            self.jsonPost = false;
        }
        self.make_request(url, requestOption)
            .then(function (page) {
                return resolve(page);
            })
            .catch(function (err) {
                if (typeof err_info == 'object') {
                    err_info.type = 'httpRequest';
                    err_info.request_type = 'POST';
                    err_info.url = url;
                    err_info.post = post;
                    err.err_info = err_info;
                }
                return reject(err);
            })
    });
};
httpRequest.prototype.stop = function () {
    var self = this;
    var req_key, req_obj;
    for (req_key in self.request_list) {
        if (!self.request_list.hasOwnProperty(req_key)) continue;
        req_obj = self.request_list[req_key];
        req_obj.http.abort();
        req_obj.domain.dispose();
        delete self.request_list[req_key];
    }
};
//////////////////////////END//////////////////////////////////


module.exports = httpRequest;