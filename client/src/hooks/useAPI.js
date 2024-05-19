import { useReducer, useState, useCallback } from "react";
import axios from "axios";

const initialState = {
  conversation: [],
  loading: false,
  typing: "",
  model: import.meta.env.VITE_AI_MODEL || "llama3",
  role: import.meta.env.VITE_ROLE || "system",
  instruction: "",
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
          { type: "assistant", text: action.payload },
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

const useAPI = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [prompt, setPrompt] = useState("");

  const getInstruction = useCallback((model) => {
    switch (model) {
      case "llama3":
        return import.meta.env.VITE_INSTRUCTION_LLAMA3;
      case "codellama":
        return import.meta.env.VITE_INSTRUCTION_CODELLAMA;
      case "gemma":
        return import.meta.env.VITE_INSTRUCTION_GEMMA;
      case "mistral":
        return import.meta.env.VITE_INSTRUCTION_MISTRAL;
      default:
        return "You are a helpful AI assistant.";
    }
  }, []);

  const typingAnimation = useCallback(async (message) => {
    let accumulatedTyping = "";
    for (let char of message) {
      accumulatedTyping += char;
      dispatch({ type: "SET_TYPING", payload: accumulatedTyping });
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }, []);

  const sendPrompt = useCallback(async () => {
    try {
      dispatch({ type: "SET_TYPING", payload: "" });
      dispatch({ type: "SET_LOADING", payload: true });

      const instruction = getInstruction(state.model);
      const history = [
        { role: "system", content: instruction },
        ...state.conversation.map((entry) => ({
          role: entry.type === "user" ? "user" : "assistant",
          content: entry.text,
        })),
      ];

      const request = await axios.post("http://localhost:3001/ai-chat", {
        prompt: prompt,
        model: state.model,
        history: history,
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
  }, [
    state.model,
    state.conversation,
    prompt,
    getInstruction,
    typingAnimation,
  ]);

  const updatePrompt = useCallback((event) => {
    setPrompt(event.target.value);
  }, []);

  const submitPrompt = useCallback(
    (event) => {
      event.preventDefault();
      if (state.loading || state.typing) return;

      if (prompt.trim() !== "") {
        dispatch({ type: "USER_INPUT", payload: prompt });
        sendPrompt();
        setPrompt("");
      }
    },
    [state.loading, state.typing, prompt, sendPrompt]
  );

  const submitOnEnter = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitPrompt(event);
      }
    },
    [submitPrompt]
  );

  const clearConversation = useCallback(() => {
    dispatch({ type: "CLEAR_CONVERSATION" });
    setPrompt("");
  }, []);

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

export default useAPI;
