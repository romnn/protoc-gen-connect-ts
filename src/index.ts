import * as util from "util";
import type { DescService } from "@bufbuild/protobuf";
import { MethodIdempotency, MethodKind } from "@bufbuild/protobuf";
import type { GeneratedFile, Schema } from "@bufbuild/protoplugin/ecmascript";
import { localName } from "@bufbuild/protoplugin/ecmascript";
import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { version } from "../package.json";

export function generateJs(_: Schema) {
  throw new Error("generating JS is not supported, only ts");
}

export function generateDts(_: Schema) {
  throw new Error("generating d.ts is not supported, only ts");
}

export function generateTs(schema: Schema) {
  for (const protoFile of schema.files) {
    const file = schema.generateFile(protoFile.name + "_connect.ts");
    file.preamble(protoFile);
    for (const service of protoFile.services) {
      generateService(schema, file, service);
    }
  }
}

// prettier-ignore
function generateService(
  schema: Schema,
  f: GeneratedFile,
  service: DescService
) {
  const { MethodKind: rtMethodKind, MethodIdempotency: rtMethodIdempotency } =
    schema.runtime;
  // console.log(rtMethodKind);
  // console.log(rtMethodIdempotency);
  f.print(f.jsDoc(service));
  f.print(f.exportDecl("const", localName(service)), " = {");
  f.print("  typeName: ", f.string(service.typeName), ",");

  f.print("  methods: {");
  for (const method of service.methods) {
    f.print(f.jsDoc(method, "    "));
    f.print("    ", localName(method), ": {");
    f.print("      name: ", f.string(method.name), ",");
    f.print("      I: ", method.input, ",");
    f.print("      O: ", method.output, ",");
    f.print(
      "      kind: ",
      rtMethodKind,
      ".",
      MethodKind[method.methodKind],
      ","
    );
    if (method.idempotency !== undefined) {
      f.print(
        "      idempotency: ",
        rtMethodIdempotency,
        ".",
        MethodIdempotency[method.idempotency],
        ","
      );
    }
    // In case we start supporting options, we have to surface them here
    f.print("    },");
  }
  f.print("  }");
  f.print("} as const;");
  f.print();

  f.print(`import {type HandlerContext} from "@connectrpc/connect"`);

  // export interface
  f.print(f.exportDecl("interface", localName(service) + "Impl"), "  {");
  for (const method of service.methods) {
    console.error(util.inspect(method.proto.options))
    f.print();
    f.print(f.jsDoc(method, "    "));
    switch (method.methodKind) {
      case MethodKind.Unary: {
        // f.print("    ", localName(method), ": UnaryImpl<", method.input, method.output, ">;");
        f.print("    ", localName(method), ": (request: ", method.input, ", context: HandlerContext) => Promise<", method.output, ">;");
        break;
      }
      case MethodKind.ServerStreaming: {
        f.print("    ", localName(method), ": (request: ", method.input, ", context: HandlerContext) => AsyncIterable<", method.output, ">;");
        // f.print("    ", localName(method), ": ServerStreamingImpl<", method.input, method.output, ">;");
        break;
      }
      case MethodKind.ClientStreaming: {
        f.print("    ", localName(method), ": (request: AsyncIterable<", method.input, ">, context: HandlerContext) => Promise<", method.output, ">;");
        // f.print("    ", localName(method), ": ClientStreamingImpl<", method.input, method.output, ">;");
        break;
      }
      case MethodKind.BiDiStreaming: {
        f.print("    ", localName(method), ": (request: AsyncIterable<", method.input, ">, context: HandlerContext) => AsyncIterable<", method.output, ">;");
        // f.print("    ", localName(method), ": BiDiStreamingImpl<", method.input, method.output, ">;");
        break;
      }
    };
  }
  f.print("}");
  f.print();
}

// v
// BiDiStreamingImpl

// enum MethodKindType {
//   Unary = 0,
//   Bidi = 0,
// }

export const protocGenConnectTs = createEcmaScriptPlugin({
  name: "protoc-gen-connect-ts",
  version: `v${String(version)}`,
  generateTs,
  generateJs,
  generateDts,
});
