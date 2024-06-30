## protoc-gen-connect-ts

A stricter version of `protoc-gen-connect-es`

#### Installation

```bash
npm i --save-dev @romnn/protoc-gen-connect-ts
```

#### Usage

The following assumes you have installed `@romnn/protoc-gen-connect-ts` into your projects `node_modules` in your project root.

With `protoc`:

```bash
protoc -I . \
  --plugin="protoc-gen-connect-ts=node_modules/.bin/protoc-gen-connect-ts" \
  --connect-ts_out="./gen" \
  --connect-ts_opt=target="ts" \
  myproto.proto
```

With [buf](https://github.com/bufbuild/buf) in your `buf.gen.yaml`:

```yaml
version: v2
managed:
  enabled: true
plugins:
  - local: ./node_modules/.bin/protoc-gen-connect-ts
    opt: target=ts,ts_nocheck=false
    out: gen/
```

#### Development

```
bun install
bun run build
./test.sh
```
