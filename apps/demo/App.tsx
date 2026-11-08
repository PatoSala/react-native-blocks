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
          <TextInput placeholder="Type something" value={rootBlock.properties.title}/>
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
            contentContainerStyle={{
              backgroundColor: "green",
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
    backgroundColor: 'red',
  },
});
