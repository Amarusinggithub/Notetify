/* eslint-disable react/prop-types */
import CharacterCount from "@tiptap/extension-character-count";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

import { TiptapCollabProvider } from "@hocuspocus/provider";

import * as Y from "yjs";
import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Placeholder from "@tiptap/extension-placeholder";
import { useAuth } from "../../auth/hooks/useAuth";

const colors = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
  "#C3E2C2",
  "#EAECCC",
  "#AFC8AD",
  "#EEC759",
  "#9BB8CD",
  "#FF90BC",
  "#FFC0D9",
  "#DC8686",
  "#7ED7C1",
  "#F3EEEA",
  "#89B9AD",
  "#D0BFFF",
  "#FFF8C9",
  "#CBFFA9",
  "#9BABB8",
  "#E3F4F4",
];

const appId = "7j9y6m11";

const Tiptap = ({ handleContentInput, content, isSelected, noteId }) => {
  const getRandomElement = (list) =>
    list[Math.floor(Math.random() * list.length)];
  const getRandomColor = () => getRandomElement(colors);

  const getInitialUser = () => {
    return {
      name: localStorage.getItem("username") || "Anonymous",
      color: getRandomColor(),
    };
  };

  const [status, setStatus] = useState("connecting");
  const { userData } = useAuth();
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const room = `room.${noteId}`;

  // ydoc and provider
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(
    () =>
      new TiptapCollabProvider({
        appId,
        name: room,
        document: ydoc,
        baseUrl: "ws://localhost:1234/",
        connect: true,
        onConnect: () => {
          console.log("Connected successfully");
          console.log("User data set:", userData);
        },
        onDestroy: () => {
          console.log("Destroyed successfully");
        },
        onDisconnect: () => {
          console.log("Disconnected successfully");
        },
        onOpen: () => {
          console.log("Open successfully");
        },
        onClose: () => {
          console.log("Close successfully");
        },
      }),
    [room, ydoc]
  );

  // Extensions configuration
  const extensions = [
    Image,
    StarterKit.configure({
      history: false,
    }),
    Placeholder.configure({
      placeholder: "Write something …",
    }),
    Highlight,
    History,
    CharacterCount.extend().configure({
      limit: 10000,
    }),
    Collaboration.extend().configure({
      document: ydoc,
    }),
    // Initialize CollaborationCursor with currentUser data
    CollaborationCursor.extend().configure({
      provider,
      user: currentUser,
    }),
  ];

  const editor = useEditor({
    enableContentCheck: true,
    extensions,
    autofocus: isSelected,
    editable: isSelected,
    onUpdate({ editor }) {
      // When the content changes, pass the updated JSON string
      handleContentInput(JSON.stringify(editor.getJSON()));
    },
    onFocus({ editor }) {
      editor.commands.scrollIntoView();
    },
    onContentError: ({ disableCollaboration }) => {
      disableCollaboration();
    },
  });

  useEffect(() => {
    if (editor) {
      // If content is passed as a JSON string, parse it; otherwise assume it is an object.
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Update status changes from provider
  useEffect(() => {
    const statusHandler = (event) => {
      setStatus(event.status);
    };
    provider.on("status", statusHandler);
    return () => {
      provider.off("status", statusHandler);
    };
  }, [provider]);

  // Save current user to localStorage and update editor's collaboration user info
  useEffect(() => {
    if (editor && currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      // Update the user in the collaboration cursor extension
      // (Assumes the extension supports the updateUser command)
      editor.chain().focus().updateUser(currentUser).run();
    }
  }, [editor, currentUser]);

  const setName = useCallback(() => {
    const name = (window.prompt("Name", currentUser.name) || "")
      .trim()
      .substring(0, 32);
    if (name) {
      setCurrentUser({ ...currentUser, name });
    }
  }, [currentUser]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            Undo
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            Redo
          </button>
        </div>
      </div>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bubble-menu">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "is-active" : ""}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "is-active" : ""}
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "is-active" : ""}
            >
              Strike
            </button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent key={noteId} editor={editor} />
      <div
        className="collab-status-group"
        data-state={status === "connected" ? "online" : "offline"}
      >
        <label>
          {status === "connected"
            ? `${editor.storage.collaborationCursor.users.length} user${
                editor.storage.collaborationCursor.users.length === 1 ? "" : "s"
              } online in ${room}`
            : "offline"}
        </label>
        <button style={{ "--color": currentUser.color }} onClick={setName}>
          ✎ {currentUser.name}
        </button>
      </div>
    </>
  );
};

export default Tiptap;
