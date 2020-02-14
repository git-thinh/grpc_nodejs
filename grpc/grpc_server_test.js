
//#region [ LOG ]

let _LOG = require('./log-singleton.js');
_LOG.f_setup_update();

const SCOPE = 'GRPC_SERVER';
const ___log = (...agrs) => { if (_LOG) _LOG.f_write('INFO', SCOPE, '', ...agrs); }
const ___log_key = (key, ...agrs) => { if (_LOG) _LOG.f_write('INFO', SCOPE, key, ...agrs); }
const ___log_error = (key, ...agrs) => { if (_LOG) _LOG.f_write('ERR', SCOPE, key, ...agrs); }
const ___log_clear = () => _LOG.f_console_clear();
//console.log = (...agrs) => ___log_key(SCOPE, ...agrs);

___log_clear();
___log('LOG_TEST_OK');

//#endregion

const mssql = require('./grpc_server.js');
mssql.f_start({
    name: 'SERVER_GRPC',
    ip: '0.0.0.0',
    port: 5001
}, (is_connect_, state_) => {
    // Event state change
    ___log_key('SERVER_GRPC', 'CONNECT = ' + is_connect_ + '; STATE = ' + state_);
}, (m_) => {
    // Event receiver messages from clients
    ___log_key('SERVER_GRPC', 'SEND_RESULT_CALLBACK = ', m_);
});

//Read terminal Lines
const _READ_LINE = require("readline");
const _RL = _READ_LINE.createInterface({
    input: process.stdin,
    output: process.stdout
});
_RL.on("line", function (text) {
    switch (text) {
        case 'exit':
            process.exit();
            break;
        case 'cls':
            console.clear();
            ___log_clear();
            break;
        default:
            broadCast({ sender: 'CACHE', receiver: '*', text: text });
            break;
    }
});