let grpc_server = function grpc_server() {
    let _CONFIG = { name: 'GRPC_SERVER', ip: '0.0.0.0', port: 5001 };

    //#region [ VARIABLE ]

    const $ = this;

    const _JOB = require('cron').CronJob;

    const _GRPC = require("grpc");
    const _PROTO_LOADER = require("@grpc/proto-loader");
    let _SERVER;

    const _MSG = [];
    let _INITED = false;
    let _OPENED = false;
    let _STATE = 'NONE';

    let _CHANNEL;
    let _PROTO = null;

    this.on_state = null;
    this.on_msg_receive_callback = null;

    //#endregion

    const _USERS = {};
    const user___Disconect = (sender_id) => {
        if (_USERS[sender_id]) delete _USERS[sender_id];
    };
    const sendMessage = (call, callback) => {
        const m = call.request;
        m.ok = false;
        m.waiting = true;
        _MSG.push(m);
        callback(null, m);
    };

    function streamMessage(call) {

        let session_id = null;

        //__log('SERVER_STREAM_MESSAGE: ...');

        call.on('data', (m) => {
            switch (m.type) {
                case 'JOIN_NEW_CONNECT':
                    if (m && m.sender && m.sender.length > 0) {
                        console.log('SERVER_STREAM_MESSAGE: JOIN_NEW_CONNECT = ', m.sender);
                        session_id = m.sender;
                        _USERS[m.sender] = call;
                        m.type = 'JOIN_NEW_CONNECT_OK';
                        call.write(m);
                    }
                    break;
                case 'BROADCAST_ALL':
                default:
                    _MSG.push(m);
                    break;
            }
        });

        call.on('error', (err) => {
            user___Disconect(session_id);
            //console.log('SERVER_STREAM_MESSAGE: ', session_id, ' error = ', Object.keys(_USERS));
        });

        call.on('cancelled', () => {
            user___Disconect(session_id);
            //console.log('SERVER_STREAM_MESSAGE -> CANCELLED: ', session_id, call.cancelled, call.finished, call.reading);
        });

        call.on('end', () => {
            user___Disconect(session_id);
            //console.log('SERVER_STREAM_MESSAGE -> END: ', session_id, call.cancelled, call.finished, call.reading, Object.keys(_USERS));
            setImmediate(() => {
                //console.log('SERVER_STREAM_MESSAGE -> END -> REQUEST CANCELLED: ', session_id, call.cancelled); // true
            });
        });
    }

    function messageReply(m) {
        if (m && _USERS[m.sender]) _USERS[m.sender].write(m);
    }

    function broadCast_not_ItSelf(message, sender_) {
        const a = Object.keys(_USERS);
        a.forEach(sender => {
            if (sender != sender_) _USERS[id].write(message);
        });
    }

    function broadCast(message) {
        Object.values(_USERS).forEach(user => {
            user.write(message);
        });
    }

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

        _SERVER = new _GRPC.Server();

        // Define server with the methods and start it
        _SERVER.addService(_PROTO.MessageEngine.MessageBroker.service, {
            streamMessage: streamMessage,
            sendMessage: sendMessage
        });
    };

    this.f_start = function (config, on_state_callback_, on_msg_receive_callback_) {
        if (config != null) _CONFIG = config;

        if (this.on_state == null) this.on_state = on_state_callback_;
        if (this.on_msg_receive_callback == null) this.on_msg_receive_callback = on_msg_receive_callback_;

        if (_INITED == false) {
            _INITED = true;

            f_init();
        }

        _SERVER.bind(_CONFIG.ip + ':' + _CONFIG.port, _GRPC.ServerCredentials.createInsecure());
        _SERVER.start();
        _STATE = 'OPENED';
        _OPENED = true;
    };

    this.f_send_text = (text) => {
        if (_OPENED)
            _CHANNEL.write({ sender: _SESSION_ID, text: text });
        else
            if ($.on_msg_receive_callback)
                $.on_msg_receive_callback({ ok: false, message: 'Disconnect to ' + REMOTE_SERVER_GRPC });
    };

    new _JOB('* * * * * *', function () {
        if (_MSG.length > 0) {
            const m = _MSG.shift();
            switch (m.type) {
                case 'BROADCAST_ALL':
                    m.notify = true;
                    broadCast(m);
                    break;
                default:
                    $.on_msg_receive_callback(m);
                    break;
            }
        }
    }).start();

    //--------------------------------------------------------------------------------------------    
};

grpc_server.instance = null;
grpc_server.getInstance = function () {
    if (this.instance === null) this.instance = new grpc_server();
    return this.instance;
};
module.exports = grpc_server.getInstance();