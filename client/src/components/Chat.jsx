import { useEffect, useRef } from "react";
import useChat from "../hooks/useChat";
import Loading from "./Loading";
import AccordionMenu from "./AccordionMenu";
import NewChatButton from "./NewChatButton";

import "./Chat.css";

const Chat = () => {
  const { state, prompt, updatePrompt, submitPrompt, submitOnEnter, clearConversation, dispatch } =
    useChat();

  const models = ["llama3", "codellama", "gemma", "mistral"];
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [state.conversation, state.typing, state.loading]);

  return (
    <div className="chatContainer">
      {/* Header Container */}
      <div className="headerContainer">
        <NewChatButton clearConversation={clearConversation} />
        <AccordionMenu
          models={models}
          selectedModel={state.model}
          onSelectModel={(e) =>
            dispatch({ type: "SET_MODEL", payload: e.target.value })
          }
        />
      </div>

      {/* Message Display Window */}
      <div className="chatWindow" ref={chatWindowRef}>
        {state.conversation.map((entry, index) => (
          <div
            key={index}
            className={`chatMessage ${
              entry.type === "user" ? "userChat" : "botChat"
            }`}
          >
            {entry.text}
          </div>
        ))}

        {/* Loading State */}
        {state.loading && (
          <div className="chatMessage botChat">
            <div className="loadingWrapper">
              <Loading />
            </div>
          </div>
        )}

        {/* Simulated-Typing State */}
        {state.typing && (
          <div className="chatMessage botChat">{state.typing}</div>
        )}
      </div>

      {/* User Input Area */}
      <div className="inputContainer">
        <form onSubmit={submitPrompt}>
          <textarea
            rows={3}
            value={prompt}
            onChange={updatePrompt}
            onKeyDown={submitOnEnter}
            placeholder="Say something..."
          />
          <button className="submitButton" type="submit">
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
