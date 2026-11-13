import { createContext, RefObject, useContext, useRef, useState, useEffect } from "react";
import { Block } from "../interfaces/Block.interface";
import { updateBlockData, insertBlockIdIntoContent } from "../core";
import { useBlockRegistrationContext } from "./BlockRegistration";
import * as Crypto from 'expo-crypto';
import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";

import { blocks$ } from "../context/blocks$";

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
  /* const blocks = useValue(blocks$).blocks; */

  blocks$.blocks.set({
    [rootBlock.id]: rootBlock,
    ...defaultBlocks
  });

  // To do: deprecate textBasedBlocks.
  const { textBasedBlocks, blockTypes } = useBlockRegistrationContext();

  /**
   * The order in which the blocks inside the root block content are rendered. It is a flat array of block IDs.
   */
  const [focusedBlockId, setFocusedBlockId] = useState(null); // Maybe this was to be able to insert by default on the rootBlock?

  /**
   * Moving block id could be moved to the BlocksMeasuresProvider, since it is only used for dragging and dropping blocks.
   */
  const [movingBlockId, setMovingBlockId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  /**
   *  Inserts a block into the content array of the parent block. If a position object is provided, the block will be inserted at the specified position.
   */
  /* function insertBlock(newBlock: Block, position?: { prevBlockId?: string | undefined, nextBlockId?: string | undefined }) {
    // Update the parent block's content to include the new block's ID at the specified position.
    const updatedBlock = updateBlockData(blocks[newBlock.parent], {
      content: insertBlockIdIntoContent(blocks[newBlock.parent].content, newBlock.id, {
        prevBlockId: position?.prevBlockId,
        nextBlockId: position?.nextBlockId
      })
    });

    // Update the blocks state to include the new block and the updated parent block.
    blocks$.blocks.set({
      ...blocks,
      [newBlock.parent]: updatedBlock,
      [newBlock.id]: newBlock
    });
    });
  } */

  /* function removeBlock(blockId: string) {
    const block = blocks[blockId];
    const parentBlock = blocks[block.parent];
    const updatedParentBlock = updateBlockData(parentBlock, {
      content: parentBlock.content.filter((id: string) => id !== blockId)
    });

    const copyBlocks = { ...blocks };
    delete copyBlocks[blockId];

    blocks$.blocks.set({
      blocks: {
        ...copyBlocks,
        [parentBlock.id]: updatedParentBlock
      }
    });
  } */

  /**
   * Note: Only text based blocks can be turned into other text based block types (Maybe a better way to define which blocks can be turned into other blocks are those who have the "title" property?).
   * Future note: If a block has nested blocks, does blocks should be popped out of it and place right under it when turnning it into a different block type.
   * 
   * [2026-07-11]: turnBlockInto is clearly a "notion like" feature, and it should be moved to the blocks package. It is not really needed in the core package.
   * Technically speaking all blocks can be turned into other blocks. It only involves updating the "type" property of the block. All the properties of the block will remain the same, and if the new block type does not use some of the properties, they will be ignored.
   * Weather or not to turn blocks into other blocks should be up to the user implementing the library, not us.
   */
  /* function turnBlockInto(blockId: string, blockType: string) {
    const updatedBlock = updateBlockData(blocksRef.current[blockId], {
      type: blockType
    });
    blocksRef.current[updatedBlock.id] = updatedBlock;
    setBlocksOrder(prevState => [...prevState]); // re render blocks
    return updatedBlock;
  } */


  /* function updateBlockV2(blockId: string, blockData: Partial<Block>) {
    const updatedBlock = updateBlockData(blocks[blockId], blockData);
    // Could use assign to update the specific properties of the block instead of replacing the whole block object.
    blocks$.blocks[blockId].set(updatedBlock);
  } */

  const value = {
    rootBlockId,

    /**
     * NOTE: As far as I understand, the blocks object will trigger a rerender each time it gets updated.
     * This makes me think, a specific block might want to read other blocks but not get rerendered when other blocks change. Onlye 
     * when he gets updated. Maybe here .peek() should be used.
     */
    blocks: blocks$.blocks.get(),

    focusedBlockId,
    movingBlockId,
    selectedBlockId,
    setSelectedBlockId,
    setMovingBlockId,
    setFocusedBlockId,

    insertBlock: blocks$.insertBlock,
    removeBlock: blocks$.removeBlock,
    updateBlockV2: blocks$.updateBlock,

    getBlockSnapshot: (blockId: string) => blocks$.blocks[blockId].peek(),
    textBasedBlocks,
    blockTypes
  }

  /* if (blocks[rootBlockId] === undefined) return null */

  return (
    <BlocksContext.Provider value={value}>
      {children}
    </BlocksContext.Provider>
  )

}

export { BlocksProvider, useBlocksContext, useBlock, BlocksContext };