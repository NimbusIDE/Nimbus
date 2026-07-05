"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { FileToolbar } from "@/components/FileToolbar";
import Link from "next/link";

export default function App() {
  const [code, setCode] = useState(
    `function greet(n){ return "Hello, " + n; }\nconsole.log(greet("World"));`,
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="p-3 border-b flex items-center gap-2">
        <span className="font-semibold">Nimbus — Editor</span>

        <div className="ml-auto">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Log In
          </Link>
        </div>
      </header>

      <FileToolbar
        onNew={() => console.log("New File clicked")}
        onOpen={() => console.log("Open File clicked")}
        onSave={() => console.log("Save clicked")}
        onRemove={() => console.log("Remove File clicked")}
      />

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          options={{ fontSize: 100, minimap: { enabled: false } }}
        />
      </div>
    </div>
  );
}
