"use client"
import Editor from "@uiw/react-md-editor";
import { useState } from "react";

export default function MarkdownEditor() {
  const [value, setValue] = useState("# Markdown editor");

  return (
    <div style={{ padding: "2rem" }}>
      <Editor value={value} onChange={(val) => setValue(val || "")} />
    </div>
  );
}