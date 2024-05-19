import { } from "react";
import PropTypes from "prop-types";
import compose from "../assets/compose.png";
import "./Buttons.css";

const NewChat = ({ clearConversation }) => {
  return (
    <button className="newChat" onClick={clearConversation}>
      <img src={compose} alt="New Chat" />
    </button>
  );
};

// Validate prop types
NewChat.propTypes = {
  clearConversation: PropTypes.func.isRequired,
};

export default NewChat;
