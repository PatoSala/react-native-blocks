import React from "react";
import { TextInput } from "react-native";
import { useBlockRegistrationContext } from "./BlockRegistration";
const TextBlocksContext = React.createContext({});

const useTextBlocksContext = () => React.useContext(TextBlocksContext);

const TextBlocksProvider = ({ children }) => {
  const inputRefs = React.useRef({});
  const ghostInputRef = React.useRef<TextInput>(null);
  const [showSoftInputOnFocus, setShowSoftInputOnFocus] = React.useState(true);
  const { textBasedBlocks } = useBlockRegistrationContext();

  const registerRef = (blockId, ref) => {
    inputRefs.current[blockId] = ref;
  };

  const unregisterRef = (blockId) => {
    delete inputRefs.current[blockId];
  };

  const handleGhostInputOnLayout = () => {
    registerRef("ghostInput", ghostInputRef);
  }

  const value = {
    inputRefs,
    showSoftInputOnFocus,
    setShowSoftInputOnFocus,
    registerRef,
    unregisterRef,
    textBasedBlocks
  }

  return (
    <TextBlocksContext.Provider value={value}>
      {children}
      <TextInput
        ref={ghostInputRef}
        onLayout={handleGhostInputOnLayout}
        caretHidden
        style={{
          position: "absolute",
          opacity: 0
        }}
      />
    </TextBlocksContext.Provider>
  );
};

export { TextBlocksProvider, useTextBlocksContext };