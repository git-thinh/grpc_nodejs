
const _JOB = require('cron').CronJob;
var uuid = require("uuid");

let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");

const APP_NAME = 'MSSQL_SERVER';

//Read terminal Lines
var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const server = new grpc.Server();
const SERVER_ADDRESS = "0.0.0.0:5001";

// Load protobuf
let proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("message.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

const _MSG = [];
const _USERS = {};
const user___Disconect = (id) => {
    if (_USERS[id]) delete _USERS[id];
};
function streamMessage(call) {
    let session_id = null;

    console.log('SERVER_STREAM_MESSAGE: ...');

    call.on('data', (m) => {
        console.log('SERVER_STREAM_MESSAGE: m = ', m);
        if (m && m.id && m.id.length > 0 && m.type == 'JOIN_NEW_CONNECT') {
            session_id = m.id;
            _USERS[m.id] = call;
            m.type = 'JOIN_NEW_CONNECT_OK';
            call.write(m);
        } else {
            _MSG.push(m);
        }
    });

    call.on('error', (err) => {
        user___Disconect(session_id);
        console.log('SERVER_STREAM_MESSAGE: ', session_id, ' error = ', err);
    });

    call.on('cancelled', () => {
        user___Disconect(session_id);
        console.log('SERVER_STREAM_MESSAGE -> CANCELLED: ', session_id,  call.cancelled, call.finished, call.reading);
    });

    call.on('end', () => {
        user___Disconect(session_id);
        console.log('SERVER_STREAM_MESSAGE -> END: ', session_id,  call.cancelled, call.finished, call.reading);
        setImmediate(() => {
            console.log('SERVER_STREAM_MESSAGE -> END -> REQUEST CANCELLED: ', session_id,  call.cancelled); // true
        });
    });
}

function removeUser(call, callback) {
    const m = call.request;

    let ok = false;
    if (m.id && m.id.length > 0 && _USERS[m.id]) {
        delete _USERS[m.id];
        ok = true;
    }

    console.log('remove user: ' + m.id + ' -> ', Object.keys(_USERS));

    callback(null, ok);
}

function joinUser(call, callback) {
    const m = call.request;

    let ok = false;
    if (m.id && m.id.length > 0 && _USERS[m.text]) {
        _IDS.push(m.id);
        _USERS[m.id] = _USERS[m.text]
        delete _USERS[m.text];
        ok = true;
    }

    console.log('join: ' + m.text + ' -> ' + m.id, Object.keys(_USERS));

    callback(null, ok);

    //call.write({ sender: APP_NAME, id: id, type: 'CONNECT_OK' });
    //call.write({ sender: 'CACHE', id: id, type: 'SET_SESSION_ID' });
    //broadCast({ sender: 'CACHE', id: id, type: 'WELCOME_NEW_USER_JOINED' });
}

// Receive message from client
function sendMessage(call, callback) {
    const m = call.request;
    console.log(m);
    broadCast_not_ItSelf(m);
}

function getBuffer(call, callback) {
    const m = call.request;
    console.log(m);
    callback(null, m);
}

function streamBuffer(call) {
    const m = {};
    call.on('data', (data) => {
        console.log('server: got data', data);
    });

    call.on('error', (err) => {
        console.log('server: got error', err);
    });

    call.on('cancelled', () => {
        console.log('server: request cancelled', call.cancelled, call.finished, call.reading);
    });

    call.on('end', () => {
        console.log('server: request ended', call.cancelled, call.finished, call.reading);

        setImmediate(() => {
            console.log('request cancelled', call.cancelled); // true
        });
    });
}

function messageReply(m) {
    if (m && _USERS[m.id]) _USERS[m.id].write(m);
}

function broadCast_not_ItSelf(message, id_) {
    const a = Object.keys(_USERS);
    a.forEach(id => {
        if (id != id_) _USERS[id].write(message);
    });
}

function broadCast(message) {
    Object.values(_USERS).forEach(user => {
        user.write(message);
    });
}

function app___Start() {

    new _JOB('* * * * * *', function () {
        if (_MSG.length > 0) {
            const m = _MSG.shift();
            m.ok = true;
            messageReply(m);
        }
    }).start();

    // Define server with the methods and start it
    server.addService(proto.MessageEngine.MessageBroker.service, {
        streamMessage: streamMessage,
        joinUser: joinUser,
        removeUser: removeUser,
        sendMessage: sendMessage,
        streamBuffer: streamBuffer,
        getBuffer: getBuffer
    });
    server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
    server.start();

    rl.on("line", function (text) {
        switch (text) {
            case 'exit':
                process.exit();
                break;
            case 'cls':
                console.clear();
                break;
            default:
                broadCast({ sender: 'CACHE', receiver: '*', text: text });
                break;
        }
    });

    //client.send({ id: ___id, sender: username, text: 'LOGIN' }, (err, m_) => { });
}

app___Start();

//for client call sendBuffer
////const grpc = require('grpc');
////const PROTO_PATH = __dirname + '/depot.proto';
////const protoDescriptor = grpc.load(PROTO_PATH);
////const depot = protoDescriptor.depot;

////const client = new depot.Depot('localhost:50051', grpc.credentials.createInsecure());

////const call = client.streamBuffer((err, data) => {
////    if (err) {
////        console.log(err);
////        return;
////    }
////    console.log('got data', data);
////});

////call.write({ id: '1', data: new Uint8Array([0]) });

////setTimeout(() => {
////    call.cancel(new Error('there was an error'));
////}, 3000);