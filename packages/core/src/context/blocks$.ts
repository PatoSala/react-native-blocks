import { observable, batch, endBatch } from "@legendapp/state";
import { insertBlockIdIntoContent, updateBlockData } from "../..";
import { Block } from "../interfaces/Block.interface";
import { isEqual } from "lodash";

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
    if (!block) return;

    const blocks = blocks$.blocks.peek();
    const parentBlock = blocks[block.parent];

    const updatedParentBlockContent = insertBlockIdIntoContent(parentBlock.content, block.id, {
      prevBlockId: position?.prevBlockId,
      nextBlockId: position?.nextBlockId
    });

    batch(() => {
      // 1. Add new block to store
      blocks$.blocks[block.id].set(block);
      // 2. Update the content array of the parent block
      blocks$.blocks[parentBlock.id].content.set([...updatedParentBlockContent]);
    });
  },

  /**
   * Updates a specific block in the blocks object.
   */
  updateBlock: (blockId: string, blockData: Partial<Block>) => {
    const block = blocks$.peek().blocks[blockId];
    const updatedBlock = updateBlockData(block, blockData);

    // Collect only the properties whose values actually changed
    const changes: Partial<Block> = {};
    for (const key of Object.keys(updatedBlock) as (keyof Block)[]) {
      if (!isEqual(block[key], updatedBlock[key])) {
        changes[key] = updatedBlock[key] as any;
      }
    }

    // Nothing changed, so skip the write (and any listener notifications)
    if (Object.keys(changes).length === 0) return;

    blocks$.blocks[blockId].assign(changes);
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
      blocks$.blocks[parentBlock.id].assign({
        content: updatedParentBlock.content
      });
      blocks$.blocks[blockId].delete();
    });
  }
});

export { blocks$ };