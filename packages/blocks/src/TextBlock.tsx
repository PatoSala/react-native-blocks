import {
  useTextInput,
  useBlocksContext,
  findPrevTextBlockInContent,
  useTextBlocksContext,
  createBlock,
  DragProvider
} from "@react-native-blocks/core";
import { View, StyleSheet, Platform } from "react-native";
import { batch } from "@legendapp/state";

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

export function TextBlock({ blockId }: Props) {
  const { getTextInputProps, getValue, getSelection } = useTextInput(blockId);
  const { inputRefs, textBasedBlocks } = useTextBlocksContext();
  const {
    blocks,
    insertBlock,
    updateBlockV2,
    removeBlock,
    rootBlockId
  } = useBlocksContext();

  const block = blocks[blockId];
  console.log("Block", block);

  const handleSubmitEditing = () => {
    const value = getValue();
    const selection = getSelection();

    // if the cursor is at the beginning of the input:
    if (selection.start === 0 && selection.end === 0) {
      const newBlock = createBlock({
        type: "text",
        properties: {
          title: ""
        },
        parent: blocks[blockId].parent,
        content: []
      });

      // Insert a new block above the current block to push the current block down while keeping it focused.
      insertBlock(
        newBlock,
        {
          nextBlockId: blockId
        }
      );
      return;
    }

    // if the cursor is at the end:
    if (selection.start === value.length && selection.end === value.length) {
      // To do: Replace with new Block() (looks more professional)
      const newBlock = createBlock({
        type: "text",
        properties: {
          title: ""
        },
        parent: blocks[blockId].parent,
        content: []
      });

      insertBlock(newBlock, {
        prevBlockId: blockId
      });

      requestAnimationFrame(() => {
        inputRefs.current[newBlock.id]?.current.focus();
      });
      return;
    }

    /**
     * Split the current block into two blocks.
     */
    const textBeforeSelection = value.substring(0, selection.start);
    const textAfterSelection = value.substring(selection.end);

    const newBlock = createBlock({
      type: "text",
      properties: {
        title: textAfterSelection
      },
      parent: blocks[blockId].parent,
      content: []
    });

    // Use legend state batch to make all the updates at once
    batch(() => {
      // 1. update the current block with the text before the selection
      updateBlockV2(blockId, {
        properties: {
          title: textBeforeSelection
        }
      });

      // 2. insert a new block with the text after the selection
      insertBlock(newBlock, {
        prevBlockId: blockId
      });
    });

    requestAnimationFrame(() => {
      /* inputRefs.current[blockId]?.current.setText(textBeforeSelection); */
      inputRefs.current[newBlock.id]?.current.setSelection({
        start: 0,
        end: 0
      });
      inputRefs.current[newBlock.id]?.current.focus();
    });
  }

  const handleOnKeyPress = (event: { nativeEvent: { key: string; }; }) => {
    const value = getValue();
    const selection = getSelection();

    /** If the user pressed backspace and the cursor is at the beginning of the input. */
    if (event.nativeEvent.key === "Backspace" && selection.start === 0 && selection.end === 0) {
      // findPrevTextBlock
      const previousTextBlock = findPrevTextBlockInContent(blockId, blocks, textBasedBlocks);

      inputRefs.current["ghostInput"]?.current.focus();

      if (previousTextBlock === undefined) {
        const parentBlock = blocks[blocks[blockId].parent];
        const isTextBased = textBasedBlocks.includes(parentBlock.type);

        if (isTextBased && parentBlock.id !== rootBlockId) {
          batch(() => {
            updateBlockV2(parentBlock.id, {
              properties: {
                title: parentBlock.properties.title + value
              }
            });
            removeBlock(blockId);
          });

          requestAnimationFrame(() => {
            /* inputRefs.current[parentBlock.id]?.current.setText(parentBlock.properties.title + value); */
            inputRefs.current[parentBlock.id]?.current.setSelection({
              start: parentBlock.properties.title.length,
              end: parentBlock.properties.title.length
            })
            inputRefs.current[parentBlock.id]?.current.focus();
          });
        }
        return;
      }

      batch(() => {
        updateBlockV2(previousTextBlock.id, {
          properties: {
            title: previousTextBlock.properties.title + value
          }
        });
        removeBlock(blockId);
      });

      requestAnimationFrame(() => {
        /* inputRefs.current[previousTextBlock.id]?.current.setText(previousTextBlock.properties.title + value); */
        inputRefs.current[previousTextBlock.id]?.current.setSelection({
          start: previousTextBlock.properties.title.length,
          end: previousTextBlock.properties.title.length
        })
        inputRefs.current[previousTextBlock.id]?.current.focus();
      });
    }
  };

  const handleOnChangeText = (text: string) => {
    // Add debouncing
    updateBlockV2(blockId, {
      properties: {
        title: text
      }
    });
  }

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

          onChangeText={handleOnChangeText}

          onKeyPress={handleOnKeyPress}
          onSubmitEditing={handleSubmitEditing}
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