
import type { EditorState } from "lexical";

// fallback default state
const defaultEditorState = JSON.stringify({
  root: {
    children: [
      {
        type: "paragraph",
        children: [],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});


// Recursively traverse the editor state and ensure valid indent values for list items.
function sanitizeEditorState(editorStateObj:any) {
  function traverse(node:any) {
    if (node.type === "listitem") {
      if (typeof node.indent !== "number" || node.indent < 0) {
        console.warn(
          "Invalid indent value detected; resetting to 0 for node:",
          node
        );
        node.indent = 0;
      }
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child:any) => traverse(child));
    }
  }
  if (editorStateObj && editorStateObj.root) {
    traverse(editorStateObj.root);
  }
  return editorStateObj;
}

// Parse the incoming state or fallback to default, then sanitize.
/*export default function parseOrDefault(editorStateStr:string) {
     // console.log("this is the content:", editorStateStr);

  try {
    if (!editorStateStr || editorStateStr.trim() === "") {
      console.warn("Editor state is empty. Using default editor state.");
      return defaultEditorState;
    }
    const parsed = JSON.parse(editorStateStr);
    const sanitized = sanitizeEditorState(parsed);
    //console.log("Sanitized editor state:", sanitized);
    // Check if the sanitized state has at least one child node:
    if (
      !sanitized.root ||
      !sanitized.root.children ||
      sanitized.root.children.length === 0
    ) {
      console.warn(
        "Sanitized editor state is empty. Using default editor state."
      );
      return defaultEditorState;
    }
    return JSON.stringify(sanitized);
  } catch (error) {
    console.error("Failed to parse editor state. Using default state.", error);
    return defaultEditorState;
  }
}*/



interface LexicalJSONNode {
  type: string;
  children?: LexicalJSONNode[];
  indent?: number;
  // …other common props…
}

interface LexicalJSONRoot {
  root: LexicalJSONNode & { children: LexicalJSONNode[] };
}

export const DEFAULT_JSON = JSON.stringify({
  root: {
    children: [
      {
        type: "paragraph",
        children: [],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
      },
    ],
    type: "root",
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
});




export default function parseOrDefault(input: string): string {
  if (!input.trim()) {
    console.warn("Empty state; using default.");
    return DEFAULT_JSON;
  }
  try {
    const obj = JSON.parse(input) as LexicalJSONRoot;
    sanitize(obj.root);
    if (!obj.root.children.length) {
      console.warn("Root has no children; using default.");
      return DEFAULT_JSON;
    }
    return JSON.stringify(obj);
  } catch (err) {
    console.error("Parse error; using default.", err);
    return DEFAULT_JSON;
  }
}


function sanitize(node: LexicalJSONNode) {
  if (
    node.type === "listitem" &&
    (!Number.isInteger(node.indent) || node.indent! < 0)
  ) {
    node.indent = 0;
  }
  node.children?.forEach(sanitize);
}
