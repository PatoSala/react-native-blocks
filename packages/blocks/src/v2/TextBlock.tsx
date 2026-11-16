import {
  DragProvider
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

interface Props {
  blockId: string
}

export function TextBlockV2({ blockId }: Props) {
  return (
    <DragProvider blockId={blockId}>
      <View style={styles.container}>
        <TextInput
          // ref={inputRef} ??? 
          key={`input-${blockId}`}   // Really important to pass the key prop
          style={styles.text}
          /* {...getTextInputProps()} */
          /* value={block.properties.title} */

          blockId={blockId}
        />
      </View>
    </DragProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8
  },
  text: {
    fontSize: 16,
    fontWeight: "normal",
    paddingVertical: 6,
    lineHeight: 24,
    flexWrap: "wrap"
  }
});