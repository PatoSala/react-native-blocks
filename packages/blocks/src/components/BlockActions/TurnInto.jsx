import { useEffect, useRef } from "react";
import { useBlocksContext } from "@react-native-blocks/core";
import { Text, StyleSheet, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { ContextMenu } from "../../ui/components/ContextMenu/ContextMenu";

/** web */
export function TurnInto({ blockId }) {
    const contextMenuRef = useRef(null);
    const viewRef = useRef(null);
    const { turnBlockInto, blockTypes } = useBlocksContext();

    const handleOpenContextMenu = (e) => {
        viewRef?.current?.measure((x, y, width, height, pageX, pageY) => {
            contextMenuRef?.current?.show({
                x: pageX + width,
                y: pageY
            });
        });
    }

    const handleCloseContextMenu = () => {
        contextMenuRef?.current?.hide();
    }

    return (
        <View onMouseLeave={handleCloseContextMenu}>
            <View
                onMouseEnter={handleOpenContextMenu}
                ref={viewRef}
            >
                <ContextMenu.Item>
                    <Text style={styles.text}>Turn into</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ada9a3" />
                </ContextMenu.Item>
            </View>

            <View>
                <ContextMenu ref={contextMenuRef}>
                    {Object.keys(blockTypes).map(blockType => (
                        <ContextMenu.Item key={blockType} onPress={() => turnBlockInto(blockId, blockType)}>
                            <Text style={styles.itemText}>{blockTypes[blockType].options.name}</Text>
                        </ContextMenu.Item>
                    ))}
                </ContextMenu>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 8,
    },
    text: {
        color: "#000",
        fontSize: 14,
        flexGrow: 1
    }
});