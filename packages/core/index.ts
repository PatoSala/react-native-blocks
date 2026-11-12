export * from "./src/components/Editor";
export * from "./src/components/Block";
export * from "./src/hooks/useTextInput";
export * from "./src/components/BlocksContext";
export * from "./src/core/updateBlock";
export * from "./src/components/TextBlocksProvider";
export * from "./src/components/DragProvider";
export * from "./src/hooks/useKeyboardStatus";
export { createBlock } from "./src/interfaces/Block.interface";

export * from "./src/components/TextInput";


// Maybe I could export the blocks store.
// Eg export blocks$.blocks as blocks, insertBlock, updateBlock, removeBlock, etc.