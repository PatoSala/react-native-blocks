import React from "react";
import { $TextInput } from "@legendapp/state/react-native";
import { TextInputProps, StyleSheet } from "react-native";
import { useValue, useObservable } from "@legendapp/state/react";
import { batch, observable, observe } from "@legendapp/state";

import { findClosestPreviousBlock, updateBlockData } from "../..";

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
  const selection$ = useObservable({
    start: 0,
    end: 0
  });

  const onFocusCallback = React.useRef(() => {});

  const api = {
    focus: (selection?: { start: number; end: number }) => {
      if (selection) onFocusCallback.current = () => {
        selection$.set(selection);
      };

      inputRef.current?.focus();

    }
  }

  const handleSubmitEditing = () => {
    const block = blocks$.get().blocks[blockId];
    const parentBlock = blocks$.get().blocks[block.parent];
    const blockIndex = parentBlock.content.indexOf(blockId);
    const newBlockIndex = blockIndex > 0 ? blockIndex : 0;

    const selection = selection$.get();

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

    if (selection?.start === 0 && selection?.end === 0) {
      // Merge with prev block
      const block = blocks$.blocks[blockId];
      const parentBlock = blocks$.blocks[block.parent].get();
      const blockIndex = parentBlock.content.indexOf(blockId);
      // 1. Check if the block has a previous block in the content array of the parent.
      if (blockIndex > 0) {
        /** ATTENTION: The below is assumming that the previous block is always a text block. */
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
          blocks$.removeBlock(prevBlockId);
          blocks$.updateBlock(blockId, {
            properties: {
              title: prevBlock.properties.title + title.peek()
            }
          });

          selection$.set({
            start: prevBlock.properties.title.length,
            end: prevBlock.properties.title.length
          });
        });

        // Focus prev block
      } else {

        console.log("Fetching closest previous text block");
        // Merge with parent block (This is notion like behavior between text blocks)
        // Check its not the root block
        // 1. Fetch closest previous text block
        const prevTextBlock = findClosestPreviousBlock(blockId, blocks$.blocks.peek(), ["text"]); //findPrevTextBlockInContent(blockId, blocks$.blocks.peek(), ["text"]);

        if (!prevTextBlock) {
          console.log("No prev text block");
          return;
        }

        // 2. Copy prev text block title to current block
        // 4. Change the parent of the current block to the parent of the prev text block
        // 5. Change current block's type to the previous text block's type
        const updatedPrevBlock = updateBlockData(prevTextBlock, {
          properties: {
            title: prevTextBlock.properties.title + title.peek()
          },
        });

        // Remove current block from its parent content array
        const updatedParentBlockContent = parentBlock.content.toSpliced(blockIndex, 1);
        // Remove prev text block from its parent content array and insert in its place the current block
        /* const updatedPrevBlockParentContent = prevBlockParent.content.toSpliced(prevTextBlockIndex, 1);
        updatedPrevBlockParentContent.splice(prevTextBlockIndex, 0, blockId); */

        batch(() => {
          blocks$.updateBlock(prevTextBlock.id, updatedPrevBlock);
          blocks$.removeBlock(blockId);
          blocks$.blocks[parentBlock.id].content.set(updatedParentBlockContent);
          /* blocks$.blocks[prevBlockParent.id].content.set(updatedPrevBlockParentContent); */
        });

        /* selection$.set({ start: prevTextBlock.properties.title.length, end: prevTextBlock.properties.title.length }); */
        // 3. Delete prev text block
        // 6. Remove current block from its parent content array
        const prevTextBlockInput = inputs$.refs[prevTextBlock.id].peek();

        prevTextBlockInput?.focus({
          start: 25,
          end: 25
        });
      }
    }
  }

  React.useEffect(() => {
    if (inputRef.current) {
      inputs$.register(blockId, api);
    }
  }, []);

  return (
    <$TextInput
      ref={inputRef}
      style={styles.text}
      $value={title} // No need to use an onChange handler. $TextInput already updates the value on the store.
      $selection={selection$}
      onSelectionChange={(e) => {
        selection$.set(e.nativeEvent.selection);
      }}
      onFocus={() => {
        // Execute the onFocusCallback only once
        onFocusCallback.current?.();
        // Clean up onFocusCallback
        onFocusCallback.current = () => {};
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