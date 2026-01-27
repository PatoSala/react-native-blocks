import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import {
  Editor,
  Block,
  createBlock
} from '@react-native-blocks/core';
import {
  HeaderBlock,
  PageBlock,
  SubHeaderBlock,
  SubSubHeaderBlock,
  TextBlock,
  ImageBlock,
  CalloutBlock,
  QuoteBlock,
  CheckboxBlock,
  BulletBlock,
  Footer
} from '@react-native-blocks/blocks';

const blankNote = {
    "1": {
      id: "1",
      type: "page",
      properties: {
          title: ""
      },
      content: [],
      parent: "root"
    }
}

const initialBlocks = {
    "1": {
      id: "1",
      type: "page",
      properties: {
          title: "@react-native-blocks/core"
      },
      format: {
        page_icon: "👋"
      },
      content: ["2", "3"],
      parent: "root"
    },
    "2": {
      id: "2",
      type: "text",
      properties: {
          title: "The core library of react-native-blocks. Provides all the necessary tools to build block-based text editors like Notion."
      },
      content: [],
      parent: "1"
    },
    "3": {
      id: "3",
      type: "image",
      properties: {
          source: "https://raw.githubusercontent.com/PatoSala/react-native-blocks/8862145f6a3fb6ecc055445da92f265d02069283/assets/logo-small-white.png"
      },
      format: {
        block_aspect_ratio: 1,
        block_width: 1024
      },
      content: [],
      parent: "1"
    }
}

export default function App() {
  const extractBlocks = (blocks) => {
    console.log("blocks", blocks);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, flexDirection: "row" }} edges={["top"]}>
        {Platform.OS === "web" && <View style={styles.nav}/>}
          <Editor        
            contentContainerStyle={styles.content}
            defaultBlocks={blankNote}
            extractBlocks={extractBlocks}
            ToolbarComponent={() => {
              return (
                <Footer.ContextProvider>
                    <Footer>
                        <Footer.AddBlock />
                        <Footer.TurnBlockInto />
                        <Footer.RemoveBlock />
                    </Footer>
                </Footer.ContextProvider>
              )
            }}
            // Deprecate
            defaultBlockType={"text"}

            /** @experimental */
            onBlankSpacePress={({ blocks, blocksOrder, inputRefs, insertBlock }) => {
              const rootBlockId = blocks["root"].content[0];
              const rootBlock = blocks[rootBlockId];

              if (
                blocks[blocksOrder[blocksOrder.length - 1]].type === "text"
                && blocks[blocksOrder[blocksOrder.length - 1]].properties?.title.length === 0
            ) {
                inputRefs.current[rootBlock.content[rootBlock.content.length - 1]]?.current.focus();
            } else {
                const newBlock = createBlock({
                    type: "text",
                    properties: {
                        title: ""
                    },
                    format: {},
                    content: [],
                    parent: rootBlock.id
                });

                insertBlock(newBlock);
                // Focus new block
                requestAnimationFrame(() => {
                    inputRefs.current[newBlock.id]?.current.focus();
                });
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

            <Block
              type="header"
              component={HeaderBlock}
              options={{
                isTextBased: true,
                name: "Header 1"
              }}
            />

            <Block
              type="sub_header"
              component={SubHeaderBlock}
              options={{
                isTextBased: true,
                name: "Header 2"
              }}
            />

            <Block
              type="sub_sub_header"
              component={SubSubHeaderBlock}
              options={{
                isTextBased: true,
                name: "Header 3"
              }}
            />

            <Block
              type="page"
              component={PageBlock}
              options={{
                isTextBased: true,
                name: "Page"
              }}
            />

            <Block
              type="image"
              component={ImageBlock}
              options={{
                name: "Image"
              }}
            />

            <Block
              type="bullet"
              component={BulletBlock}
              options={{
                isTextBased: true,
                name: "Bulleted list"
              }}
            />

            <Block
              type="checkbox"
              component={CheckboxBlock}
              options={{
                isTextBased: true,
                name: "To-do list"
              }}
            />

            <Block
              type="callout"
              component={CalloutBlock}
              options={{
                isTextBased: true,
                name: "Callout"
              }}
            />

            <Block
              type="quote"
              component={QuoteBlock}
              options={{
                isTextBased: true,
                name: "Quote"
              }}
            />
          </Editor>
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: "center",
  },
  content: {
    /* maxWidth: 708, */
    width: "100%",
    display: "flex",
    flex: 1,
    ...Platform.OS === "web" ? {
      paddingLeft: "22%",
      paddingRight: "22%"
    } : {}
  },
  nav: {
    width: 240,
    height: "100%",
    backgroundColor: "#f9f8f7"
  }
});