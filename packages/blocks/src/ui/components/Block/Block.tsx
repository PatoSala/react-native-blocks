import { useState, useRef } from "react";
import { View, StyleSheet, Platform, Pressable, Text } from "react-native";
import { Ionicons, Octicons } from '@expo/vector-icons';
import { DragProvider } from "@react-native-blocks/core";
import { ContextMenu } from "../ContextMenu/ContextMenu";

export function BlockLayout({ children, blockId, containerStyles, contextMenuContent }) {
    const contextMenuRef = useRef(null);
    const [hovered, setHovered] = useState(false);

    return (
        <>
            {Platform.OS == "web"
            ? (
                <View
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={[{
                        paddingHorizontal: "22%",
                        flexDirection: "row",
                        alignItems: "center",
                    }, containerStyles]}
                >
                    <View style={{
                        position: "relative",
                    }}>
                        <View style={[styles.blockActions, { display: hovered ? "flex" : "none" }]}>
                            <Pressable
                                style={({ hovered }) => [styles.button, hovered && styles.hover]}
                            >
                                <Ionicons name="add" size={24} color="#ada9a3" />
                            </Pressable>

                            <Pressable
                                onPress={(e) => contextMenuRef.current.show({ x: e.nativeEvent.pageX - 256 - 240 - 23, y: e.nativeEvent.pageY })}
                                style={({ hovered }) => [styles.button, { width: 20 }, hovered && styles.hover, { cursor: "grabbing" }]}
                            >
                                <DragProvider blockId={blockId}>
                                    <Octicons name="grabber" size={24} color="#ada9a3" />
                                </DragProvider>
                            </Pressable>
                        </View>

                        
                        {children(hovered)}
                    </View>

                    <ContextMenu ref={contextMenuRef}>
                        {contextMenuContent}
                    </ContextMenu>
                </View>
            )
            : (
                <DragProvider blockId={blockId}>
                    {children(hovered)}
                </DragProvider>
            )}
        </>
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