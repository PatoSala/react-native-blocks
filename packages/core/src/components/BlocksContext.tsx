import { createContext, RefObject, useContext, useRef, useState, useEffect } from "react";
import { Block } from "../interfaces/Block.interface";
import { updateBlockData, insertBlockIdIntoContent } from "../core";
import { useBlockRegistrationContext } from "./BlockRegistration";
import * as Crypto from 'expo-crypto';

interface BlocksContext {
  rootBlockId: string;
  blocks: RefObject<Record<string, Block>>;
  blocksOrder: string[];
  focusedBlockId: string;
  movingBlockId: string | null;
  selectedBlockId: string | null;
  setSelectedBlockId: (blockId: string | null) => void;
  setMovingBlockId: (blockId: string | null) => void;
  setFocusedBlockId: (blockId: string) => void;
  insertBlock: (
    newBlock: Block,
    /**
     * Only one of the two properties should be provided.
     */
    position?: {
      /**
       * The id of the block that will be before the new block.
       */
      prevBlockId?: string | undefined,
      /**
       * The id of the block that will be after the new block.
       */
      nextBlockId?: string | undefined
    }
  ) => void;
  moveBlock: (
    blockId: string,
    parentId: string,
    targetId: string,
    closestTo: "start" | "end"
  ) => void;
  removeBlock: (blockId: string) => Block;
  turnBlockInto: (blockId: string, blockType: string) => Block;
  updateBlock: (updatedBlock: Block) => void;
  updateBlockV2: (blockId: string, blockData: Partial<Block>) => void;
  blockTypes: string[];
}

const BlocksContext = createContext<BlocksContext | null>(null);

function useBlocksContext() {
  const blocksContext = useContext(BlocksContext);
  if (blocksContext === null) {
    throw new Error("useBlocksContext must be used within a BlocksContextProvider");
  }
  return blocksContext;
}

function useBlock(blockId: string): Block {
  const { blocks } = useBlocksContext();
  return blocks[blockId];
}

function BlocksProvider({ children, defaultBlocks, extractBlocks, rootBlock }: any) {
  // To do: the root block should be the new prop "rootBlock".
  // No longer use this mocked "root" block.
  const rootBlockId = rootBlock.id;
  const blocksRef = useRef({
    // This block should never be removed nor updated.
    [rootBlock.id]: rootBlock,
    ...defaultBlocks
  });

  // To do: deprecate textBasedBlocks.
  const { textBasedBlocks, blockTypes } = useBlockRegistrationContext();

  // rootContent should be blocksRef.current[rootBlock.id].content
  const rootContent = blocksRef.current[rootBlock.id].content;
  /**
   * The order in which the blocks inside the root block content are rendered. It is a flat array of block IDs.
   */
  const [blocksOrder, setBlocksOrder] = useState<string[]>(rootContent);

  const [focusedBlockId, setFocusedBlockId] = useState(null); // Maybe this was to be able to insert by default on the rootBlock?
  const [movingBlockId, setMovingBlockId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [shouldUpdate, setShouldUpdate] = useState([]);

  /* useEffect(() => {
    extractBlocks(blocksRef.current);
  }, [blocksOrder]); */

  /** Block actions
   * Note: I might change all this actions to reducers. reducers can be exported!
   */

  /**
   *  Inserts a block into the content array of the parent block. If a position object is provided, the block will be inserted at the specified position.
   */
  function insertBlock(newBlock: Block, position?: { prevBlockId?: string | undefined, nextBlockId?: string | undefined }) {
    const updatedBlock = updateBlockData(blocksRef.current[newBlock.parent], {
      content: insertBlockIdIntoContent(blocksRef.current[newBlock.parent].content, newBlock.id, {
        prevBlockId: position?.prevBlockId,
        nextBlockId: position?.nextBlockId
      })
    });
    console.log("Updated block after insertBlock", updatedBlock);
    blocksRef.current[newBlock.parent] = updatedBlock;
    blocksRef.current[newBlock.id] = newBlock;

    setBlocksOrder(prevState => [
      ...blocksRef.current[rootBlockId].content
    ]);
  }

  function removeBlock(blockId: string) {
    const block = blocksRef.current[blockId];
    const parentBlock = blocksRef.current[block.parent];
    const updatedParentBlock = updateBlockData(parentBlock, {
      content: parentBlock.content.filter((id: string) => id !== blockId)
    });

    blocksRef.current[parentBlock.id] = updatedParentBlock;
    delete blocksRef.current[blockId];

    setBlocksOrder(prevState => prevState.filter((id: string) => id !== blockId));
  }

  const moveBlock = (blockId: string, parentId: string, targetId: string, closestTo: "start" | "end") => {
    const blockIndexInContent = blocksRef.current[parentId].content?.indexOf(blockId);
    const parentContent = blocksRef.current[parentId].content;

    parentContent.splice(blockIndexInContent, 1);
    const updatedBlock = updateBlockData(blocksRef.current[parentId], {
      content: insertBlockIdIntoContent(
        parentContent,
        blockId,
        closestTo === "start" ? { nextBlockId: targetId } : { prevBlockId: targetId }
      )
    });

    blocksRef.current[parentId] = updatedBlock;
    setBlocksOrder([
      ...blocksRef.current[rootBlockId].content // Update the rest of the blocks order.
    ]);
  }

  /**
   * Note: Only text based blocks can be turned into other text based block types (Maybe a better way to define which blocks can be turned into other blocks are those who have the "title" property?).
   * Future note: If a block has nested blocks, does blocks should be popped out of it and place right under it when turnning it into a different block type.
   * 
   * [2026-07-11]: turnBlockInto is clearly a "notion like" feature, and it should be moved to the blocks package. It is not really needed in the core package.
   * Technically speaking all blocks can be turned into other blocks. It only involves updating the "type" property of the block. All the properties of the block will remain the same, and if the new block type does not use some of the properties, they will be ignored.
   * Weather or not to turn blocks into other blocks should be up to the user implementing the library, not us.
   */
  function turnBlockInto(blockId: string, blockType: string) {
    const updatedBlock = updateBlockData(blocksRef.current[blockId], {
      type: blockType
    });
    blocksRef.current[updatedBlock.id] = updatedBlock;
    setBlocksOrder(prevState => [...prevState]); // re render blocks
    return updatedBlock;
  }

  /**
   * Does not trigger a re render
   */
  function updateBlock(updatedBlock: Block) {
    blocksRef.current[updatedBlock.id] = updatedBlock;
    setBlocksOrder(prevState => [...prevState]);
  }

  function updateBlockV2(blockId: string, blockData: Partial<Block>) {
    const updatedBlock = updateBlockData(blocksRef.current[blockId], blockData);
    blocksRef.current[updatedBlock.id] = updatedBlock;
    setBlocksOrder(prevState => [...prevState]);
  }

  const value = {
    rootBlockId,
    blocks: blocksRef.current,
    blocksOrder,
    focusedBlockId,
    movingBlockId,
    shouldUpdate,
    setShouldUpdate,
    selectedBlockId,
    setSelectedBlockId,
    setMovingBlockId,
    setFocusedBlockId,
    insertBlock,
    updateBlock,

    turnBlockInto,
    removeBlock: removeBlock,
    moveBlock: moveBlock,

    getBlockSnapshot: (blockId: string) => blocksRef.current[blockId],
    updateBlockV2,
    textBasedBlocks,
    blockTypes
  }

  return (
    <BlocksContext.Provider value={value}>
      {children}
    </BlocksContext.Provider>
  )

}

export { BlocksProvider, useBlocksContext, useBlock, BlocksContext };