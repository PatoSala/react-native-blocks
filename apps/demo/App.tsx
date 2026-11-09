import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import { Editor, Block } from '@react-native-blocks/core';
import { TextBlock } from '@react-native-blocks/blocks';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {

  const handleBlankSpacePress = () => {
    console.log("Blank space pressed");
  }

  const rootBlock = {
    id: "1",
    type: "text",
    properties: {
      title: "Nueva Pagina"
    },
    content: ["2"],
    parent: null
  };

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
            placeholder="Type something"
            value={rootBlock.properties.title}
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
              }
            }}
          >
            <Block
              type="text"
              component={TextBlock}
              options={{
                isTextBased: true,
                name: "Text"
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
