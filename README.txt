node --max-old-space-size=4096 app.js

npm install grpc
npm install @grpc/proto-loader
npm install -g grpc-tools


protoc.exe --js_out=import_style=commonjs,binary:. --grpc_out=. --plugin=protoc-gen-grpc=grpc_node_plugin.exe message.proto



