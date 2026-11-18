import { useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Editor, Block, blocks$, createBlock, TextInput } from '@react-native-blocks/core';
import { TextBlockV2, CalloutBlockV2 } from '@react-native-blocks/blocks';

export default function App() {
  const inputRef = useRef<TextInput>(null);

  const rootBlock = {
    id: "1",
    type: "text",
    properties: {
      title: "Nueva Pagina"
    },
    content: ["2", "3"],
    parent: null
  };

  const handleBlankSpacePress = () => {
    console.log("Blank space pressed");
    const newBlock = createBlock({
      type: "callout",
      properties: {
        title: ""
      },
      content: [],
      parent: rootBlock.id
    });

    blocks$.insertBlock(newBlock, rootBlock.content.length);
  }

  const splitBlock = () => {}

  const handleSubmitEditing = () => {
    // Check selection start and end. If 
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* 
            To do: find a way to be able to update blocks inside the Editor from outside it.
            This is needed for:
            - Insert a new block at the end when pressing on blank space.
            - Be able to merge and split the Heading of the page with the first block in the Editor.
           */}
          <TextInput
            blockId={rootBlock.id}
            ref={inputRef}
            placeholder="Type something"
            style={{
              fontSize: 32,
              fontWeight: "bold",
              paddingHorizontal: 16,
              paddingVertical: 8
            }}
          />
          <Editor
            rootBlock={rootBlock}
            extractBlocks={(blocks) => console.log("Extracted blocks:", blocks)}
            defaultBlocks={{
              "2": {
                id: "2",
                type: "text",
                properties: {
                  title: "@react-native-blocks/core"
                },
                content: [],
                parent: "1"
              },
              "3": {
                id: "3",
                type: "callout",
                properties: {
                  title: ""
                },
                content: ["4"],
                parent: "1"
              },
              "4": {
                id: "4",
                type: "text",
                properties: {
                  title: "Hello world"
                },
                content: [],
                parent: "3"
              }
            }}
          >
            <Block
              type="text"
              component={TextBlockV2}
              options={{
                isTextBased: true,

                // A human readable name for the block.
                name: "Text"
              }}
            />

            <Block
              type="callout"
              component={CalloutBlockV2}
              options={{
                isTextBased: true,
                name: "Callout"
              }}
            />
          </Editor>
          {/* 
            Deprecated onBlankSpacePress.
            Now blank space shoulldd be handled outside of the editor with a Pressable component.
          */}
          <Pressable
            onPress={handleBlankSpacePress}
            style={{
              flex: 1
            }}
          />
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
