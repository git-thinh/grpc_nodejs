// requirements
const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

var readline = require("readline");
//Read terminal Lines
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// grpc service definition
const serviceProtoPath = path.join(__dirname, 'msg.proto');
const serviceProtoDefinition = protoLoader.loadSync(serviceProtoPath);
const servicePackageDefinition = grpc.loadPackageDefinition(serviceProtoDefinition).MsgPackage;

let client, channel;

//const grpc___start = async () => {
//    return new Promise(function (resolve, reject) {

client = new servicePackageDefinition.MsgService('localhost:5000', grpc.credentials.createInsecure());
channel = client.Watcher({});
channel.on("error", (err) => {
    console.log('ERROR DISCONNECT TO SERVER ...');
});
channel.on("data", (m_) => {
    // if (m_.id == 99) return; // if is itself, then break;
    console.log('NOTIFY ', m_);
});
channel.on("open", () => {
    // if (m_.id == 99) return; // if is itself, then break;
    console.log('NOTIFY OPENED ...');
});
client.Send({ ok: false, id: '12345', type: 'WATCHER_CONNECT_OK', request: null, response: null }, (err, m_) => { });

//    });
//};


//const retry = require('async-retry')

//retry(async bail => {
//    // if anything throws, we retry
//    const res = await fetch('https://google.com')

//    if (403 === res.status) {
//        // don't retry upon 403
//        bail(new Error('Unauthorized'))
//        return
//    }

//    const data = await res.text()
//    return data.substr(0, 500)
//}, {
//    retries: 5
//})


rl.on("line", function (text) {
    switch (text) {
        case 'exit':
            console.log('EXIT ...');
            //rl.close();
            //client.close();
            process.exit();
            break;
        case 'all':
            client.ListAll(msgRequest, (err, m_) => {
                if (err) {
                    //console.log(err);
                } else {
                    console.log('ALL = ', JSON.parse(m_.response));
                }
            });
            break;
        default:
            //const msgRequest = { ok: false, id: 'Nguyễn Cẩm Tú', request: null, response: null };
            const msgRequest = { ok: false, id: text, request: null, response: null };
            client.Send(msgRequest, (err, m_) => {
                if (err) {
                    //console.log(err);
                } else {
                    //console.log(r);
                    console.log('SEND = ', JSON.parse(m_.response));
                }
            });
            break;
    }
});

