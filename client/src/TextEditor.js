import React, { useEffect, useState, useRef } from "react";
import Quill from "quill";
import { io } from "socket.io-client";
import "quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";


const SAVE_INTERVAL_MS = 1000 * 5;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];
const options = {
  "force new connection": true,
  reconnectionAttempt: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const TextEditor = () => {
  const { id: documentId } = useParams();
  const [quill, setQuill] = useState(null);
  const [socket, setSocket] = useState(null);
  const wrapperRef = useRef(null);
//https://coauthor-vbvro8zi.b4a.run
  useEffect(() => {
    const conn = io("http://localhost:8000", options);
    setSocket(conn);
    return () => {
      conn.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket === null || quill === null) return;

    socket.on("load-document", (document) => {
      console.log('load document event')
      quill.setContents(document);
      quill.enable();

    });

    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;

      socket.emit("send-changes", delta);

    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const interval = setInterval(() => {

      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const editor = document.createElement("div");
    wrapperRef.current.innerHTML = "";
    wrapperRef.current.appendChild(editor);

    const EditorInstance = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    // EditorInstance.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
    //   delta.ops = delta.ops.map(op => {
    //     return {
    //       insert: op.insert
    //     }
    //   })
    //   return delta
    // })

    EditorInstance.disable();
    EditorInstance.setText("Loading...");
    setQuill(EditorInstance);
  }, []);

  return (
    <>
      <div className="container outerDiv" ref={wrapperRef}></div>
      {/* <div
        style={{
          height: "550px",
          width: "350px",
          gap: "10px",
          position: "absolute",
          top: "100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      > */}
        {/* <video
          style={{ border: "2px solid black", objectFit: 'cover' }}
          src={video}
          height={225}
          width={340}
          autoPlay
          muted
          controls
        /> */}

        {/* <video
          style={{ border: "2px solid black", objectFit: "cover" }}
          src={video}
          height={225}
          width={340}
          autoPlay
          muted
          controls
        />
      </div> */}
    </>
  );
};

export default TextEditor;
