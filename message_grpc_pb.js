// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var message_pb = require('./message_pb.js');

function serialize_CacheService_CacheMsgReply(arg) {
  if (!(arg instanceof message_pb.CacheMsgReply)) {
    throw new Error('Expected argument of type CacheService.CacheMsgReply');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_CacheService_CacheMsgReply(buffer_arg) {
  return message_pb.CacheMsgReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_CacheService_CacheMsgRequest(arg) {
  if (!(arg instanceof message_pb.CacheMsgRequest)) {
    throw new Error('Expected argument of type CacheService.CacheMsgRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_CacheService_CacheMsgRequest(buffer_arg) {
  return message_pb.CacheMsgRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var CacheRequestService = exports.CacheRequestService = {
  sendMessage: {
    path: '/CacheService.CacheRequest/SendMessage',
    requestStream: false,
    responseStream: false,
    requestType: message_pb.CacheMsgRequest,
    responseType: message_pb.CacheMsgReply,
    requestSerialize: serialize_CacheService_CacheMsgRequest,
    requestDeserialize: deserialize_CacheService_CacheMsgRequest,
    responseSerialize: serialize_CacheService_CacheMsgReply,
    responseDeserialize: deserialize_CacheService_CacheMsgReply,
  },
};

exports.CacheRequestClient = grpc.makeGenericClientConstructor(CacheRequestService);
