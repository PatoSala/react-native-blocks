import {
    useTextInput,
    useWebTextInput,
    useBlocksContext,
    useTextBlocksContext,
    createBlock,
    updateBlockData,
    findPrevTextBlockInContent,
    DragProvider
} from "@react-native-blocks/core";
import { View, TextInput, StyleSheet, Platform } from "react-native";

import { ContextMenu } from "./ui/components/ContextMenu/ContextMenu";
import { BlockLayout } from "./ui/components/Block/BlockLayout";
import { TurnInto, DeleteBlock } from "./components/BlockActions";

interface Props {
    blockId: string
}

export function HeaderBlock({ blockId } : Props) {
    const { getTextInputProps, isFocused, getValue, getSelection } = Platform.OS === "web" ? useWebTextInput(blockId) : useTextInput(blockId); // Maybe in the future we can pass a ref to use useImperativeHandle
    const {
        blocks,
        blockTypes,
        turnBlockInto,
        insertBlock,
        updateBlock,
        updateBlockV2,
        removeBlock
    } = useBlocksContext();
    const { inputRefs, textBasedBlocks } = useTextBlocksContext();
    const placeholder = "Header 1";

    const handleWebTextInputHeight = (inputRef, minHeight = 24) => {
        inputRef?.current?.setHeight(`${minHeight}px`);
        inputRef?.current?.setHeight(`${inputRef.current.scrollHeight}px`);
    }

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

        if (value.length === 0) {
            inputRefs.current["ghostInput"]?.current.focus();
            // This timeout prevents the keyboard flicker
            setTimeout(() => {
                turnBlockInto(blockId, "text"); // Maybe this type should be the defaultBlockType (?)

                requestAnimationFrame(() => {
                    inputRefs.current[blockId]?.current.focus(); // Maybe the "ghostTextInput" hack should be done inside this function.
                });
            }, 0);
            return;
        }

         /** 
         * @fix
         * The following line is a hack to fix textarea's height on web since onContentSizeChange does not work properly.
         */
        Platform.OS === "web" && handleWebTextInputHeight(inputRefs.current[blockId]);

        if (selection.start === 0 && selection.end === 0) {
            const newBlock = createBlock({
                type: "text",
                properties: {
                    title: ""
                },
                parent: blocks[blockId].parent,
                content: []
            });

            insertBlock(newBlock, {
                nextBlockId: blockId
            });

            /** Focusing through dom ref works. For some reason using inputRef.current[blockId].current.focus() doesn't work */
            Platform.OS === "web" && inputRefs.current[blockId]?.getRef().current.focus();

            return;
        }

        if (selection.start === value.length && selection.end === value.length) {
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

        const textBeforeSelection = value.substring(0, selection.start);
        const textAfterSelection = value.substring(selection.end);

        inputRefs.current["ghostInput"]?.current.focus();

        const updatedBlock = updateBlockData(blocks[blockId], {
            properties: {
                title: textBeforeSelection
            }
        });
        const newBlock = createBlock({
            type: "text",
            properties: {
                title: textAfterSelection
            },
            parent: blocks[blockId].parent,
            content: []
        });

       updateBlock(updatedBlock);
       insertBlock(newBlock, {
           prevBlockId: blockId
       });

       requestAnimationFrame(() => {
           inputRefs.current[updatedBlock.id]?.current.setText(updatedBlock.properties.title);
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

        if (event.nativeEvent.key === "Backspace" && selection.start === 0 && selection.end === 0) {
            // findPrevTextBlock

            inputRefs.current["ghostInput"]?.current.focus();

            const previousTextBlock = findPrevTextBlockInContent(blockId, blocks, textBasedBlocks);
            
            if (previousTextBlock === undefined) {
                const parentBlock = blocks[blocks[blockId].parent];
                const isTextBased = textBasedBlocks.includes(parentBlock.type);
                
                if (isTextBased) {
                    updateBlockV2(parentBlock.id, {
                        properties: {
                            title: parentBlock.properties.title + value
                        }
                    });
                    removeBlock(blockId);

                    requestAnimationFrame(() => {
                        inputRefs.current[parentBlock.id]?.current.setText(parentBlock.properties.title + value); // Find a way so that blocks update their content automatically
                        inputRefs.current[parentBlock.id]?.current.setSelection({
                            start: parentBlock.properties.title.length,
                            end: parentBlock.properties.title.length
                        })
                        inputRefs.current[parentBlock.id]?.current.focus();
                    });
                }
                return;
            }

            updateBlockV2(previousTextBlock.id, {
                properties: {
                    title: previousTextBlock.properties.title + value
                }
            });
            removeBlock(blockId);

            requestAnimationFrame(() => {
                inputRefs.current[previousTextBlock.id]?.current.setText(previousTextBlock.properties.title + value); // Find a way so that blocks update their content automatically
                inputRefs.current[previousTextBlock.id]?.current.setSelection({
                    start: previousTextBlock.properties.title.length,
                    end: previousTextBlock.properties.title.length
                })
                inputRefs.current[previousTextBlock.id]?.current.focus();
            });
        }
    };

    return (
        <BlockLayout
            blockId={blockId}
            style={{
                marginTop: 32,
                marginBottom: 8
            }}
            contextMenuContent={(
                <>
                    <ContextMenu.SubTitle>
                        {blockTypes[blocks[blockId].type].options.name}
                    </ContextMenu.SubTitle>
                    <TurnInto blockId={blockId}/>
                    <DeleteBlock blockId={blockId}/>
                </>
            )}
        >
            {(hovered) => (
                <View style={styles.container}>
                        <TextInput
                            // ref={inputRef}
                            key={blockId}
                            style={styles.header}
                            {...getTextInputProps()}
                            /** Web only */
                            {...Platform.OS === "web" && {
                                onLayout: () => {
                                    inputRefs.current[blockId]?.current?.setHeight("0px");
                                    inputRefs.current[blockId]?.current?.setHeight(`${inputRefs.current[blockId].current?.getRef().current.scrollHeight}px`);
                                },
                                onChangeText: (text) => {
                                    getTextInputProps().onChangeText(text)

                                    if (Platform.OS === "web") {
                                        window.requestAnimationFrame(() => {
                                            inputRefs.current[blockId]?.current?.setHeight("0px");
                                            inputRefs.current[blockId]?.current?.setHeight(`${inputRefs.current[blockId].current?.getRef().current.scrollHeight}px`);
                                        })
                                    }
                                },
                                onContentSizeChange: () => {
                                    window.requestAnimationFrame(() => {
                                        inputRefs.current[blockId]?.current?.setHeight("0px");
                                        inputRefs.current[blockId]?.current?.setHeight(`${inputRefs.current[blockId].current?.getRef().current.scrollHeight}px`);
                                    })
                                }
                            }}
                            placeholder={placeholder}
                            placeholderTextColor={"#37352f26"}
                            onSubmitEditing={handleSubmitEditing}
                            onKeyPress={handleOnKeyPress}
                        />
                </View>
            )}
        </BlockLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
    },
    header: {
        fontWeight: "bold",
        fontSize: 28,
        lineHeight: 34,
        flexWrap: "wrap",
        outline: 'none',
        outlineStyle: 'none',
        boxShadow: 'none',
        border: 'none',
        whiteSpace: "break-spaces",
        wordBreak: "break-word"
    }
});