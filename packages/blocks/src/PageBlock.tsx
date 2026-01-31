import React, { useState } from "react";
import {
    useTextInput,
    useWebTextInput,
    useBlocksContext,
    useTextBlocksContext,
    useBlock,
    updateBlockData,
    createBlock,
    DragProvider
} from "@react-native-blocks/core";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Modal, Button, Image, Dimensions, Pressable, Platform } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from 'expo-image-picker';

import { Hoverable } from "./ui/components/Hoverable/Hoverable";

function containsEmoji(str: string) {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;
  return emojiRegex.test(str);
}

interface Props {
    blockId: string
}

export function PageBlock({ blockId } : Props) {
    const {
        getTextInputProps,
        getValue,
        getSelection,
    } = Platform.OS === "web" ? useWebTextInput(blockId) : useTextInput(blockId);
    const {
        blocks,
        insertBlock,
        updateBlock,
        updateBlockV2,
        blocksOrder,
    } = useBlocksContext();
    const {
        inputRefs
    } = useTextBlocksContext();
    const { properties } = useBlock(blockId);

    // This condition should be renamed to "isFirstBlock" or sth like that.
    const isRootBlock = blocks["root"].content[0] === blockId;
    const [showEmojiSelector, setShowEmojiSelector] = useState(false);
    const [pageIcon, setPageIcon] = useState<string | null>(blocks[blockId]?.format?.page_icon || null);
    const [pageCover, setPageCover] = useState<string | null>(blocks[blockId]?.format?.page_cover || null);
    const placeholder = "New page";

    const handleWebTextInputHeight = (inputRef, minHeight = 24) => {
        inputRef?.current?.setHeight(`${minHeight}px`);
        inputRef?.current?.setHeight(`${inputRef.current.scrollHeight}px`);
    }

    const pickCover = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        });
    
        if (!result.canceled) {
          setPageCover(result.assets[0].uri);
    
          const updatedBlock = updateBlockData(blocks[blockId], {
            format: {
                page_cover: result.assets[0].uri
                /* page_cover_position */
            }
          });
    
          updateBlock(updatedBlock);
        }
    }

    const pickIcon = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 1,
          aspect: [4, 3]
        });
    
        if (!result.canceled) {
          setPageIcon(result.assets[0].uri);
          /* setAspectRatio(result.assets[0].width / result.assets[0].height); */
            setShowEmojiSelector(false);

          const updatedBlock = updateBlockData(blocks[blockId], {
            format: {
                page_icon: result.assets[0].uri,
                ...blocks[blockId]?.format
            }
          });
    
          updateBlock(updatedBlock);
        }
      };

    const handleEmojiSelect = (emoji: string) => {
        setPageIcon(emoji);
        setShowEmojiSelector(false);

        const updatedBlock = updateBlockData(blocks[blockId], {
            format: {
            page_icon: emoji,
            ...blocks[blockId]?.format
            }
        });

        updateBlock(updatedBlock);
    };

    const handleRemoveIcon = () => {
        setPageIcon(null);
        setShowEmojiSelector(false);

        const block = blocks[blockId];
        delete block.format.page_icon;

        updateBlock(block);
    };

    const handleRemoveCover = () => {
        setPageCover(null);

        const block = blocks[blockId];
        delete block.format.page_cover;

        updateBlock(block);
    };

    const handleSubmitEditing = () => {
        const value = getValue();
        const selection = getSelection();

        Platform.OS === "web" && handleWebTextInputHeight(inputRefs.current[blockId], 42);

        if (selection.start === value.length && selection.end === value.length) {
            const newBlock = createBlock({
                type: "text",
                properties: {
                    title: ""
                },
                parent: blockId,
                content: []
            });

            insertBlock(newBlock, {
                nextBlockId: blocks[blockId].content[0]
            });

            requestAnimationFrame(() => {
                inputRefs.current[newBlock.id]?.current.focus();
            })
            return;
        }

        if (selection.start === 0 && selection.end === 0) {
            const newBlock = createBlock({
                type: "text",
                properties: {
                    title: value
                },
                parent: blockId,
                content: []
            });

            updateBlockV2(blockId, {
                properties: {
                    title: ""
                }
            });

            insertBlock(newBlock, {
                nextBlockId: blocks[blockId].content[0]
            });

            requestAnimationFrame(() => {
                inputRefs.current[blockId].current.setText("");
                inputRefs.current[newBlock.id]?.current.setSelection({
                    start: 0,
                    end: 0
                });
                inputRefs.current[newBlock.id]?.current.focus();
            })
            return;
        }

        const textBeforeSelection = value.substring(0, selection.start);
        const textAfterSelection = value.substring(selection.end);

        const newBlock = createBlock({
            type: "text",
            properties: {
                title: textAfterSelection
            },
            parent: blockId,
            content: []
        });

       updateBlockV2(blockId, {
            properties: {
                title: textBeforeSelection
            }
         });

       insertBlock(newBlock, {
           nextBlockId: blocks[blockId].content[0]
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
        const selection = getSelection();

        if (event.nativeEvent.key === "Backspace" && selection.start === 0 && selection.end === 0) {
            return;
        }
    }

    return (
        <>
            {pageCover && isRootBlock && (
                <View style={[
                    styles.cover,
                    Platform.OS !== "web" && {
                        height: 200
                    }
                ]}>
                    <Image
                        style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: "cover"
                        }}
                        source={{ uri: pageCover }}
                    />
                </View>
            )}
            <View
                style={{
                    ...Platform.OS === "web" ? {
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        marginBottom: 8
                        } : {}
                }}
            >
                {/* { isRootBlock && pageCover
                    ? (
                        <View style={styles.cover}>
                            <View style={{
                                right: 16,
                                display: pageCover === null ? "none" : "flex",
                                flexDirection: "row",
                                gap: 8
                            }}>
                                <Pressable style={[styles.coverBtn, { display: pageIcon === null ? "flex" : "none" }]} onPress={() => setShowEmojiSelector(true)}>
                                    <Text style={styles.pageBtnText}>Add icon</Text>
                                </Pressable>
                                
                                <Pressable style={styles.coverBtn} onPress={handleRemoveCover}>
                                    <Text style={styles.pageBtnText}>Remove cover</Text>
                                </Pressable>
                            </View>

                            <Image
                                source={{ uri: pageCover }}
                                style={{ width: "100%", height: 200 }}
                            />
                        </View>
                    )
                    : null} */}

                {/* Content */}
                <View style={[
                    styles.container,
                    Platform.OS === "web" && {
                        width: "100%",
                        maxWidth: 700,
                    }
                ]}>
                    {isRootBlock
                    ? (
                        <>
                            {/* Page icon */}
                            {pageIcon && (
                                <View
                                    style={{
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        width: Platform.OS === "web" ? 78 : 64,
                                        aspectRatio: 1,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginTop: 96,
                                        /* Have in mind mobile for the margin top */
                                        ...pageCover && {
                                            marginTop: 0,
                                                aspectRatio: 2 / 1
                                        }
                                    }}
                                >
                                    <Pressable
                                        onPress={() => setShowEmojiSelector(true)}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            ...pageCover && {
                                                position: "relative",
                                                top: "-50%",
                                                zIndex: 1,
                                            }
                                        }}
                                    >
                                        {containsEmoji(pageIcon) === false
                                        ? (
                                            <Image
                                                source={{ uri: pageIcon }}
                                                style={{ width: "100%", height: "100%" }}
                                            />
                                        )
                                        : (
                                            <Text style={{
                                                fontSize: Platform.OS === "web" ? 78 : 54
                                            }}>
                                                {pageIcon}
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            )}

                            {/* Page controls [icon, cover] */}
                            <Hoverable
                                style={[
                                    {
                                        minHeight: 28,
                                        boxSizing: "content-box",
                                        paddingBottom: 4,
                                        paddingTop:
                                            !pageIcon && !pageCover
                                                ? 80
                                                :  pageIcon && pageCover
                                                    ? 8 
                                                    : pageCover && !pageIcon
                                                        ? 16 : 8,
                                        flexDirection: "row",
                                        gap: 8
                                    }
                                ]}
                            >
                                {({ hovered }) => (
                                    <>
                                        {console.log("hovered", hovered)}
                                        {pageIcon === null && (
                                            <Pressable
                                                style={({ hovered: buttonHovered }) => [
                                                    styles.pageBtn,
                                                    Platform.OS === "web" && {
                                                        opacity: hovered ? 1 : 0,
                                                        backgroundColor: buttonHovered ? "#2a1c0012" : "transparent",
                                                        paddingHorizontal: 8
                                                    }
                                                ]}
                                                onPress={() => setShowEmojiSelector(true)}
                                            >
                                                <Text style={styles.pageBtnText}>Add icon</Text>
                                            </Pressable>
                                        )}

                                        {pageCover === null && (
                                            <Pressable
                                                style={({ hovered: buttonHovered }) => [
                                                    styles.pageBtn,
                                                    Platform.OS === "web" && {
                                                        opacity: hovered ? 1 : 0,
                                                        backgroundColor: buttonHovered ? "#2a1c0012" : "transparent",
                                                        paddingHorizontal: 8
                                                    }
                                                ]}
                                                onPress={pickCover}
                                            >
                                                <Text style={styles.pageBtnText}>Add cover</Text>
                                            </Pressable>
                                        )}
                                    </>
                                )}
                            </Hoverable>

                            <TextInput
                                key={`input-${blockId}`}   // Really important to pass the key prop
                                style={[styles.page]}
                                {...getTextInputProps()}
                                {...Platform.OS === "web" && {
                                    onLayout: () => {
                                        inputRefs.current[blockId]?.current?.setHeight("0px");
                                        inputRefs.current[blockId]?.current?.setHeight(`${inputRefs.current[blockId].current?.getRef().current.scrollHeight}px`);
                                    },
                                    onChangeText: (text) => {
                                        console.log("TEXT", text);
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
                                onSubmitEditing={handleSubmitEditing}
                                onKeyPress={handleOnKeyPress}
                                placeholder={placeholder}
                                placeholderTextColor={"#37352f26"}                                
                            />
                        </>
                    )
                    : (
                        /* Block layout should go here */
                        <DragProvider blockId={blockId}>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    onPress={() => setShowEmojiSelector(true)}
                                    style={styles.iconContainer}
                                >

                                    {pageIcon === null
                                    ? (
                                        <Ionicons name="document-text-outline" size={24} color="black" />
                                    ) : (
                                        <>
                                            {containsEmoji(pageIcon) === false
                                            ? (
                                                <Image
                                                    source={{ uri: pageIcon }}
                                                    style={{ width: "100%", height: "100%" }}
                                                />
                                            )
                                            : (
                                                <Text style={styles.icon}>
                                                    {pageIcon}
                                                </Text>
                                            )}
                                        </>
                                    )}
                                </TouchableOpacity>
                                
                                <Text style={styles.text}>
                                    {properties.title.length === 0 ? placeholder : properties.title}
                                </Text>
                            </View>
                        </DragProvider>
                    )}

                    <Modal
                        visible={showEmojiSelector}
                        onRequestClose={() => setShowEmojiSelector(false)}
                        presentationStyle="pageSheet"
                        animationType="slide"
                    >
                        <View style={styles.header}>
                            <Button
                                title="Remove"
                                onPress={handleRemoveIcon}
                            />
                            <Text style={styles.headerTitle}>Page Icon</Text>
                            <Button
                                title="Close"
                                onPress={() => setShowEmojiSelector(false)}
                            />
                        </View>

                        <View style={{ alignItems: "flex-start", marginHorizontal: 8 }}>
                            <Button
                                title="Upload image"
                                onPress={() => {
                                    setShowEmojiSelector(false);
                                    setTimeout(() => {
                                        pickIcon();
                                    }, 1000);
                                }}
                            />
                        </View>

                        <EmojiSelector
                            columns={8}
                            showTabs={false}
                            onEmojiSelected={handleEmojiSelect}
                        />
                    </Modal>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
    },
    root: {
        marginTop: 32,
        gap: 8,
        marginBottom: 4
    },
    row: {
        flexDirection: "row",
        gap: 4,
        alignItems: "center"
    },
    cover: {
        width: "100%",
        height: 255,
        backgroundColor: "lightgray"
    },
    coverBtn: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1,
        padding: 4,
        borderRadius: 4
    },
    page: {
        fontSize: 36,
        fontWeight: "bold",
        lineHeight: 42,
        marginTop: 3,
        marginBottom: 4,
        flexWrap: "wrap",
        outline: "none",
        outlineStyle: 'none',
        boxShadow: 'none',
        border: 'none'
    },
    pageBtn: {
        flexDirection: "row",
        marginRight: 8,
        gap: 6,
        alignItems: "center",
        borderRadius: 6,
        cursor: "pointer",
        transition: "opacity 100ms",
    },
    pageBtnText: {
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 22,
        color: "#a19e99",
    },
    text: {
        fontSize: 16,
        fontWeight: "normal",
        paddingVertical: 6,
        lineHeight: 24,
        flexWrap: "wrap"
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 32,
        width: 32,
        borderRadius: 4,
        overflow: "hidden"
    },
    icon: {
        fontSize: 24,
    },
    header: {
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "500"
    }
});