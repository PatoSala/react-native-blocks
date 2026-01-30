import { createContext, RefObject, useContext, useRef, useState, useEffect } from "react";
import { Block } from "../interfaces/Block.interface";
import { updateBlockData, insertBlockIdIntoContent } from "../core";
import { useBlockRegistrationContext } from "./BlockRegistration";
import * as Crypto from 'expo-crypto';

interface BlocksContext {
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
        position?: {
            prevBlockId?: string | undefined,
            nextBlockId?: string | undefined
        }
    ) => void;
    splitBlock: (block: Block, selection: { start: number; end: number }) => {
        prevBlock: Block;
        nextBlock: Block;
    };
    moveBlock: (
        blockId: string,
        parentId: string,
        targetId: string,
        closestTo: "start" | "end"
    ) => void;
    mergeBlock: (block: Block, targetBlockId: string) => {
        prevTitle: string;
        newTitle: string;
        mergeResult: Block;
    };
    removeBlock: (blockId: string) => Block;
    turnBlockInto: (blockId: string, blockType: string) => Block;
    updateBlock: (updatedBlock: Block) => void;
    updateBlockV2: (blockId: string, blockData: Partial<Block>) => void;
    blockTypes: string[];
}

const BlocksContext = createContext<BlocksContext | null>(null);

/**
 * [To do]: Rename to "useBlocks".
 */
function useBlocksContext() {
    const blocksContext = useContext(BlocksContext);
    if (blocksContext === null) {
        throw new Error("useBlocksContext must be used within a BlocksContextProvider");
    }
    return blocksContext;
}

function useBlock(blockId: string) : Block {
    const { blocks } = useBlocksContext();
    return blocks[blockId];
}

function BlocksProvider({ children, defaultBlocks, extractBlocks }: any) {
    const blocksRef = useRef({
        // This block should never be removed nor updated.
        "root": {
            id: "root",
            type: "root",
            content: Object.keys(defaultBlocks),
            parent: "root"
        },
        ...defaultBlocks
    });

    // To do: Deprecate defaultBlockType.
    const { defaultBlockType, textBasedBlocks, blockTypes } = useBlockRegistrationContext();

    const rootContent = blocksRef.current["root"].content;
    const [blocksOrder, setBlocksOrder] = useState<string[]>([
        blocksRef.current["root"].content[0],
        ...blocksRef.current[blocksRef.current["root"].content[0]].content
    ]);

    const [focusedBlockId, setFocusedBlockId] = useState(null); // Maybe this was to be able to insert by default on the rootBlock?
    const [movingBlockId, setMovingBlockId] = useState<string | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null >(null);
    const [shouldUpdate, setShouldUpdate] = useState([]);

    useEffect(() => {
        extractBlocks(blocksRef.current);
    }, [blocksOrder]);
    
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
        blocksRef.current[newBlock.parent] = updatedBlock;
        blocksRef.current[newBlock.id] = newBlock;

        setBlocksOrder(prevState => [
            rootContent[0],
            ...blocksRef.current[rootContent[0]].content
        ]);
    }

    /**
     * 
     * @param block 
     * @param selection 
     * 
     * Split block into two blocks.
     * A new block will be inserted before the source block with the text before the cursor.
     * The source block will be updated with the text after the cursor.
     * 
     * [Note: Review return statements.]
     * [Note: Splitting a block is only available for text based blocks.]
     */

    function splitBlock(block: Block, selection: { start: number, end: number }) {
        const textBeforeSelection = block.properties.title.substring(0, selection.start);
        const textAfterSelection = block.properties.title.substring(selection.end);

        // Will be inserted before the source block, pushing the source block down

        const newBlock = new Block({
            type: block.type,
            properties: {
                title: textBeforeSelection
            },
            parent: block.parent,
            content: block.content
        });
        
        const updatedBlock = updateBlockData(block, {
            type: defaultBlockType,
            properties: {
                title: textAfterSelection
            },
            content: [],
            parent: blocksOrder[0] === block.id ? newBlock.id : block.parent
        });

        blocksRef.current[updatedBlock.id] = updatedBlock;
        blocksRef.current[newBlock.id] = newBlock;

        // If splitting the only child of the "root"
        if (blocksOrder[0] === block.id) {
            // If we are splitting the only child of the "root" we need to tell the "root" block that its only child has changed.
            const updatedParentBlock = updateBlockData(blocksRef.current[block.parent], {
                content: [newBlock.id]
            });
            blocksRef.current[updatedParentBlock.id] = updatedParentBlock;
        }

        // If splitting the only child of the "root", set the new block as the first block
        if (blocksOrder[0] === block.id) {
            setBlocksOrder(prevState => [
                newBlock.id,
                ...prevState // [newBlock.id, [oldFirstBlock, blockId, blockId, blockId]]
            ]);
        } else {
            // Old insert behavior
            setBlocksOrder(prevState => [...insertBlockIdIntoContent(prevState, newBlock.id, {
                nextBlockId: block.id
            })])
        }

        /* setShouldUpdate([updatedBlock.id, newBlock.id]); */
        
        return {
            prevBlock: newBlock,
            nextBlock: updatedBlock
        }

    }

    /**
     * 
     * @param block 
     * @returns 
     * 
     * Merge block with the block text before it.
     * Appends the text from the target block at the beginning of the source block.
     * The source block type will be replaced with the target block type.
     * Last of all, the target block is removed.
     */
    function mergeBlock(block: Block, targetBlockId: string) {
        const soureBlock = block;
        const targetBlock = blocksRef.current[targetBlockId];
        const sourceBlockText = soureBlock.properties.title;
        const targetBlockText = targetBlock.properties.title;

        const updatedTargetBlock = updateBlockData(targetBlock, {
            properties: {
                title: targetBlockText + sourceBlockText
            }
        });

        const updatedParentBlock = updateBlockData(blocksRef.current[soureBlock.parent], {
            content: blocksRef.current[soureBlock.parent].content.filter(id => id !== soureBlock.id)
        });

        blocksRef.current[updatedTargetBlock.id] = updatedTargetBlock;
        blocksRef.current[updatedParentBlock.id] = updatedParentBlock;

        // Assuming that we are still rendering a flat tree. This should be reviewed with the introduction of nested blocks.
        setBlocksOrder(prevState => prevState.filter((id: string) => id !== soureBlock.id));

        return {
            prevTitle: sourceBlockText,
            newTitle: updatedTargetBlock.properties.title,
            mergeResult: updatedTargetBlock
        }
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
            blocksRef.current["root"].content[0], // Keep root block only child at the top.
            ...blocksRef.current[blocksRef.current["root"].content[0]].content // Update the rest of the blocks order.
        ]);
    }

    /**
     * Note: Only text based blocks can be turned into other text based block types (Maybe a better way to define which blocks can be turned into other blocks are those who have the "title" property?).
     * Future note: If a block has nested blocks, does blocks should be popped out of it and place right under it when turnning it into a different block type.
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
        splitBlock: splitBlock,
        mergeBlock: mergeBlock,
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