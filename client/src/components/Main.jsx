import { useEffect, useRef } from "react";
import useAPI from "../hooks/useAPI";
import Loading from "./Animations";
import AccordionMenu from "./Menus";
import NewChat from "./Buttons";
import "./Main.css";

const Main = () => {
  const { state, prompt, updatePrompt, submitPrompt, submitOnEnter, clearConversation, dispatch } =
    useAPI();

  const models = ["llama3", "codellama", "gemma", "mistral"];
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [state.conversation, state.typing, state.loading]);

  // Render in Browser
  return (
    <div className="chatContainer">
      {/* Header Container */}
      <div className="headerContainer">
        {/* Menu */}
        <NewChat clearConversation={clearConversation} />
        <AccordionMenu
          models={models}
          selectedModel={state.model}
          onSelectModel={(e) =>
            dispatch({ type: "SET_MODEL", payload: e.target.value })
          }
        />
      </div>
      {/* Chat Window */}
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
        {/* Loading: State */}
        {state.loading && (
          <div className="chatMessage botChat">
            <div className="loadingWrapper">
              <Loading />
            </div>
          </div>
        )}
        {/*Real-time Typing Effect: State */}
        {state.typing && (
          <div className="chatMessage botChat">{state.typing}</div>
        )}
      </div>
      {/* User Input Section */}
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

export default Main;
