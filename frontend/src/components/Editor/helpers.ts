// fallback default state
const defaultEditorState = JSON.stringify({
  root: {
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: "",
            detail: 0,
            format: "",
            mode: "normal",
            style: "",
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    ],
    direction: "ltr",
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
export default function parseOrDefault(editorStateStr:string) {
      console.log("this is the content:", editorStateStr);

  try {
    if (!editorStateStr || editorStateStr.trim() === "") {
      console.warn("Editor state is empty. Using default editor state.");
      return defaultEditorState;
    }
    const parsed = JSON.parse(editorStateStr);
    const sanitized = sanitizeEditorState(parsed);
    console.log("Sanitized editor state:", sanitized);
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
}
