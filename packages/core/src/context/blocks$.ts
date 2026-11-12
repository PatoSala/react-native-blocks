import { observable, batch, endBatch } from "@legendapp/state";
import { insertBlockIdIntoContent, updateBlockData } from "../..";
import { Block } from "../interfaces/Block.interface";

interface Store {
  blocks: Record<string, Block>;
  insertBlock: (
    block: Block,
    /* index: number */
    position: { prevBlockId?: string | undefined, nextBlockId?: string | undefined }
  ) => void;
  updateBlock: (blockId: string, blockData: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  
}

const blocks$ = observable<Store>({
  blocks: {},

  /**
   * Inserting a block involves:
   * 1. Adding the new block to the blocks object.
   * 2. Updating the content array of the parent block to include the new block's id.
   */
  insertBlock: (
    block: Block,
    /* index: number */
    position?: { prevBlockId?: string | undefined, nextBlockId?: string | undefined }
  ) => {
    console.log("Block to insert", block)
    const blocks = blocks$.blocks.peek();
    const parentBlock = blocks[block.parent];
    const updatedParentBlock = {
      ...parentBlock,
      /* content: parentBlock.content?.splice(index, 0, block.id) */
      content: insertBlockIdIntoContent(blocks[block.parent].content, block.id, {
        prevBlockId: position?.prevBlockId,
        nextBlockId: position?.nextBlockId
      })
    }

    batch(() => {
      blocks$.blocks[parentBlock.id].set(updatedParentBlock);
      blocks$.blocks[block.id].set(block);
    });
    endBatch();
  },

  /**
   * Updates a specific block in the blocks object.
   */
  updateBlock: (blockId: string, blockData: Partial<Block>) => {
    const block = blocks$.get().blocks[blockId];
    const updatedBlock = updateBlockData(block, blockData);
    // Could use assign to update the specific properties of the block instead of replacing the whole block object.
    blocks$.blocks[blockId].set(updatedBlock);
  },

  /**
   * Removing a block involves:
   * 1. Removing the block id from its parent's content array.
   * 2. Deleting the block from the blocks object.
   */
  removeBlock: (blockId: string) => {
    const blocks = blocks$.peek().blocks;
    const blockToRemove = blocks[blockId];
    const parentBlock = blocks[blockToRemove.parent];
    const updatedParentBlock = {
      ...parentBlock,
      content: parentBlock.content?.filter((id: string) => id !== blockId)
    }

    batch(() => {
      blocks$.blocks[parentBlock.id].set(updatedParentBlock);
      blocks$.blocks[blockId].delete();
    });
  }
});

export { blocks$ };