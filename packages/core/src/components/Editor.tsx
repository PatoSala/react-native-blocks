import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Pressable, View } from "react-native";
import { LayoutProvider } from "./LayoutProvider";
import { BlocksProvider, useBlocksContext } from "./BlocksContext";
import { BlockRegistration, useBlockRegistrationContext } from "./BlockRegistration";
import { TextBlocksProvider, useTextBlocksContext } from "./TextBlocksProvider";
import { ScrollProvider } from "./ScrollProvider";
import { BlocksMeasuresProvider } from "./BlocksMeasuresProvider";
import { Block } from "../interfaces/Block.interface";


import { useValue } from "@legendapp/state/react";
import { blocks$ } from "../context/blocks$";

// RenderBlockTree
function RenderTree() : React.JSX.Element {
  const { blockTypes } = useBlockRegistrationContext();
  const { rootBlockId } = useBlocksContext();

  const rootContent = useValue(blocks$.blocks[rootBlockId].content);

  console.log("rootContent", rootContent);
  
  return (
    <>
      {/* Render blocksOrder which is the content of the root block. */}
      {rootContent?.map((blockId: string, index: number) => {
        const Component = blockTypes[blocks$.blocks[blockId].type.peek()].component;
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