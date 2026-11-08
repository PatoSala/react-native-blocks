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
import { Block } from "../interfaces/Block.interface";

/**
 * Blank space component.
 * Review the handleOnBlankSpacePress function. Add necessary documentation and clean up the code.
 */

/**
 * Blank space is no longer used.
 * Keeping it here for the moment in case we need to use it again.
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

// RenderBlockTree
function RenderTree() {
  const { blockTypes } = useBlockRegistrationContext();
  const { blocks, blocksOrder } = useBlocksContext();
  console.log("Blocks order", blocksOrder);

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
        );
      })}
    </>
  )
}

interface EditorProps {
  children: React.ReactNode
  extractBlocks?: (blocks: any) => any
  // To do: rename.
  defaultBlocks?: any
  contentContainerStyle?: any
  /** 
   * Component to render above the keyboard.
   * [To do]: each block should render its own toolbar when focused. This will allow us to have a more flexible and customizable toolbar for each block type.
   * */
  ToolbarComponent?: any
  /** Fires when a blank space is pressed */
  onBlankSpacePress?: any

  rootBlock?: Block
}

export function Editor(props: EditorProps) {
  const {
    children,

    extractBlocks,
    defaultBlocks,

    contentContainerStyle,

    rootBlock,

    /** Deprecate ToolbarComponent */
    ToolbarComponent
  } = props;

  if (children === undefined) throw new Error("No blocks have been registered. Please register at least one block type using the Block component.");

  return (
    <BlockRegistration customBlocks={children}>
      <BlocksProvider
        defaultBlocks={defaultBlocks}
        extractBlocks={extractBlocks}
        rootBlock={rootBlock}
      >
        <TextBlocksProvider>
          <GestureHandlerRootView>
            <BlocksMeasuresProvider>
              <ScrollProvider contentContainerStyle={contentContainerStyle}>
                <RenderTree />
              </ScrollProvider>
            </BlocksMeasuresProvider>

            {/* Todo: Deprecate */}
            {ToolbarComponent && <ToolbarComponent />}
          </GestureHandlerRootView>
        </TextBlocksProvider>
      </BlocksProvider>
    </BlockRegistration>
  )
}