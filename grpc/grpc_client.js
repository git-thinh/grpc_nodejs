let grpc_client = function grpc_client() {    
    let _CONFIG = { name: 'GRPC_CLIENT', ip: '0.0.0.0', port: 5001 };

    //#region [ VARIABLE ]

    const $ = this;

    const _UUID = require("uuid");
    const _JOB = require('cron').CronJob;
     
    const _GRPC = require("grpc");
    const _PROTO_LOADER = require("@grpc/proto-loader");

    let _INITED = false;
    let _CONNECTED = false;
    let _STATE = 'NONE';
    
    const _SESSION_ID = _UUID.v4();

    let _CLIENT = null;
    let _CHANNEL;
    let _PROTO = null;

    this.on_state = null;
    this.on_send_callback = null;

    //#endregion

    const notify___on_message = (m) => {
        switch (m.type) {
            case 'JOIN_NEW_CONNECT_OK':
                _CONNECTED = true;
                _STATE = 'CONNECT_OK';
                setTimeout(function () { $.on_state(true, _STATE); });
                break;
            default:
                if ($.on_send_callback) $.on_send_callback(null, m);
                break;
        }
    };

    const notify___on_error = (err) => {         
        console.log('ERROR DISCONNECT TO SERVER ...');

        if (_CONNECTED) {
            _CONNECTED = false;
            _STATE = 'SERVER_DISCONNECT';
            setTimeout(function () { $.on_state(false, _STATE); });
        }
    };

    const f_init = () => {
        //Load the protobuf
        _PROTO = _GRPC.loadPackageDefinition(
            _PROTO_LOADER.loadSync("grpc_msg.proto", {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            })
        );

        //Create gRPC client
        _CLIENT = new _PROTO.MessageEngine.MessageBroker(_CONFIG.ip + ':' + _CONFIG.port, _GRPC.credentials.createInsecure());        
    };

    this.f_start = function (config, on_state_callback_, on_send_callback_) {
        if (config != null) _CONFIG = config;
        if (this.on_state == null) this.on_state = on_state_callback_;
        if (this.on_send_callback == null) this.on_send_callback = on_send_callback_;

        if (_INITED == false) {
            _INITED = true;
            f_init();
        }

        _CHANNEL = _CLIENT.streamMessage({});
        _CHANNEL.on('error', notify___on_error);
        _CHANNEL.on('data', notify___on_message);    
        _CHANNEL.write({ sender: _SESSION_ID, type: 'JOIN_NEW_CONNECT' });        
    };

    this.f_broad_cast_text = (text) => {
        if (_CONNECTED)
            _CHANNEL.write({ sender: _SESSION_ID, type: 'BROADCAST_ALL', text: text });
    };

    this.f_send_text = (text, callback) => {
        if (_CONNECTED)
            _CLIENT.sendMessage({ sender: _SESSION_ID, text: text }, callback);
        else
            callback({ ok: false, message: 'Disconnect to ' + REMOTE_SERVER_GRPC }, null);
    };

    new _JOB('*/2 * * * * *', function () {
        if (_CONNECTED == false) {
            //$.f_start();
        }
    }).start();
     
    //--------------------------------------------------------------------------------------------    
};

grpc_client.instance = null;
grpc_client.getInstance = function () {
    if (this.instance === null) this.instance = new grpc_client();
    return this.instance;
};
module.exports = grpc_client.getInstance();