// requirements
const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

// grpc service definition
const serviceProtoPath = path.join(__dirname, 'message.proto');
const serviceProtoDefinition = protoLoader.loadSync(serviceProtoPath);
const servicePackageDefinition = grpc.loadPackageDefinition(serviceProtoDefinition).CacheService;

const client = new servicePackageDefinition.CacheRequest('localhost:5000', grpc.credentials.createInsecure());

/*
Using an older version of gRPC?
(1) You won't need the @grpc/proto-loader package
(2) servicePackageDefinition = grpc.loadPackageDefinition(serviceProtoDefinition).CacheService;
(3) const client = new servicePackageDefinition.CacheRequest('localhost:50051', grpc.credentials.createInsecure());
*/

const msgRequest = { _id: 123, func: 'KEY', key: '456', value: '', config: '' };
client.SendMessage(msgRequest, (err, msgReply) => {
    if (err) {
        console.log('That product does not exist.');
    } else {
        console.log(msgReply);
    }
});