import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./styles/ModelSelectMenu.css";

const ModelSelectMenu = ({ models, selectedModel, onSelectModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const togglemodelSelect = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectModel = (modelName) => {
    onSelectModel({ target: { value: modelName } });
    setIsOpen(false); // Close the modelSelect after selecting a model
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="modelSelectContainer" ref={menuRef}>
      <button className="modelSelectButton" onClick={togglemodelSelect}>
        {isOpen ? "▲" : "▼"} {selectedModel}
      </button>
      <div className={`modelSelectContent ${isOpen ? "open" : ""}`}>
        {models.map((modelName, index) => (
          <div
            key={index}
            className="modelSelectItem"
            onClick={() => handleSelectModel(modelName)}
          >
            <label>{modelName}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

ModelSelectMenu.propTypes = {
  models: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedModel: PropTypes.string.isRequired,
  onSelectModel: PropTypes.func.isRequired,
};

export default ModelSelectMenu;
