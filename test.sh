#!/bin/bash

set -e

DIR=$(dirname "$0")

cd $DIR

rm -rf "${DIR}/gen"
mkdir "${DIR}/gen"
bun run clean
bun run build
 
protoc -I . \
  --plugin="protoc-gen-connect-ts=${DIR}/bin/protoc-gen-connect-ts" \
  --connect-ts_out="${DIR}/gen" \
  --connect-ts_opt=target="ts" \
  eliza.proto

cat ${DIR}/gen/eliza_connect.ts
