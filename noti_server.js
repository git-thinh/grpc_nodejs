let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
var uuid = require("uuid");

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
    protoLoader.loadSync("noti.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

let users = {};

// Receive message from client joining
function join(call, callback) {
    const id = uuid.v4();
    users[id] = call;

    call.write({ sender: 'CACHE', id: id, type: 'SET_SESSION_ID' });
    broadCast({ sender: 'CACHE', id: id, type: 'WELCOME_NEW_USER_JOINED' });
}

// Receive message from client
function send(call, callback) {
    const m = call.request;
    console.log(m);
    broadCast_not_ItSelf(m);
}


function broadCast_not_ItSelf(message, id_) {
    const a = Object.keys(users);
    a.forEach(id => {
        if (id != id_) users[id].write(message);
    });
}

function broadCast(message) {
    Object.values(users).forEach(user => {
        user.write(message);
    });
}

function app___Start() {
    // Define server with the methods and start it
    server.addService(proto.CacheEngine.Notify.service, { join: join, send: send });
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