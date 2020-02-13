let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
var uuid = require("uuid");

//Read terminal Lines
var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Load the protobuf
var proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("noti.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

const REMOTE_SERVER = "0.0.0.0:5001";

let ___id = null;
let username = new Date().getTime().toString();

//Create gRPC client
let client = new proto.CacheEngine.Notify(
    REMOTE_SERVER,
    grpc.credentials.createInsecure()
);

//Start the stream between server and client
function app___Start() {
    let channel = client.join({ sender: username });
    channel.on("error", (err) => {
        console.log('ERROR DISCONNECT TO SERVER ...');
    });
    channel.on("data", onData);

    rl.on("line", function (text) {
        switch (text) {
            case 'exit':
                process.exit();
                break;
            case 'cls':
                console.clear();
                break;
            default:
                client.send({ id: ___id, sender: username, text: text }, (err, m_) => { });
                break;
        }
    });

    //client.send({ id: ___id, sender: username, text: 'LOGIN' }, (err, m_) => { });
}

//When server send a message
function onData(m) {

    switch (m.type) {
        case 'SET_SESSION_ID':
            ___id = m.id;
            console.log(m.type, m.id);
            break;
        case 'WELCOME_NEW_USER_JOINED':
            console.log(m.type, m.id);
            break;
        default:
            if (___id == null || ___id == m.id) return;
            let ok = false;
            if (m.receiver == "*" || (m.receiver && m.receiver.indexOf(___id) != -1)) ok = true;

            if (ok) {
                console.log('NOTIFY_OK = ', m);
            } else {
                console.log('NOTIFY_?? = ', m);
            }

            break;
    }
}

////Ask user name then start the chat
//rl.question("What's ur name? ", answer => {
//    username = answer; 
//    startChat();
//}); 
app___Start();