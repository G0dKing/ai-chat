import { useReducer, useState } from "react";
import axios from "axios";

const initialState = {
  conversation: [],
  loading: false,
  typing: "",
  model: import.meta.env.VITE_AI_MODEL || "llama3",
  role: import.meta.env.VITE_ROLE || "system",
  instruction:
    import.meta.env.VITE_INSTRUCTION || "You are a helpful assistant",
};

function reducer(state, action) {
  switch (action.type) {
    case "USER_INPUT":
      return {
        ...state,
        conversation: [
          ...state.conversation,
          { type: "user", text: action.payload },
        ],
      };
    case "AI_OUTPUT":
      return {
        ...state,
        conversation: [
          ...state.conversation,
          { type: "bot", text: action.payload },
        ],
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TYPING":
      return { ...state, typing: action.payload };
    case "SET_MODEL":
      return { ...state, model: action.payload };
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "SET_INSTRUCTION":
      return { ...state, instruction: action.payload };
    case "CLEAR_CONVERSATION":
      return { ...state, conversation: [] };
    default:
      return state;
  }
}

const useChat = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [prompt, setPrompt] = useState("");

  const sendPrompt = async () => {
    try {
      dispatch({ type: "SET_TYPING", payload: "" });
      dispatch({ type: "SET_LOADING", payload: true });

      const request = await axios.post("http://localhost:3001/ai-chat", {
        prompt: prompt,
        model: state.model,
        role: state.role,
        instruction: state.instruction,
      });

      dispatch({ type: "SET_LOADING", payload: false });

      const response = request.data.message;
      await typingAnimation(response);

      dispatch({ type: "AI_OUTPUT", payload: response });
      dispatch({ type: "SET_TYPING", payload: "" });
    } catch (error) {
      console.error("Server Error:", error);
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({
        type: "AI_OUTPUT",
        payload: "Error: Server Error. Please try again later.",
      });
    }
  };

  const typingAnimation = async (message) => {
    let accumulatedTyping = "";
    for (let char of message) {
      accumulatedTyping += char;
      dispatch({ type: "SET_TYPING", payload: accumulatedTyping });
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  };

  const updatePrompt = (event) => {
    setPrompt(event.target.value);
  };

  const submitPrompt = (event) => {
    event.preventDefault();
    if (state.loading || state.typing) return;

    if (prompt.trim() !== "") {
      dispatch({ type: "USER_INPUT", payload: prompt });
      sendPrompt();
      setPrompt("");
    }
  };

  const submitOnEnter = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitPrompt(event);
    }
  };

  const clearConversation = () => {
    dispatch({ type: "CLEAR_CONVERSATION" });
  };

  return {
    state,
    prompt,
    updatePrompt,
    submitPrompt,
    submitOnEnter,
    clearConversation,
    dispatch,
  };
};

export default useChat;
