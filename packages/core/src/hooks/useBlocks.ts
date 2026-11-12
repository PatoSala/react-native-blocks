import { blocks$ } from "../context/blocks$";
import { Block } from "../interfaces/Block.interface";
import { useBlockRegistrationContext } from "../components/BlockRegistration";

/**
 * Pros of using this hook to access the blocks store:
 * 1. No need to use it just within the Editor component since legend-state can be exported as a global variable.
 */

/**
 * Pass an id to this hook and it will return the block object.
 * @param blockId Block id
 * @returns Block object
 */
function useBlocks(blockId: string) {
  const { blockTypes } = useBlockRegistrationContext();
  const { blocks, insertBlock, updateBlock, removeBlock } = blocks$.peek();

  return {
    blocks,
    blockTypes,

    insertBlock,
    updateBlock,
    removeBlock
  };
}

export { useBlocks };
