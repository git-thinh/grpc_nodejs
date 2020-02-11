let PORT_HTTP = 4040;
let PORT_GRPC = 4141;

//#region [ REQUIREMENTS ]

const _PATH = require('path');

// LEVEL
const _LEVEL = require('level');

let _DB_CONNECTED = false;
let _DB_DATA;
let _DB_FILE;
let _DB_HEADER;

_LEVEL(_PATH.join(__dirname, 'leveldb\\header'), {
    createIfMissing: true,
    keyEncoding: 'hex',
    valueEncoding: 'base64'
}, function (err1, db1) {
    if (err1) {
        db___on_error(err1);
        return;
    }
    _DB_DATA = _LEVEL(_PATH.join(__dirname, 'leveldb\\data'), {
        createIfMissing: true,
        keyEncoding: 'hex',
        valueEncoding: 'json'
    }, function (err2, db2) {
        if (err2) {
            db___on_error(err2);
            return;
        }
        _DB_FILE = _LEVEL(_PATH.join(__dirname, 'leveldb\\file'), {
            createIfMissing: true,
            keyEncoding: 'hex',
            valueEncoding: 'binary'
        }, function (err3, db3) {
            if (err3) {
                db___on_error(err3);
                return;
            }
            _DB_CONNECTED = true;
            _DB_HEADER = db1;
            _DB_DATA = db2;
            _DB_FILE = db3;
            db___on_ready();
        });
    });
});

// GRPC
const _PROTO_LOADER = require('@grpc/proto-loader');
const _GRPC = require('grpc');

// HTTP
const _HTTP_EXPRESS = require('express');
const _HTTP_BODY_PARSER = require('body-parser');
const _HTTP_APP = _HTTP_EXPRESS();

const _HTTP_SERVER = require('http').createServer(_HTTP_APP);
const _IO = require('socket.io')(_HTTP_SERVER);

// Thread
const { Worker, MessageChannel, workerData } = require('worker_threads');

//#endregion

//#region [ GRPC ]

// grpc service definition
const serviceProtoPath = _PATH.join(__dirname, 'message.proto');
const serviceProtoDefinition = _PROTO_LOADER.loadSync(serviceProtoPath);
const servicePackageDefinition = _GRPC.loadPackageDefinition(serviceProtoDefinition).CacheService;

function sendMessage(call, callback) {
    const _id = call.request._id;
    setTimeout(function () {
        callback(null, { ok: true, _id: _id, data: new Date() });
    }, 3000);
}

// main
function grpc_Start() {
    const server = new _GRPC.Server();
    // gRPC service
    server.addService(servicePackageDefinition.CacheRequest.service, {
        SendMessage: sendMessage
    });
    // gRPC server
    server.bind('localhost:' + PORT_GRPC, _GRPC.ServerCredentials.createInsecure());
    server.start();
    console.log('gRPC server running at http://127.0.0.1:' + PORT_GRPC);
}

//#endregion

//#region [ HTTP ]

let ADDRESS_PORT = {};


_HTTP_APP.use(_HTTP_EXPRESS.static(_PATH.join(__dirname, 'htdocs')));

_HTTP_APP.use(_HTTP_BODY_PARSER.json());
_HTTP_APP.use((error, req, res, next) => {
    if ($.CACHE_STORE.IS_BUSY) {
        return res.json({ ok: false, state: $.CACHE_STORE.STATE, mesage: 'Api is caching ...' });
    }
    if (error !== null) {
        return res.json({ ok: false, mesage: 'Invalid json ' + error.toString() });
    }
    return next();
});

_HTTP_APP.get('/info', function (req, res) {
    res.json({
        ok: true,
        http: {
            port: PORT_HTTP
        },
        grpc: {
            port: PORT_GRPC
        }
    });
});

const http___Start = () => {

    _HTTP_SERVER.listen(PORT_HTTP, '127.0.0.1', () => {
        ADDRESS_PORT = _HTTP_SERVER.address();
        console.log('HTTP_API: ', ADDRESS_PORT);
        http___on_ready();
    });

    _IO.on('connection', client => {
        //if (___CACHE_DONE == false) return;

        //const c = client.handshake.headers.cookie;
        //let uid = '';
        //if (c && c.indexOf('user_id=') != -1) {
        //    const pos = c.indexOf('user_id=') + 8;
        //    uid = c.substr(pos, c.length - pos).split(';')[0].trim();
        //}
        //console.log(uid);

        let user_id;

        client.on('push', data => {
            //if (___CACHE_DONE == false) return;

            //if (user_id == null) ___users_socketio[data.id] = client;
            //user_id = data.id;

            //if (___users_online[user_id] == null || ___users_online[user_id] == 0) {
            //    ___users_online[user_id] = 1;

            //    db___execute_callback(null, null, 'mobile.user_biz_update_user', {
            //        user_id: user_id,
            //        int_type: 1,
            //        int_pol_status: data.status,
            //        int_pol_region: 0,
            //        int_user_create: user_id
            //    }, function (m_) {
            //    }, function (m_) {
            //    });
            //}
        });

        client.on('disconnect', (data) => {
            //if (___CACHE_DONE == false) return;

            //if (user_id != null && ___users_online[user_id] != null) {
            //    //console.log('IO.CLOSE: ...11111111111111111111111111111111111', user_id, data);

            //    ___users_online[user_id] = 0;

            //    db___execute_callback(null, null, 'mobile.user_biz_update_user', {
            //        user_id: user_id,
            //        int_type: 1,
            //        int_pol_status: 0,
            //        int_pol_region: 0,
            //        int_user_create: user_id
            //    }, function (m_) {
            //        //console.log('OK=', m_);
            //    }, function (m_) {
            //        //console.log('FAIL=', m_);
            //    });

            //}
            //if (___users_socketio[user_id]) ___users_socketio[user_id] == null;
        });
    });
};

//#endregion

//#region [ THREAD SQL ]

//const worker = new Worker('./thread-http.js', { workerData: it_ });
//worker.on('message', (message) => { ___thread_onMessage_cacheObject(message); });
//const cacheChannel = new MessageChannel();
//worker.postMessage({ cache_port: cacheChannel.port1 }, [cacheChannel.port1]);
//cacheChannel.port2.on('message', (m_) => { ___thread_cacheRequest(m_); });
//_threads.push({ worker: worker, cache_channel: cacheChannel });

//#endregion

const http___on_ready = () => {

};

const db___on_ready = () => {
    grpc_Start();
    http___Start();
};

const db___on_error = (err) => console.log('ERROR_DB: ', err);
