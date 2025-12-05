import { StatusBar } from 'expo-status-bar';
import { Editor, Block } from '@react-native-blocks/core';
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
          defaultBlockType={"text"}

          // Experimental
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

