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
                zIndex: -1,
                minHeight: keyboardHeight + 64,
                height: "100%",
                backgroundColor: "transparent"
            }}
        />
    )
};

interface RenderTreeProps {
    onBlankSpacePress: () => void,
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
                    <LayoutProvider blockId={blockId} key={`block-${blockId}`}>
                        <View style={{ backgroundColor: "transparent" }}>
                            <Component blockId={blockId} />
                        </View>
                    </LayoutProvider>
                )
            })}

            <BlankSpace onBlankSpacePress={onBlankSpacePress}/>
        </>
    )
}

interface EditorProps {
    children: React.ReactNode
    /** @deprecated */
    defaultBlockType: string
    extractBlocks?: (blocks: any) => any
    defaultBlocks?: any
    contentContainerStyle?: any
    /** Component to render above the keyboard */
    ToolbarComponent?: any
    /** Fires when a blank space is pressed */
    onBlankSpacePress?: any
}

export function Editor(props : EditorProps) {
    const {
        children,

        // Todo: Deprecate defaultBlockType
        defaultBlockType,

        extractBlocks,
        defaultBlocks,
        /** Styles for the scroll view */
        contentContainerStyle,
        ToolbarComponent,

        // Experimental
        onBlankSpacePress
    } = props;

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
                        <ScrollProvider contentContainerStyle={contentContainerStyle}>
                            <BlocksMeasuresProvider>
                                    <RenderTree
                                        onBlankSpacePress={onBlankSpacePress}
                                    />
                            </BlocksMeasuresProvider>
                        </ScrollProvider>
                        {ToolbarComponent && <ToolbarComponent />}
                    </GestureHandlerRootView>
                </TextBlocksProvider>
            </BlocksProvider>
        </BlockRegistration>
    )
}