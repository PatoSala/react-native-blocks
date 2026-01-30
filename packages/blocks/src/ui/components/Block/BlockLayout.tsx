import { useState, useRef } from "react";
import { View, StyleSheet, Platform, Pressable, Text } from "react-native";
import { Ionicons, Octicons } from '@expo/vector-icons';
import { DragProvider } from "@react-native-blocks/core";
import { ContextMenu } from "../ContextMenu/ContextMenu";

export function BlockLayout({
    children,
    blockId,
    style,
    contextMenuContent
}) {
    const contextMenuRef = useRef(null);
    const contextMenuButtonRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [isContextMenuVisible, setContextMenuVisible] = useState(false);

    const handleOpenContextMenu = (e) => {
        contextMenuButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
            contextMenuRef.current.show({
                x: pageX - 256 - 16,
                y: pageY
            });
        })
        setContextMenuVisible(true);
    }

    const handleCloseContextMenu = () => {
        contextMenuRef.current.hide();
        setContextMenuVisible(false);
    }

    return (
        <View style={style}>
            {Platform.OS == "web"
            ? (
                <View
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={[{
                        paddingHorizontal: "22%",
                        flexDirection: "row",
                        alignItems: "center"
                    }]}
                >
                    {/* Web controls */}
                    <View style={{
                        position: "relative",
                        flex: 1
                    }}>
                        <View style={[styles.blockActions, { display: hovered ? "flex" : "none" }]}>
                            <Pressable
                                style={({ hovered }) => [styles.button, hovered && styles.hover]}
                            >
                                <Ionicons name="add" size={24} color="#ada9a3" />
                            </Pressable>

                            <Pressable
                                ref={contextMenuButtonRef}
                                onPress={handleOpenContextMenu}
                                style={({ hovered }) => [
                                    styles.button,
                                    {
                                        width: 20,
                                        cursor: "grabbing"
                                    },
                                    hovered || isContextMenuVisible ? styles.hover : null,
                                ]}
                            >
                                <DragProvider blockId={blockId}>
                                    <Octicons name="grabber" size={24} color="#ada9a3" />
                                </DragProvider>
                            </Pressable>
                        </View>

                        
                        {children(hovered)}
                    </View>

                    <Pressable
                        onPress={handleCloseContextMenu}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            display: isContextMenuVisible ? "flex" : "none",
                            flex: 1,
                            zIndex: 98,
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <ContextMenu ref={contextMenuRef}>
                            {contextMenuContent}
                        </ContextMenu>
                    </Pressable>
                </View>
            )
            : (
                <DragProvider blockId={blockId}>
                    {children(hovered)}
                </DragProvider>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    blockActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        position: "absolute",
        top: 4,
        left: -58,
        /* zIndex: 80, */
        /* padding: 8 */
    },
    button: {
        width: 24,
        height: 24,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    hover: {
        backgroundColor: "#37352f0f"
    },
    itemText: {
        fontSize: 14,
        color: "#2C2C2B",
        flexGrow: 1
    }
})