import { Block } from "../interfaces/Block.interface";

/**
 * @param block Block to update
 * @param updatedData Updated block data
 * @returns Updated block
 */

// Temporary: Must find a dynic way to find out this types in case a custom text based block is also added.
export function updateBlockData(block: Block, updatedData: Partial<Block>) {
    const updatedBlock = { ...block, ...updatedData };
    return updatedBlock;
}

/** 
 * Inserts a new block ID into the given contentArray.
 * If no prevBlockId or nextBlockId is provided, it will be appended to the end.
 * NOTE: Rename prevBlockId to afterBlock and nextBlockId to beforeBlock
 * @returns Updated contentArray (same reference as the original)
 * */
export function insertBlockIdIntoContent(
  contentArray: string[],
  newBlockId: string,
  options: { prevBlockId?: string; nextBlockId?: string }
) {

  if (options?.prevBlockId !== undefined) {
    const index = contentArray.indexOf(options.prevBlockId);
    if (index !== -1) {
      contentArray.splice(index + 1, 0, newBlockId);
      return contentArray;
    }
  }

  if (options?.nextBlockId !== undefined) {
    const index = contentArray.indexOf(options.nextBlockId);
    if (index !== -1) {
      contentArray.splice(index, 0, newBlockId);
      return contentArray;
    }
  }

  // Default: append to the end
  contentArray.push(newBlockId);
  return contentArray;
}

export function rearrangeContent(parentBlock: Block, blockId: string, index: number) {
  const contentArray = parentBlock.content;
  contentArray.splice(index, 0, blockId);
  return contentArray;
}

/**
 * Returns the closest previous text block inside the content array of the parent block.
 */
export function findPrevTextBlockInContent(blockId: string, blocks: Record<string, Block>, textBlockTypes: string[]) {
  const block = blocks[blockId];
  const content = blocks[block.parent].content;

  const blockIndexInContent = content.indexOf(blockId);
  const prevBlockId = content.slice(0, blockIndexInContent).findLast((id: string) => textBlockTypes.includes(blocks[id].type));
  return blocks[prevBlockId];
}
/** 
 * Returns the block before the one passed in as a parameter.
 * It only looks inside the content array of the parent block, not the whole tree.
 * If it returns undefined, it means that there is no previous block inside the content array. */
export function getPreviousBlockInContent(blockId: string, blocks: Record<string, Block>) {
  const block = blocks[blockId];
  const content = blocks[block.parent].content;
  
  const blockIndexInContent = content.indexOf(blockId);
  const prevBlockId = content[blockIndexInContent - 1];
  return blocks[prevBlockId];
}


