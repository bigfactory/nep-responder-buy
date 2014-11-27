var zlib    = require('zlib');
var fs      = require('fs');
var stream  = require('stream');

var iconv   = require('iconv-lite');
var cheerio = require('cheerio');
var mime    = require('mime')
var request = require('nep-request');

module.exports = function(req, res, next, data) {

    var options = data.options;

    forward(req, function(err, buffer, proxyRes){
        zlib.gunzip(buffer, function(err, content){
            
            var charset = options.charset || 'utf8';
            var $, data, tpl;

            content = iconv.decode(content, 'gbk');
            tpl = fs.readFileSync(options.tpl);

            if( charset!= 'utf8'){
                tpl = iconv.decode(tpl, charset);
            }
            else{
                tpl = tpl.toString('utf8');
            }

            $ = cheerio.load(content);
            data = $('.J_Page').next('script').text();
            content = tpl.replace('#OrderData#', data);
            res.set('content-type', mime.lookup('.html') + '; charset=gbk');
            content = iconv.encode(content, 'gbk');
            res.send(content);
        });
    });
}

function forward(req, callback) {
    var url = req.url;
    var options = {
        url: url,
        method: req.method,
        headers: req.headers
    }
    var buffers = [];


    req.on('data', function(chunk) {
        buffers.push(chunk);
    });

    req.on('end', function() {
        options.data = Buffer.concat(buffers);
        request(options, callback);
    });


}