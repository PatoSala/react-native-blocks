import {
    useTextInput,
    useWebTextInput,
    useTextBlocksContext,
    useBlocksContext,
    createBlock
} from "@react-native-blocks/core";
import { View, TextInput, StyleSheet, Platform } from "react-native";

import { BlockLayout } from "./ui/components/Block/BlockLayout";
import { ContextMenu } from "./ui/components/ContextMenu/ContextMenu";
import { TurnInto, DeleteBlock } from "./components/BlockActions";

interface Props {
    blockId: string
}

const handleWebTextInputHeight = (inputRef, minHeight = 24) => {
    inputRef?.current?.setHeight(`${minHeight}px`);
    inputRef?.current?.setHeight(`${inputRef.current.scrollHeight}px`);
}

export function QuoteBlock({ blockId } : Props) {
    const { getTextInputProps, getValue, getSelection } = Platform.OS === "web" ? useWebTextInput(blockId) : useTextInput(blockId);
    const { inputRefs } = useTextBlocksContext();
    const {
        blocks,
        blockTypes,
        insertBlock,
        updateBlockV2,
    } = useBlocksContext();

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

         if (value.length === 0) {
            inputRefs.current["ghostInput"]?.current.focus();

            setTimeout(() => {
                updateBlockV2(blockId, {
                    type: "text",
                    properties: {
                        title: value
                    }
                });
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

        const newBlock = createBlock({
            type: "text",
            properties: {
                title: textAfterSelection
            },
            parent: blocks[blockId].parent,
            content: []
        });

       updateBlockV2(blockId, {
            properties: {
                title: textBeforeSelection
            }
         });

       insertBlock(newBlock, {
           prevBlockId: blockId
       });

       requestAnimationFrame(() => {
           inputRefs.current[blockId]?.current.setText(textBeforeSelection);
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
            inputRefs.current["ghostInput"]?.current.focus();

            setTimeout(() => {
                updateBlockV2(blockId, {
                    type: "text",
                    properties: {
                        title: value
                    }
                });
                requestAnimationFrame(() => {
                    inputRefs.current[blockId]?.current.setSelection({
                        start: 0,
                        end: 0
                    })
                    inputRefs.current[blockId]?.current.focus(); // Maybe the "ghostTextInput" hack should be done inside this function.
                });
            }, 0);
        }
    };

    return (
        <BlockLayout
            blockId={blockId}
            style={{
                marginVertical: 16
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
                    <View style={styles.quote}>
                        <TextInput
                            key={blockId}
                            style={styles.text}
                            {...getTextInputProps()}
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
                            onKeyPress={handleOnKeyPress}
                            onSubmitEditing={handleSubmitEditing}
                            placeholder="Empty quote"
                            placeholderTextColor={"#37352f26"}
                        />
                    </View>
                </View>
            )}
        </BlockLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8
    },
    quote: {
        flexDirection: "row",
        /* overflow: "hidden", */
        boxSizing: "border-box",
        paddingLeft: 16,
        alignItems: "center",
        gap: 12,
        borderLeftColor: "#000000",
        borderLeftWidth: 2.5,
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        lineHeight: 24,
        marginRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        flexGrow: 1,
        outline: 'none',
        outlineStyle: 'none',
        boxShadow: 'none',
        border: 'none',
        whiteSpace: "break-spaces",
        wordBreak: "break-word"
    },
    border: {
        width: 2.5,
        height: "100%",
        backgroundColor: "#000000"
    }
});