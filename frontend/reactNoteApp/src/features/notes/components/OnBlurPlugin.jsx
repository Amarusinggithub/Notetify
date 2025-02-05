import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

function OnBlurPlugin({ onBlur }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener("blur", onBlur);
      return () => {
        rootElement.removeEventListener("blur", onBlur);
      };
    }
  }, [editor, onBlur]);

  return null;
}

export default OnBlurPlugin;
