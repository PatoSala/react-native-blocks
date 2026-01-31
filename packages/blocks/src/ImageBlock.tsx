import { useState } from "react";
import { Image, View, StyleSheet, Dimensions, Text, Pressable, Platform, Button } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useBlocksContext, BlockProps, updateBlockData, DragProvider } from "@react-native-blocks/core";
import * as ImagePicker from 'expo-image-picker';
import FormSheetModal from "./components/Modal/FormSheetModal";

import { BlockLayout } from "./ui/components/layouts/BlockLayout";
import { ContextMenu } from "./ui/components/ContextMenu/ContextMenu";
import { TurnInto, DeleteBlock } from "./components/BlockActions";

/**
 * Image block specific properties:
 * source: string
 * 
 * Image block specific format:
 * block_width: number,
 * block_aspect_ratio: number
 */

export const ImageBlock = (props: BlockProps) => {
  const {
    blockId,
  } = props;
  const {
    blocks,
    blockTypes,
    updateBlock,
    removeBlock,
    /** Review selectedBlock */
    selectedBlockId,
    setSelectedBlockId
  } = useBlocksContext();

  const [source, setSource] = useState(blocks[blockId]?.properties.source || null);
  const [aspectRatio, setAspectRatio] = useState(blocks[blockId]?.format?.block_aspect_ratio || null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSource(result.assets[0].uri);
      setAspectRatio(result.assets[0].width / result.assets[0].height);

      const updatedBlock = updateBlockData(blocks[blockId], {
        properties: {
          source: result.assets[0].uri
        },
        format: {
          block_width: result.assets[0].width,
          block_aspect_ratio: result.assets[0].width / result.assets[0].height
        }
      });

      updateBlock(updatedBlock);
    }
  };

  const handleRemoveBlock = () => {
      setSelectedBlockId(null);
      setTimeout(() => {
          removeBlock(blockId);
      }, 100);
  };

  const backgroundColor = source === null ? "#7d7a751d" : "transparent";

  return (
    <BlockLayout
      blockId={blockId}
      style={{
        boxSizing: "border-box",
        marginVertical: 4,
        borderRadius: 8,
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
        <>
          <Pressable
            style={[styles.emptyImage, { backgroundColor: backgroundColor }]}
            onPress={pickImage}
          >
              {source === null
                ? (
                    <View style={styles.row}>
                        <Ionicons name="image-outline" size={24} color="#7d7a75" />
                        <Text style={styles.text}>Add an image</Text>
                    </View>
                )
                : (
                    <Image
                        style={[styles.image, { aspectRatio }]}
                        source={{ uri: source }}
                    />
                )
              }
            
          </Pressable>

          <FormSheetModal
            title="Actions"
            visible={selectedBlockId === blockId}
            onClose={() => setSelectedBlockId(null)}
          >
              <FormSheetModal.Section
                title="Image"
                options={[
                  {
                    title: "Remove",
                    style: { color: "red" },
                    onPress: handleRemoveBlock
                  }
                ]}
              />
          </FormSheetModal>
        </>
      )}
    </BlockLayout>
  )
}

const styles = StyleSheet.create({
  emptyImage: {
    boxSizing: "border-box",
    borderRadius: 8,
    marginHorizontal: 8
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12
  },
  text: {
    color: "#7d7a75",
    fontWeight: "400"
  },
  image: {
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  }
});