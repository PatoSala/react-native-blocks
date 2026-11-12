import React from "react";
import { $TextInput } from "@legendapp/state/react-native";
import { TextInputProps } from "react-native";
import { useValue, useObservable } from "@legendapp/state/react";
import { batch, observable } from "@legendapp/state";



// IMPORTANT: The below shouldnt be imported from "react-native-blocks/core". Use a hook instead.
import { blocks$ } from "../context/blocks$";
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
function TextInput(props: Props) : React.JSX.Element {
  const { blockId, rest } = props;
  console.log("Block id", blockId);
  const title = useValue(blocks$.blocks[blockId].properties.title);
  console.log("Title", title);
  const inputRef = React.useRef<TextInput>(null);
  const selectionRef = React.useRef({ start: /* title.length */0, end: /* title.length */0 });
  // Use blockId to register TextInput api in the text inputs store.

  const selection$ = useObservable({
    start: 0,
    end: 0
  });

  /**
   * This api gets registered in a ref to easily manipulate the text input from other blocks.
   * 
   * To do:
   * [ ] Right now block's text is synced through this api in order to prevent rerendering. Try using legend-state instead and see if it works better.
   * [ ] Keep selection, focus and blur handling with this api.
   */
  const api = {
    current: {
      // getText() and setText() should be deprecated.
      /* getText: () => valueRef.current,
      setText: (text: string) => {
        valueRef.current = text;
        inputRef.current?.setNativeProps({ text: valueRef.current });
      }, */

      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      setSelection: (selection: { start: number; end: number }) => {
        inputRef.current?.setSelection(selection.start, selection.end);
        selectionRef.current = selection;
      },

      // I think its not in use by any block.
      // Its better to first use setSelection() and the focus() in order to focus with a predefined selection.
    }
  };

  const inputProps = {
    selection: {
      start: 0,
      end: 0
    }
  }

  const handleOnTextChange = (text: string) =>{
    blocks$.updateBlock(blockId, {
      properties: {
        title: text
      }
    });
  }

  const handleSubmitEditing = () => {
    const block = blocks$.get().blocks[blockId];
    const selection = selection$.get();

    if (selection.start === title.length && selection.end === title.length) {
      // Insert new block below
      const newBlock = createBlock({
        type: "text",
        properties: {
          title: ""
        },
        parent: block.parent,
        content: []
      });

      blocks$.insertBlock(newBlock, {
        prevBlockId: blockId
      });

      // Focus new block
    }

    if (selection.start === 0 && selection.end === 0) {
      // Insert new block above
      const newBlock = createBlock({
        type: "text",
        properties: {
          title: ""
        },
        parent: block.parent,
        content: []
      });

      blocks$.insertBlock(newBlock, {
        nextBlockId: blockId
      });

      // Re focus current block.
      // When the new block is inserted, the focus is lost because of the rerender.
      // Study: Previous Text Block did not need to re focus. Focus was never lost, that means the current block did not get rerendered.
      // If im correct I think this was because the text of the block was updated through a ref. Blocks where only rerendered when there order was rearranged.
    }

    // If cursos is not at the beginning or end, split the block in half, cutting out the selected text.
    const textBeforeSelection = title.substring(0, selection.start);
    const textAfterSelection = title.substring(selection.end);

    const newBlock = createBlock({
      type: "text",
      properties: {
        title: textAfterSelection
      },
      parent: block.parent,
      content: []
    });

    batch(() => {
      blocks$.updateBlock(blockId, {
        properties: {
          title: textBeforeSelection
        }
      });

      blocks$.insertBlock(newBlock, {
        prevBlockId: blockId
      });
    })
  }

  const handleOnDeleteKeyPress = () => {
    const selection = selection$.get();

    if (selection.start === 0 && selection.end === 0) {
      // Merge with prev block
      const block = blocks$.blocks[blockId];
      const parentBlock = blocks$.blocks[block.parent].get();
      const blockIndex = parentBlock.content.indexOf(blockId);
      console.log("block index", blockIndex);
      // 1. Check if the block has a previous block in the content array of the parent.
      if (blockIndex > 0) {
        // Find the previous block in the content array of the parent.
        const prevBlockId = parentBlock.content[blockIndex - 1];
        const prevBlock = blocks$.blocks[prevBlockId].get();

        // if current block's text is empty, just delete this block and focus prev.


        // Else, merge current block's text with prev block's text.
        
      }
    }
  }

  return (
    <$TextInput
      $value={title}
      $selection={selection$}
      onSelectionChange={(e) => selection$.set(e.nativeEvent.selection)}
      onChangeText={(text) => handleOnTextChange(text)}

      onSubmitEditing={handleSubmitEditing}
      onKeyPress={(e) => {
        if (e.nativeEvent.key === "Backspace") {
          handleOnDeleteKeyPress();
        }
      }}
    />
  );
}

export { TextInput };