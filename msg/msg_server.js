// requirements
const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

// add the events package
var events = require('events');
// add the bookStream global variable
var msgStream = new events.EventEmitter();

// grpc service definition
const serviceProtoPath = path.join(__dirname, 'msg.proto');
const serviceProtoDefinition = protoLoader.loadSync(serviceProtoPath);
const servicePackageDefinition = grpc.loadPackageDefinition(serviceProtoDefinition).MsgPackage;

const _store = [{ val: 789, name: 'Nguyễn Văn Thịnh' }, { val: 3456, name: 'Nguyễn Hoàng Doanh' }];

function sendMessage(call, callback) {
    const m = call.request;
    m.response = Buffer.from(JSON.stringify({ id: m.id, data: _store[0] }));

    console.log('CLIENT: ', m);

    // add the following to the notify method
    msgStream.emit('notify_msg', m);

    setTimeout(function () {
        callback(null, m);
    }, 1000);
}

function listAll(call, callback) {
    const m = call.request;
    m.response = Buffer.from(JSON.stringify(_store));
    callback(null, m);
}



function connectWatcher(call, callback) {
    const m = call.request;
    m.ok = true;
    m.type = 'WATCHER_CONNECT_OK';

    console.log('connectWatcher: ', m);
    msgStream.emit('notify_msg', m);

    //callback(null, m);
    setTimeout(function () {
        callback(null, m);
    }, 1000);
}

function joinWatcher(stream) {

    //console.log('joinWatcher...');
    //stream.write({ ok: false, id: '', type: 'WATCHER_CONNECT_OK', request: null, response: null });
    
    msgStream.on('notify_msg', function (m_) {
        console.log('notify_msg = ', m_);
        stream.write(m_);
    });
}

// main
function main() {
    const server = new grpc.Server();
    // gRPC service
    server.addService(servicePackageDefinition.MsgService.service, {
        Send: sendMessage,
        ListAll: listAll,
        // add the following Watcher method
        ConnectWatcher: connectWatcher,
        Watcher: joinWatcher
    });
    // gRPC server
    server.bind('localhost:5000', grpc.ServerCredentials.createInsecure());
    server.start();
    console.log('gRPC server running at http://127.0.0.1:50051');
}

main();