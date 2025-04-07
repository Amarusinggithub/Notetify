import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import { Provider } from "@lexical/yjs";
import { EditorState } from "lexical";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LinkNode } from "@lexical/link";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import EditorTheme from "./EditorTheme.ts";
import { getRandomUserProfile, UserProfile } from "./getRandomUserProfile.ts";

import "../../styles/NoteContentEditor.module.css";
import parseOrDefault from "./helpers.ts";
import { createWebRTCProvider, createWebsocketProvider } from "./providers.ts";
import Editor from "./Editor.tsx";

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
  const providerName =
    new URLSearchParams(window.location.search).get("provider") ?? "webrtc";
  const [userProfile, setUserProfile] = useState(() => getRandomUserProfile(""));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [yjsProvider, setYjsProvider] = useState<null | Provider>(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUserProfile[]>([]);

  const initialConfig = {
    namespace: "MyEditor",
    theme: EditorTheme,
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
    if (yjsProvider == null) {
      return;
    }

    yjsProvider.awareness.on("update", handleAwarenessUpdate);

    return () => yjsProvider.awareness.off("update", handleAwarenessUpdate);
  }, [yjsProvider, handleAwarenessUpdate]);

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      const provider =
        providerName === "webrtc"
          ? createWebRTCProvider(id, yjsDocMap)
          : createWebsocketProvider(id, yjsDocMap);
      provider.on("status", (event: any) => {
        setConnected(
          // Websocket provider
          event.status === "connected" ||
            // WebRTC provider has different approact to status reporting
            ("connected" in event && event.connected === true)
        );
      });

      // This is a hack to get reference to provider with standard CollaborationPlugin.
      // To be fixed in future versions of Lexical.
      setTimeout(() => setYjsProvider(provider), 0);

      return provider;
    },
    [providerName]
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

  function handleOnEditorChange(editorState: EditorState) {
    const editorStateJSON = editorState.toJSON();
    handleContentInput(JSON.stringify(editorStateJSON));
  }

  return (
    <div ref={containerRef}>
      <LexicalComposer
        initialConfig={initialConfig}
        key={`${note.id}-${isSelected}`}
      >
        {/* With CollaborationPlugin - we MUST NOT use @lexical/react/LexicalHistoryPlugin */}

        <p>
          <b>Active users:</b>{" "}
          {activeUsers.map(({ name, color, userId }, idx) => (
            <Fragment key={userId}>
              <span style={{ color }}>{name}</span>
              {idx === activeUsers.length - 1 ? "" : ", "}
            </Fragment>
          ))}
        </p>
        <CollaborationPlugin
          id="lexical/react-rich-collab"
          providerFactory={providerFactory}
          // Optional initial editor state in case collaborative Y.Doc won't
          // have any existing data on server. Then it'll user this value to populate editor.
          // It accepts same type of values as LexicalComposer editorState
          // prop (json string, state object, or a function)

          // Unless you have a way to avoid race condition between 2+ users trying to do bootstrap simultaneously
          // you should never try to bootstrap on client. It's better to perform bootstrap within Yjs server.
          initialEditorState={validContent}
          shouldBootstrap={false}
          username={userProfile.name}
          cursorColor={userProfile.color}
          cursorsContainerRef={containerRef}
        />
        <OnChangePlugin onChange={handleOnEditorChange} />
        <EditorRefPlugin editorRef={editorRef} />
        <Editor />
      </LexicalComposer>
    </div>
  );
};

export default NoteContentEditor;
