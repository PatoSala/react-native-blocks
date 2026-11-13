import React from "react";
import { $TextInput } from "@legendapp/state/react-native";
import { TextInputProps, StyleSheet } from "react-native";
import { useValue, useObservable } from "@legendapp/state/react";
import { batch, observable, observe } from "@legendapp/state";


// IMPORTANT: The below shouldnt be imported from "react-native-blocks/core". Use a hook instead.
import { blocks$ } from "../context/blocks$";
import { inputs$ } from "../context/inputs$";
import { createBlock } from "../..";

interface Props {
  blockId: string;
  rest: TextInputProps
}

/**
 * Component that gets better integrated with react-native-blocks store.
 * It automatically registeres the block's TextInput api in the store and prevents the input from being editable when scrolling or dragging the block.
 * Pass a block id and the component will start automatically updating the block's text.
 * 
 * Analyze:
 * [ ] Instead of handling selection locally via useRef, use input$ store + TextInput's selection prop to sync cursor position.
 */
function TextInput(props: Props): React.JSX.Element {
  const { blockId, rest } = props;

  const title = useObservable(blocks$.blocks[blockId].properties.title);

  const inputRef = React.useRef<TextInput>(null);
  // Use blockId to register TextInput api in the text inputs store.

  const selection$ = useObservable({
    start: 0,
    end: 0
  });

  /* const handleOnTextChange = (text: string) =>{
    blocks$.updateBlock(blockId, {
      properties: {
        title: text
      }
    });
  } */

  const handleSubmitEditing = () => {
    console.count("handleOnSubmitEditing");
    const block = blocks$.get().blocks[blockId];
    const parentBlock = blocks$.get().blocks[block.parent];
    const blockIndex = parentBlock.content.indexOf(blockId);
    const selection = selection$.get();

    const newBlockIndex = blockIndex > 0 ? blockIndex : 0;


    const newBlock = createBlock({
      type: "text",
      properties: {
        title: ""
      },
      parent: block.parent,
      content: []
    });

    // If cursor is at the end
    if (selection.start === title.get().length && selection.end === title.get().length) {
      newBlock.properties.title = title.peek();
      
      batch(() => {
        blocks$.insertBlock(newBlock, newBlockIndex);

        blocks$.updateBlock(blockId, {
          properties: {
            title: ""
          }
        });

        selection$.set({
          start: 0,
          end: 0
        });
      });

      // Focus new block
      return;
    }

    if (selection.start === 0 && selection.end === 0) {

      blocks$.insertBlock(newBlock, newBlockIndex);

      // Re focus current block.
      // When the new block is inserted, the focus is lost because of the rerender.
      // Study: Previous Text Block did not need to re focus. Focus was never lost, that means the current block did not get rerendered.
      // If im correct I think this was because the text of the block was updated through a ref. Blocks where only rerendered when there order was rearranged.
      return;
    }

    // If cursos is not at the beginning or end, split the block in half, cutting out the selected text.
    const textBeforeSelection = title.get().substring(0, selection.start);
    const textAfterSelection = title.get().substring(selection.end);

    newBlock.properties.title = textBeforeSelection;

    batch(() => {
      blocks$.insertBlock(newBlock, blockIndex);

      blocks$.updateBlock(blockId, {
        properties: {
          title: textAfterSelection
        }
      });
    });

    selection$.set({ start: 0, end: 0 });
    return;
  }

  const handleOnDeleteKeyPress = () => {
    const selection = selection$.get();
    console.log("Delete key pressed");

    if (selection.start === 0 && selection.end === 0) {
      // Merge with prev block
      const block = blocks$.blocks[blockId];
      const parentBlock = blocks$.blocks[block.parent].get();
      const blockIndex = parentBlock.content.indexOf(blockId);
      // 1. Check if the block has a previous block in the content array of the parent.
      if (blockIndex > 0) {
        // Find the previous block in the content array of the parent.
        const prevBlockId = parentBlock.content[blockIndex - 1];
        const prevBlock = blocks$.blocks[prevBlockId].get();

        // if current block's text is empty, just delete this block and focus prev.
        /* if (title.peek().length === 0) {
          blocks$.removeBlock(blockId);
          return;
        } */

        // Else, merge current block's text with prev block's text.
        batch(() => {
          /* blocks$.updateBlock(prevBlockId, {
            properties: {
              title: prevBlock.properties.title + title.peek()
            }
          });
          blocks$.removeBlock(blockId); */

          blocks$.removeBlock(prevBlockId);
          blocks$.updateBlock(blockId, {
            properties: {
              title: prevBlock.properties.title + title.peek()
            }
          });


          selection$.set({ start: prevBlock.properties.title.length, end: prevBlock.properties.title.length });
        });

        // Focus prev block
      } else {
        console.log("No prev block");
        null;
        // Merge with parent block (This is notion like behavior between text blocks)
      }
    }
  }

  return (
    <$TextInput
      style={styles.text}
      $value={title} // No need to use an onChange handler. $TextInput already updates the value on the store.
      $selection={selection$}
      onSelectionChange={(e) => {
        selection$.set(e.nativeEvent.selection);
      }}
      onSubmitEditing={handleSubmitEditing}
      onKeyPress={(e) => {
        if (e.nativeEvent.key === "Backspace") {
          handleOnDeleteKeyPress();
        }
      }}

      autoCorrect={false}
      multiline={true}
      scrollEnabled={false}
      submitBehavior="submit"
    />
  );
}

export { TextInput };

const styles = StyleSheet.create({
  text: {
    fontSize: 17
  }
});