import * as monaco from "monaco-editor";

import { editorWorkerStr } from "./workers/editorWorker";
import { jsonWorkerStr } from "./workers/jsonWorker";

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "json") {
      const jsonWorkerBlob = new Blob([jsonWorkerStr], {
        type: "application/javascript",
      });
      return new Worker(URL.createObjectURL(jsonWorkerBlob));
    }
    const editorWorkerBlob = new Blob([editorWorkerStr], {
      type: "application/javascript",
    });
    return new Worker(URL.createObjectURL(editorWorkerBlob));
  },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
