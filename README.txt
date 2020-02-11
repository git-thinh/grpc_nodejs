node --max-old-space-size=4096 app.js

npm install grpc
npm install @grpc/proto-loader
npm install -g grpc-tools

npm install level --save
npm install dotenv mssql cron body-parser express socket.io lodash node-fetch -S


protoc.exe --js_out=import_style=commonjs,binary:. --grpc_out=. --plugin=protoc-gen-grpc=grpc_node_plugin.exe message.proto



