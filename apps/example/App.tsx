import { StatusBar } from 'expo-status-bar';
import { Editor, Block, createBlock } from '@react-native-blocks/core';
import { useSafeAreaInsets, SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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

export default function App() {

  const extractBlocks = (blocksStore) => {
    /* console.log("ROOT CONTENT", blocksStore["root"].content);
    console.log("ONLY ROOT CHILD CONTENT", blocksStore[blocksStore["root"].content[0]].content); */
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1}} edges={["top"]}>
        <Editor          
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

          // Experimental
          onBlankSpacePress={({ blocks, blocksOrder, inputRefs, insertBlock }) => {
            console.log("Blocks", blocks ? true : false);
            console.log("Blocks Order", blocksOrder ? true : false);
            console.log("Input Refs", inputRefs ? true : false);
            console.log("Insert Block", insertBlock ? true : false);
            
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

