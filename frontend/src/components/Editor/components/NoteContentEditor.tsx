import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import { Provider } from "@lexical/yjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LinkNode } from "@lexical/link";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import EditorTheme from "../style/EditorTheme.ts";
import {
  getRandomUserProfile,
  UserProfile,
} from "../utils/getRandomUserProfile.ts";

import "../../../styles/NoteContentEditor.module.css";
import parseOrDefault from "../utils/helpers.ts";
import { createWebsocketProvider } from "../utils/providers.ts";
import Editor from "../components/Editor.tsx";
import StopPropagationPlugin from "../plugins/StopPropagationPlugin.tsx";
import { WebsocketProvider } from "y-websocket";

type NoteContentEditorProps = {
  handleContentInput: any;
  content: string;
  isSelected: boolean;
  note: any;
};

interface ActiveUserProfile extends UserProfile {
  userId: number;
}

const NoteContentEditor = ({
  handleContentInput,
  content,
  isSelected,
  note,
}: NoteContentEditorProps) => {
  const editorRef = useRef(null);
  const validContent = parseOrDefault(content);
  const [userProfile, setUserProfile] = useState(() =>
    getRandomUserProfile("")
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [yjsProvider, setYjsProvider] = useState<null | Provider>(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUserProfile[]>([]);

  const initialConfig = {
    namespace: "MyEditor",
    theme: EditorTheme,
    content:isSelected?null:validContent,

    onError: (error: Error) => {
      throw error;
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
    editable: isSelected,
    editorState: validContent,
  };

  const handleAwarenessUpdate = useCallback(() => {
    const awareness = yjsProvider!.awareness!;
    setActiveUsers(
      Array.from(awareness.getStates().entries()).map(
        ([userId, { color, name }]) => ({
          color,
          name,
          userId,
        })
      )
    );
  }, [yjsProvider]);

  useEffect(() => {
    return () => {
      (yjsProvider as WebsocketProvider | null)?.destroy();
    };
  }, [yjsProvider]);

  useEffect(() => {
    if (yjsProvider == null) {
      return;
    }

    yjsProvider.awareness.on("update", handleAwarenessUpdate);

    return () => yjsProvider.awareness.off("update", handleAwarenessUpdate);
  }, [yjsProvider, handleAwarenessUpdate]);

  const providerFactory = useCallback(
    (room: string, yjsDocMap: Map<string, Y.Doc>) => {
      const provider = createWebsocketProvider(room, yjsDocMap, isSelected);
      provider.on("status", (event: any) => {
        setConnected(
          // Websocket provider
          event.status === "connected"
        );
      });

      // This is a hack to get reference to provider with standard CollaborationPlugin.
      // To be fixed in future versions of Lexical.
      setTimeout(() => setYjsProvider(provider), 0);

      return provider;
    },

    []
  );

  const handleConnectionToggle = () => {
    if (yjsProvider == null) {
      return;
    }
    if (connected) {
      yjsProvider.disconnect();
    } else {
      yjsProvider.connect();
    }
  };

  function handleOnEditorChange(editorState: any) {
    editorRef.current = editorState;
    const editorStateJSON = editorState.toJSON();
    handleContentInput(JSON.stringify(editorStateJSON));
  }

  /*  <p>
         <b>Active users:</b>
          {activeUsers.map(({ name, color, userId }, idx) => (
            <Fragment key={userId}>
              <span style={{ color }}>{"Amar"}</span>
              {idx === activeUsers.length - 1 ? "" : ", "}
            </Fragment>
          ))}
        </p>*/

  return (
    <div ref={containerRef}>
      <LexicalComposer
        initialConfig={initialConfig}
        key={`${note.id}-${isSelected}`}
      >
        {/* With CollaborationPlugin - we MUST NOT use @lexical/react/LexicalHistoryPlugin */}

        {isSelected &&(<CollaborationPlugin
          id={`note-${note.id}`}
          providerFactory={providerFactory}
          // Optional initial editor state in case collaborative Y.Doc won't
          // have any existing data on server. Then it'll user this value to populate editor.
          // It accepts same type of values as LexicalComposer editorState
          // prop (json string, state object, or a function)

          // Unless you have a way to avoid race condition between 2+ users trying to do bootstrap simultaneously
          // you should never try to bootstrap on client. It's better to perform bootstrap within Yjs server.
          initialEditorState={validContent}
          shouldBootstrap={true}
          username={userProfile.name}
          cursorColor={userProfile.color}
          cursorsContainerRef={containerRef}
        />)}
        <StopPropagationPlugin />

        <OnChangePlugin onChange={handleOnEditorChange} />
        <EditorRefPlugin editorRef={editorRef} />
        <Editor />
      </LexicalComposer>
    </div>
  );
};

export default NoteContentEditor;
