import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
    Pressable,
    View
} from "react-native";
import { Block  } from "../interfaces/Block.interface";
import { LayoutProvider } from "./LayoutProvider";
import Footer from "./Footer/Footer";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { BlocksProvider, useBlocksContext } from "./BlocksContext";
import { BlockRegistration, useBlockRegistrationContext } from "./BlockRegistration";
import { TextBlocksProvider, useTextBlocksContext } from "./TextBlocksProvider";
import { ScrollProvider } from "./ScrollProvider";
import { BlocksMeasuresProvider } from "./BlocksMeasuresProvider";

function RenderTree() {
    const { blockTypes, defaultBlockType } = useBlockRegistrationContext();
    const {
        blocks,
        blocksOrder,
        insertBlock,
    } = useBlocksContext();
    const { keyboardHeight } = useKeyboardStatus();

    // Root block in this speecific case equals the first (and only) block of the "root" block.
    const rootBlock : Block = blocks[blocksOrder[0]];

    /** Editor configs */
    const { inputRefs } = useTextBlocksContext();

    /**
     * This could be provided as a prop for the Editor component.
     * Could be named something like onBlankSpacePress where the user can pass a function to handle the event.
     * In our case we want to insert a new line block.
     */
    const handleNewLineBlock = () => {
        if (
            blocks[blocksOrder[blocksOrder.length - 1]].type === defaultBlockType
            && blocks[blocksOrder[blocksOrder.length - 1]].properties?.title.length === 0
        ) {
            inputRefs.current[rootBlock.content[rootBlock.content.length - 1]]?.current.focus();
        } else {
            const newBlock = new Block({
                type: defaultBlockType,
                properties: {
                    title: ""
                },
                format: {},
                content: [],
                parent: rootBlock.id
            });

            insertBlock(newBlock);
            // Focus new block
            requestAnimationFrame(() => {
                inputRefs.current[newBlock.id]?.current.focus();
            });
        }
    }
 
    // Blank space component
    const ListFooterComponent = () => (
        <Pressable
            onPress={handleNewLineBlock}
            style={{
                flexGrow: 1,
                minHeight: keyboardHeight + 64,
                backgroundColor: "transparent"
            }}
        />
    )

    return (
        <>
            {/* Wee concat the "root" content (should be just one item) with the content of its only child. */}
            {blocksOrder.map((blockId: string, index: number) => {
                const Component = blockTypes[blocks[blockId].type].component;
                return (
                    <View key={`component-${blockId}`} style={{ backgroundColor: "transparent" }}> 
                        <LayoutProvider blockId={blockId} >
                                <View>
                                    <Component blockId={blockId} />
                                </View>
                        </LayoutProvider>
                    </View>
                )
            })}

            <ListFooterComponent />
        </>
    )
}

/**
 * @param props.defaultBlocks
 * @param props.customBlocks
 * @param props.defaultBlockType The block type to be used as output of some actions, for example splitting a block.
 * @param props.extractBlocks
 * @param props.children
 * @param props.contentContainerStyle
 * @param props.ToolbarComponent
 */
export function Editor({
    children,

    // Todo: Deprecate defaultBlockType
    defaultBlockType,

    extractBlocks,
    defaultBlocks,
    contentContainerStyle,
    ToolbarComponent = () => <View/>
}) {

    if (defaultBlockType === undefined) throw new Error("defaultBlockType is required");
    if (children === undefined) throw new Error("children is required");

    return (
        <BlockRegistration customBlocks={children} defaultBlockType={defaultBlockType}>
            <BlocksProvider
                defaultBlocks={defaultBlocks}
                extractBlocks={extractBlocks}
            >
                <TextBlocksProvider>
                    <GestureHandlerRootView>
                        <BlocksMeasuresProvider>
                            <ScrollProvider contentContainerStyle={contentContainerStyle}>
                                <RenderTree/>
                            </ScrollProvider>
                        </BlocksMeasuresProvider>

                        <ToolbarComponent />
                        
                    </GestureHandlerRootView>
                </TextBlocksProvider>
            </BlocksProvider>
        </BlockRegistration>
    )
}