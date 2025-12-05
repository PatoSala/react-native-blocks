import { Pressable, Text, View, StyleSheet, Dimensions, FlatList, Keyboard } from "react-native";
import {
    Block, 
    useBlocksContext, 
    useTextBlocksContext, 
    createBlock
} from "@react-native-blocks/core";

const { width } = Dimensions.get("window");

export default function InsertBlockSection({ setActiveTab, setHidden } : any) {
    const { inputRefs, setShowSoftInputOnFocus, textBasedBlocks } = useTextBlocksContext();
    const { blocks, focusedBlockId, insertBlock, removeBlock, blockTypes } = useBlocksContext();


    const handleInsertBlock = (blockType: string) => {
        const parentBlockId = blocks[focusedBlockId].parent === "root" ? focusedBlockId : blocks[focusedBlockId].parent;
       
        setShowSoftInputOnFocus(true);
        const newBlock = createBlock({
            type: blockType,
            properties: {
                title: ""
            },
            content: [],
            parent: parentBlockId
        });

        if (blocks[focusedBlockId].parent === "root") {
            insertBlock(newBlock, {
                nextBlockId: blocks[focusedBlockId].content[0]
            });
        } else {
            insertBlock(newBlock, {
                prevBlockId: focusedBlockId
            });
        }

        if (blocks[focusedBlockId].properties.title.length === 0 && blocks[focusedBlockId].parent !== "root") {
            removeBlock(focusedBlockId);
        }

        // Focus new block
        if (textBasedBlocks.includes(blockType)) {
            requestAnimationFrame(() => {
                inputRefs.current[newBlock.id]?.current.focus();
            });
            return;
        }
        Keyboard.dismiss();
        setActiveTab("none");
        setHidden(true);
    }

    return (
        <>
            <FlatList
                data={Object.keys(blockTypes)}
                numColumns={2}
                ListHeaderComponent={(
                    <View style={styles.blockOptionsRow}>
                        <Text style={styles.sectionHeader}>Blocks</Text>
                    </View>
                )}
                columnWrapperStyle={{
                    justifyContent: "space-between"
                }}
                contentContainerStyle={{
                    gap: 10,
                    padding: 16
                }}
                renderItem={({ item }) => {
                    return (
                        <Pressable style={({ pressed}) => ([{
                            opacity: pressed ? 0.5 : 1
                        }, styles.blockOptions])} onPress={() => handleInsertBlock(item)}>
                            <Text style={styles.blockOptionsText}>{blockTypes[item].options.name}</Text>
                        </Pressable>
                    )
                }}
            />
        </>
    )
}

const styles = StyleSheet.create({
    blockOptionsRow: {
        flexDirection: "row",
        marginBottom: 8,
        gap: 4
    },
    blockOptions: {
        backgroundColor: "white",
        height: 50,
        width: width / 2 - 20,
        borderRadius: 4,
        justifyContent: "center",
        paddingHorizontal: 16,
        boxSizing: "border-box",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.1)",
    },
    blockOptionsText: {
        fontSize: 16,
        fontWeight: "500",
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: "500",
        color: "#b3b3b3"
    }
});