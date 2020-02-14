let mssql_client = function mssql_client() {
    const REMOTE_SERVER_GRPC = "0.0.0.0:5001";

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
        $.___log_key('NOTIFY___ON_MESSAGE: m = ', m);
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
            _PROTO_LOADER.loadSync("message.proto", {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            })
        );

        //Create gRPC client
        _CLIENT = new _PROTO.MessageEngine.MessageBroker(REMOTE_SERVER_GRPC, _GRPC.credentials.createInsecure());        
    };

    this.f_start = function (on_state_callback_, on_send_callback_) {
        if (this.on_state == null) this.on_state = on_state_callback_;
        if (this.on_send_callback == null) this.on_send_callback = on_send_callback_;

        if (_INITED == false) {
            _INITED = true;

            if ($.___log == null) $.___log = (...agrs) => { }
            if ($.___log_key == null) $.___log_key = (key, ...agrs) => { }
            if ($.___log_error == null) $.___log_error = (key, ...agrs) => { }

            f_init();
        }

        _CHANNEL = _CLIENT.streamMessage({});
        _CHANNEL.on('error', notify___on_error);
        _CHANNEL.on('data', notify___on_message);    
        _CHANNEL.write({ id: _SESSION_ID, type: 'JOIN_NEW_CONNECT' });        
    };

    this.f_send_text = (text) => {
        if (_CONNECTED)
            _CHANNEL.write({ id: _SESSION_ID, text: text });
        else
            if ($.on_send_callback)
                $.on_send_callback({ ok: false, message: 'Disconnect to ' + REMOTE_SERVER_GRPC });
    };

    new _JOB('*/2 * * * * *', function () {
        if (_CONNECTED == false) {
            //$.f_start();
        }
    }).start();
     
    //--------------------------------------------------------------------------------------------    
};

mssql_client.instance = null;
mssql_client.getInstance = function () {
    if (this.instance === null) this.instance = new mssql_client();
    return this.instance;
};
module.exports = mssql_client.getInstance();