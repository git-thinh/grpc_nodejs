// requirements
const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

// grpc service definition
const serviceProtoPath = path.join(__dirname, 'message.proto');
const serviceProtoDefinition = protoLoader.loadSync(serviceProtoPath);
const servicePackageDefinition = grpc.loadPackageDefinition(serviceProtoDefinition).CacheService;

/*
Using an older version of gRPC?
(1) You won't need the @grpc/proto-loader package
(2) const servicePackageDefinition = grpc.loadPackageDefinition(serviceProtoDefinition).CacheService;
*/

function sendMessage(call, callback) {
    const _id = call.request._id;
    setTimeout(function () {
        callback(null, { ok: true, _id: _id, data: new Date() });
    }, 3000);
}

// main
function main() {
    const server = new grpc.Server();
    // gRPC service
    server.addService(servicePackageDefinition.CacheRequest.service, {
        SendMessage: sendMessage
    });
    // gRPC server
    server.bind('localhost:5000', grpc.ServerCredentials.createInsecure());
    server.start();
    console.log('gRPC server running at http://127.0.0.1:50051');
}

main();