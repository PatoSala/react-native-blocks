import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Pressable, View } from "react-native";
import { LayoutProvider } from "./LayoutProvider";
import { useKeyboardStatus } from "../hooks/useKeyboardStatus";
import { BlocksProvider, useBlocksContext } from "./BlocksContext";
import { BlockRegistration, useBlockRegistrationContext } from "./BlockRegistration";
import { TextBlocksProvider, useTextBlocksContext } from "./TextBlocksProvider";
import { ScrollProvider } from "./ScrollProvider";
import { BlocksMeasuresProvider } from "./BlocksMeasuresProvider";

/**
 * Blank space component.
 * Review the handleOnBlankSpacePress function. Add necessary documentation and clean up the code.
 */
const BlankSpace = ({ onBlankSpacePress }) => {
    const { keyboardHeight } = useKeyboardStatus();
    const {
        blocks,
        blocksOrder,
        insertBlock,
        updateBlockV2,
        removeBlock
    } = useBlocksContext();
    const { inputRefs } = useTextBlocksContext();

    const handleBlankSpacePress = () => onBlankSpacePress({
        blocks,
        blocksOrder,
        insertBlock,
        inputRefs
    });

    return (
        <Pressable
            onPress={handleBlankSpacePress}
            style={{
                flexGrow: 1,
                minHeight: keyboardHeight + 64,
                backgroundColor: "transparent"
            }}
        />
    )
};

interface RenderTreeProps {
    onBlankSpacePress: () => void
}
function RenderTree(props: RenderTreeProps) {
    const {
        onBlankSpacePress
    } = props;
    const { blockTypes, defaultBlockType } = useBlockRegistrationContext();
    const { blocks, blocksOrder } = useBlocksContext();

    return (
        <>
            {/* We concat the "root" content (should be just one item) with the content of its only child. */}
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

            <BlankSpace onBlankSpacePress={onBlankSpacePress}/>
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
 * @param props.onBlankSpacePress Fires when the user presses a blank space in the editor
 */
export function Editor({
    children,

    // Todo: Deprecate defaultBlockType
    defaultBlockType,

    extractBlocks,
    defaultBlocks,
    contentContainerStyle,
    ToolbarComponent = () => <View/>,

    // Experimental
    /**
     * Fires when the user presses a blank space in the editor.
     */
    onBlankSpacePress = () => {}
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
                                <RenderTree
                                    onBlankSpacePress={onBlankSpacePress}
                                />
                            </ScrollProvider>
                        </BlocksMeasuresProvider>
                        
                        <ToolbarComponent />
                    </GestureHandlerRootView>
                </TextBlocksProvider>
            </BlocksProvider>
        </BlockRegistration>
    )
}