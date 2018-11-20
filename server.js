var http = require('http');
var fs = require('fs');
var url = require('url');
var path   = require('path');
var mime = require('./mime').mime;
var querystring=require("querystring");

http.createServer(function (request, response){
    // 解析请求，包括文件名
    var pathname = url.parse(request.url).pathname;
    var str = url.parse(request.url, true).query;  
    var arg = querystring.parse(url.parse(request.url).query);

    // 输出请求的文件名
    console.log("Request for " + pathname + " received.");

    if (pathname == '/userInfoQuery') {
        var options = { 
            hostname: 'cpadisc7.cpad.gov.cn',
            path: '/cpad_new/api/common/doQuery',
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                'token': 'O9k4Zyv492pXnApKr5ET4c4irDLl9F9PgOaLiSvovWk1/O1uK/qoNjzlu22oFzvP',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
            }
        };
        var params = JSON.stringify({
            body: {
                MeasureList: {
                    conditions: {
                        aac001: arg.id,
                        aar040: 2018
                    },
                    namespace: 'com.neusoft.biz.core.mapping.Cr05Mapper',
                    sqlId: 'querypoorfamily'
                },
                BasicSituationList:{
                    conditions: {
                        aac001: arg.id,
                        aar040: 2018
                    },
                    namespace: 'com.neusoft.biz.core.mapping.Ac01Mapper',
                    sqlId: 'selectAC01AC40'
                },
                LivingConditionList:{
                    conditions: {
                        aac001: arg.id,
                        aar040: 2018
                    },
                    namespace: 'com.neusoft.biz.core.mapping.Ac30Mapper',
                    sqlId: 'selectAc30'
                },
                TwinningList:{
                    conditions: {
                        aac001: arg.id,
                        aar040: 2018
                    },
                    namespace: 'com.neusoft.biz.core.mapping.Ak11Mapper',
                    sqlId: 'relatedResponsiblePerson'
                },
                IncomeInfoList:{
                    conditions: {
                        aac001: arg.id,
                        aar040: 2018
                    },
                    namespace: 'com.neusoft.biz.core.mapping.Ac07Mapper',
                    sqlId: 'selectAc07'
                }
            },
            options: {
                OPT: 'query',
                type: 'dao'
            }
        });
        var req = http.request(options, function(res) {
            var data = '',
                result;
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                response.setHeader('Content-Type','text/javascript;charset=UTF-8');
                response.write(data);
                //  发送响应数据
                response.end();
            }); 
        });

        req.on('error', function(e) {
            //TODO
        });

        req.write(params);

        req.end();
    } else {
        // 从文件系统中读取请求的文件内容
        fs.readFile(pathname.substr(1), function (err, data) {
            if (err) {
                console.log(err);
                // HTTP 状态码: 404 : NOT FOUND
                // Content Type: text/plain
                response.writeHead(404, {'Content-Type': 'text/html'});
            }else{
                // 获取文件扩展名(包含前置.)    
                var extname = path.extname(pathname);    
                var type = extname.slice(1);  
                if ( extname === '' ) {    
                    response.writeHead(200, {'Content-Type':'text/html'});    
                    response.write(data);   
                } else {    
                    response.writeHead(200, {'Content-Type': mime[type]});    
                    response.write(data, 'binary');     
                }    
            }
            //  发送响应数据
            response.end();
        });
    }
}).listen(8883);

// 控制台会输出以下信息
console.log('Server running at http://127.0.0.1:8883/');