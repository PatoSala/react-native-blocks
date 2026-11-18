
import React from "react";
import {
  DragProvider,
  RenderNestedBlocks,
  blocks$,
  createBlock
} from "@react-native-blocks/core";
import { View, StyleSheet, Platform } from "react-native";
import { useValue } from "@legendapp/state/react";


/**
 * It could be a good idea to create a way to define a block's strucuture (like an interface) and
 * use that structure to register the block.
 * 
 * @example
 * const textBlock = {
 *     {text block properties here}
 * }
 * 
 * Then this structure could be used at the moment of registering the block.
 */

/**
 * ANATOMY OF A CALLOUT BLOCK:
 * 
 * A callout block is just a container with nested blocks.
 * The creation of a callout involves inserting two new blocks:
 * 1. The callout block itself.
 * 2. A nested text block inside the callout block.
 */

interface Props {
  blockId: string
}

export function CalloutBlockV2({ blockId }: Props) {
  const isMounted = React.useRef(false);
  // Get callout content
  // If callout has no content, add a nested text block by default
  const block = blocks$.blocks[blockId].get();
  const calloutContent = useValue(blocks$.blocks[blockId].content);
  console.log("Callout content", calloutContent);

  // If a callout gets all of its children removed, remove the callout too.
  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      // If on mount the callout has no children, add a nested text block by default
      if (calloutContent.length === 0) {
        const newBlock = createBlock({
          type: "text",
          properties: {
            title: ""
          },
          parent: blockId,
          content: []
        });
        blocks$.insertBlock(newBlock, 0);
      }
      return;
    } else {
      // If callout ends up with no children, remove it
      if (calloutContent.length === 0) {
        blocks$.removeBlock(blockId);
      }
    }
  }, [calloutContent]);

  return (
    <DragProvider blockId={blockId}>
      <View style={styles.container}>
        {/* <TextInput
          // ref={inputRef} ??? 
          key={`input-${blockId}`}   // Really important to pass the key prop
          style={styles.text}

          blockId={blockId}
        /> */}

        {/* Render callout nested blocks */}
        <View style={styles.callout}>
          <View style={styles.iconContainer} />
          <View style={{ flex: 1 }}>
            {block.content.length > 0 && <RenderNestedBlocks blockId={blockId} />}
          </View>
        </View>
      </View>
    </DragProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8
  },
  callout: {
    backgroundColor: "#efefef",
    paddingVertical: 16,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    boxSizing: "border-box"
  },
  iconContainer: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 32,
    width: 32
  },
  icon: {
    fontSize: 16,
  }
});