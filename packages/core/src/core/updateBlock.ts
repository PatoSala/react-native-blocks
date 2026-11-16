import { Block } from "../interfaces/Block.interface";

// The below functions are just utils. Should be moved out of the 'core' folder.

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
/* export function insertBlockIdIntoContent(
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
} */

/** @deprecated */
export function insertBlockIdIntoContent(
  contentArray: string[],
  newBlockId: string,
  options: { prevBlockId?: string; nextBlockId?: string }
): string[] {
  const next = [...contentArray];

  if (options?.prevBlockId !== undefined) {
    const index = next.indexOf(options.prevBlockId);
    if (index !== -1) {
      next.splice(index + 1, 0, newBlockId);
      return next;
    }
  }

  if (options?.nextBlockId !== undefined) {
    const index = next.indexOf(options.nextBlockId);
    if (index !== -1) {
      next.splice(index, 0, newBlockId);
      return next;
    }
  }

  // Default: append to the end
  next.push(newBlockId);
  return next;
}

/* export function rearrangeContent(parentBlock: Block, blockId: string, index: number) {
  const contentArray = parentBlock.content;
  contentArray.splice(index, 0, blockId);
  return contentArray;
} */

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

export function findClosestPreviousBlock(
  /** The block to find the closest previous block for */
  blockId: string,
  /** The blocks object */
  blocks: Record<string, Block>,
  /** An array of block types. */
  ofTypes: string[]
): Block | undefined {
  const types = new Set(ofTypes);

  /** Deepest last descendant of a block (or the block itself if it has no children). */
  const lastDescendantId = (id: string): string => {
    let current = id;
    while (true) {
      const children = blocks[current]?.content;
      const lastChild = children?.[children.length - 1];
      if (!lastChild || !blocks[lastChild]) return current;
      current = lastChild;
    }
  };

  /** The block that comes immediately before `id` in document order. */
  const previousId = (id: string): string | undefined => {
    const parentId = blocks[id]?.parent;
    const parent = parentId ? blocks[parentId] : undefined;
    if (!parentId || !parent) return undefined; // top of the tree

    const siblings = parent.content ?? [];
    const index = siblings.indexOf(id);

    return index > 0 ? lastDescendantId(siblings[index - 1]) : parentId;
  };

  const visited = new Set<string>([blockId]); // guards against cycles
  let current = previousId(blockId);

  while (current && !visited.has(current)) {
    visited.add(current);
    const block = blocks[current];
    if (!block) return undefined;
    if (types.has(block.type)) return block;
    current = previousId(current);
  }

  return undefined;
}


