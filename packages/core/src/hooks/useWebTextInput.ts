import React, { useState } from "react";
import { TextInput, TextInputProps, Platform } from "react-native";
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

/** 
 * Same as useTextInput but for web.  
 * It mainly replaces uncontrolled value from controlled because it works better on web. */
export function useWebTextInput(blockId: string) {
    const {
        blocks,
        focusedBlockId,
        setFocusedBlockId,
        updateBlock,
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
    const [selection, setSelection] = React.useState({ start: title.length, end: title.length });
    const [value, setValue] = React.useState(title);

    const isFocused = focusedBlockId === blockId;
    const isEditable = isScrolling === false && isDragging.value === false
        ? true
        : focusedBlockId === blockId    // Keep focusd block editable whn scrolling.
            ? true
            : false;

    const [height, setHeight] = useState(0);
    console.log(height);
    const api = {
        current: {
            getText: () => value,
            setText: (text: string) => {
                setValue(text);
            },
            focus: () => {
                inputRef.current?.focus();
            },
            blur: () => {
                inputRef.current?.blur();
            },
            setSelection: (selection: { start: number; end: number }) => {
                setSelection(selection);
            },
            getPosition: () => {
                inputRef.current?.measureInWindow((x, y, width, height) => {
                    console.log(x, y, width, height);
                })
            }
        }
    };

    function handleSelectionChange(event: { nativeEvent: { selection: { start: number; end: number; }; }; }) {
        setSelection(event.nativeEvent.selection);
    }

    // Review this: handleOnBlur is messing up with handleSubmit.
    function handleOnBlur() {
       const updatedBlock = updateBlockData(blocks[blockId], {
            properties: {
                title: value
            }
        });
        updateBlock(updatedBlock);
    }


    const handleOnFocus = () => {
        setFocusedBlockId(blockId);
    }

    const handleChangeText = (text: string) => {
        setValue(text);
    }

    const getTextInputProps : () => TextInputProps = () => {
        return {
            ref: inputRef,
            value: value,
            selection: selection,
            /** Disable multiline text input scrolling. */
            scrollEnabled: false,
            multiline: true,
            selectionColor: "black",
            /** Prevents keyboard from flickering when focusing a new block. */
            submitBehavior: "blurAndSubmit",
            blurOnSubmit: true,
            selectTextOnFocus: false,
            smartInsertDelete: false,
            /** Prevents the text input being accidentally focused when scrolling/moving a block. */
            editable: isEditable,

            onSelectionChange: handleSelectionChange,
            showSoftInputOnFocus: showSoftInputOnFocus,
            onChangeText: handleChangeText,
            onBlur: handleOnBlur,
            onFocus: handleOnFocus,

            onContentSizeChange: (event) => {
                setHeight(event.nativeEvent.contentSize.height);
            }
        }
    }

    React.useEffect(() => {
        if (inputRef.current) {
            registerRef(blockId, api);
        }
    }, []);

    return {
        getTextInputProps,
        isFocused,
        getValue: () => value,
        getSelection: () => selection
    };
}