import {
  useReducer,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import debounce from "lodash/debounce";

const initialState = {
  conversation: [],
  loading: false,
  typing: "",
  model: import.meta.env.VITE_AI_MODEL || "llama3",
  role: import.meta.env.VITE_ROLE || "system",
  instruction: "Please respond to the following using Markdown syntax.",
};

export const actionTypes = {
  USER_INPUT: "USER_INPUT",
  AI_OUTPUT: "AI_OUTPUT",
  SET_LOADING: "SET_LOADING",
  SET_TYPING: "SET_TYPING",
  SET_MODEL: "SET_MODEL",
  SET_ROLE: "SET_ROLE",
  SET_INSTRUCTION: "SET_INSTRUCTION",
  CLEAR_CONVERSATION: "CLEAR_CONVERSATION",
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.USER_INPUT:
      return {
        ...state,
        conversation: [
          ...state.conversation,
          { type: "user", text: action.payload },
        ],
      };
    case actionTypes.AI_OUTPUT:
      return {
        ...state,
        conversation: [
          ...state.conversation,
          { type: "assistant", text: action.payload },
        ],
      };
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_TYPING:
      return { ...state, typing: action.payload };
    case actionTypes.SET_MODEL:
      return { ...state, model: action.payload };
    case actionTypes.SET_ROLE:
      return { ...state, role: action.payload };
    case actionTypes.SET_INSTRUCTION:
      return { ...state, instruction: action.payload };
    case actionTypes.CLEAR_CONVERSATION:
      return { ...state, conversation: [] };
    default:
      return state;
  }
}

const axiosInstance = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 120000,
});

const useAPI = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [prompt, setPrompt] = useState("");

  const getInstruction = useCallback((model) => {
    let instruction = "Please format your response using Markdown syntax.";
    switch (model) {
      case "llama3":
        return import.meta.env.VITE_INSTRUCTION_LLAMA3 + instruction;
      case "codellama":
        return import.meta.env.VITE_INSTRUCTION_CODELLAMA + instruction;
      case "gemma":
        return import.meta.env.VITE_INSTRUCTION_GEMMA + instruction;
      case "mistral":
        return import.meta.env.VITE_INSTRUCTION_MISTRAL + instruction;
      default:
        return "You are a helpful AI assistant." + instruction;
    }
  }, []);

  const typingAnimation = useCallback(async (message) => {
    let accumulatedTyping = "";
    for (let char of message) {
      accumulatedTyping += char;
      dispatch({ type: actionTypes.SET_TYPING, payload: accumulatedTyping });
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }, []);

  const promptRef = useRef(prompt);

  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  const sendPrompt = useCallback(async () => {
    try {
      dispatch({ type: actionTypes.SET_TYPING, payload: "" });
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      const instruction = getInstruction(state.model);
      const history = [
        { role: "system", content: instruction },
        ...state.conversation.map((entry) => ({
          role: entry.type === "user" ? "user" : "assistant",
          content: entry.text,
        })),
      ];

      const request = await axiosInstance.post("/ai-chat", {
        prompt: promptRef.current,
        model: state.model,
        history: history,
      });

      dispatch({ type: actionTypes.SET_LOADING, payload: false });

      const response = request.data.message;
      await typingAnimation(response);

      dispatch({ type: actionTypes.AI_OUTPUT, payload: response });
      dispatch({ type: actionTypes.SET_TYPING, payload: "" });
    } catch (error) {
      console.error("Server Error:", error);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      dispatch({
        type: actionTypes.AI_OUTPUT,
        payload: "Error: Server Error. Please try again later.",
      });
    }
  }, [getInstruction, typingAnimation, state.model, state.conversation]);

  const debouncedSendPrompt = useMemo(
    () => debounce(sendPrompt, 300),
    [sendPrompt]
  );

  const updatePrompt = useCallback((event) => {
    setPrompt(event.target.value);
  }, []);

  const submitPrompt = useCallback(
    (event) => {
      event.preventDefault();
      if (state.loading || state.typing || !prompt.trim()) return;

      dispatch({ type: actionTypes.USER_INPUT, payload: prompt });
      debouncedSendPrompt();
      setPrompt("");
    },
    [state.loading, state.typing, prompt, debouncedSendPrompt]
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
    dispatch({ type: actionTypes.CLEAR_CONVERSATION });
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
