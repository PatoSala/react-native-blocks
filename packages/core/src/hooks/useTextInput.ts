import React, { useMemo } from "react";
import { TextInput, TextInputProps } from "react-native";
import { useBlocksContext, useBlock } from "../components/BlocksContext";
import { useTextBlocksContext } from "../components/TextBlocksProvider";
import { scheduleOnUI } from "react-native-worklets";
import {
  updateBlockData,
  findPrevTextBlockInContent,
  getPreviousBlockInContent
} from "../core/updateBlock";
import { useScrollContext } from "../components/ScrollProvider";
import { useBlocksMeasuresContext } from "../components/BlocksMeasuresProvider";
import { useBlockRegistrationContext } from "../components/BlockRegistration";

export function useTextInput(blockId: string) {
  const {
    blocks,
    focusedBlockId,
    setFocusedBlockId,
    updateBlockV2,
    getBlockSnapshot
  } = useBlocksContext();
  const {
    registerRef,
    showSoftInputOnFocus,
  } = useTextBlocksContext();
  const { isScrolling } = useScrollContext();
  const { isDragging } = useBlocksMeasuresContext();

  const block = getBlockSnapshot(blockId);
  const title = block.properties.title;
  const inputRef = React.useRef<TextInput>(null);
  const selectionRef = React.useRef({ start: title.length, end: title.length });
  const valueRef = React.useRef(title);
  const isFocused = focusedBlockId === blockId;
  const isEditable = isScrolling === false && isDragging.value === false
    ? true
    : focusedBlockId === blockId    // Keep focusd block editable whn scrolling.
      ? true
      : false;

  const api = {
    current: {
      getText: () => valueRef.current,
      setText: (text: string) => {
        valueRef.current = text;
        inputRef.current?.setNativeProps({ text: valueRef.current });
      },
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
      focusWithSelection: (selection: { start: number; end: number }, text?: string) => {
        /** Find a better way to sync value on block update */
        if (text !== undefined) {
          inputRef.current?.setNativeProps({ text });
          /* valueRef.current = text; */
        }

        inputRef.current?.setSelection(selection.start, selection.end); // Sync native input with selection state
        selectionRef.current = selection;
        inputRef.current?.focus();
      },
      getPosition: () => {
        inputRef.current?.measureInWindow((x, y, width, height) => {
          console.log(x, y, width, height);
        })
      }
    }
  };

  function handleSelectionChange(event: { nativeEvent: { selection: { start: number; end: number; }; }; }) {
    selectionRef.current = event.nativeEvent.selection;
  }

  // Review this: handleOnBlur is messing up with handleSubmit.
  function handleOnBlur() {
    const updatedBlock = updateBlockData(blocks[blockId], {
      properties: {
        title: valueRef.current
      }
    });
    updateBlockV2(updatedBlock.id, updatedBlock);
  }

  const handleOnFocus = () => {
    setFocusedBlockId(blockId);
  }

  const handleChangeText = (text: string) => {
    valueRef.current = text;
  }

  const getTextInputProps: () => TextInputProps = () => {
    return {
      ref: inputRef,
      defaultValue: valueRef.current,
      /** Disable multiline text input scrolling. */
      scrollEnabled: false,
      multiline: true,
      selectionColor: "black",
      /** Prevents keyboard from flickering when focusing a new block. */
      submitBehavior: "submit",
      selectTextOnFocus: false,
      smartInsertDelete: false,
      /** Prevents the text input being accidentally focused when scrolling/moving a block. */
      editable: isEditable,

      onSelectionChange: handleSelectionChange,
      showSoftInputOnFocus: showSoftInputOnFocus,
      onChangeText: handleChangeText,
      onBlur: handleOnBlur,
      onFocus: handleOnFocus,
    }
  }

  React.useEffect(() => {
    if (inputRef.current) {
      registerRef(blockId, api);

      /** 
       * PATCH: Known issue on latest react-native version.
       * [#52854](https://github.com/facebook/react-native/issues/52854)
       */
      if (title.length === 0) {
        inputRef.current.setNativeProps({ text: " " });
        inputRef.current.setNativeProps({ text: "" });
      }
    }
    /** Needs review:
     * The below code was commented because some input refs where
     * being unregistered when they where still mounted.
     * It might be related to the text inputs being re rendered.
     *  */

    /* return () => {
        unregisterRef(blockId);
        console.log("UnregisterUNREGISTERed block", blockId);
    }; */
  }, []);

  /*  React.useEffect(() => {
      if (shouldUpdate.includes(blockId)) {
          console.log("SHOULD UPDATE", blockId);
          api.current.setText(blocks[blockId].properties.title);
          
          setShouldUpdate(prevState => prevState.filter(id => id !== blockId));
      }
   }, [shouldUpdate]); */


  return {
    getTextInputProps,
    isFocused,
    getValue: () => valueRef.current,
    getSelection: () => selectionRef.current
  };
}