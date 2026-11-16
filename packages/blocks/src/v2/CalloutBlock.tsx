
interface Props {
  blockId: string
}

import {
  DragProvider,
  RenderNestedBlocks
} from "@react-native-blocks/core";
import { View, StyleSheet, Platform } from "react-native";

import { TextInput } from "@react-native-blocks/core";

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
  // Get callout content
  // If callout has no content, add a nested text block by default

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
          <View style={styles.iconContainer}/>
          <View style={{ flex: 1 }}>
            <RenderNestedBlocks blockId={blockId} />
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