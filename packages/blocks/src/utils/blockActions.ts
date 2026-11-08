/**
 * The following actions are being taken out from the core package since
 * they are really "notion like" features and they are not really needed in the core package.
 */

/**
 * @description Splits a text based block into two seperate blocks.
 */
const splitBlock = () => {};

/** 
 * @description Takes a block and turns it into another one.
 */
const turnBlockInto = () => {};

/** 
 * @description Merges to text based blocks into one.
 * It takes to block ids and merges the content of the source block into the target block.
 */
const mergeBlocks = (targetBlockId: string, sourceBlockId: string) => {};

// Maybe moveBlock should be kept in the core package.
/**
 * @description Moves a block to a new position in the blocks array.
 * It does not handle gestures nor automatic scrolling. It only updates the blocks array and the block measures.
 */
const moveBlock = () => {};