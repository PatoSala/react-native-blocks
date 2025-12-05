![Frame 14.png](assets/cover.png?raw=true)

# React Native Blocks

[Inspired by the data model behind Notion's flexibility](https://www.notion.com/blog/data-model-behind-notion), React Native Blocks let's you create modular block-based text editors like Notion.

<img src="assets/screenshot.png" alt="drawing" width="50%"/>

## Quick start

### 1. Install in your React Native Project.

```
npm install @react-native-blocks/core
```

### 2. Install a block-component library

`@react-nativee-blocks/core` by it's own only provides the necessary tools to create a block based interface but does not provide the block components to be rendered. It´s up to you if you want to use an already existing set of blocks, create your own or even use both at the same time. In this example we'll be using [@react-native-blocks/blocks](https://www.npmjs.com/package/@react-native-blocks/blocks) which provides a set of blocks similar to the ones present in Notion (Pages, Headings, Checkboxes, etc).

```
npm install @react-native-blocks/blocks
```

## Usage

With both libraries installed we'll use from @react-native-blocks/core the `<Editor/>` component to create a new editor and the `<Block/>` component to register the building blocks that `<Editor/>` will use. And from @react-native-blocks/blocks we'll import the blocks we want to register.

```js
import { StatusBar } from 'expo-status-bar';
import { Editor, Block } from '@react-native-blocks/core';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import {
  HeaderBlock,
  PageBlock,
  SubHeaderBlock,
  SubSubHeaderBlock,
  TextBlock,
  ImageBlock
} from '@react-native-blocks/blocks';

const blankNote = {
    "1": {
        id: "1",
        type: "page",
        properties: {
            title: ""
        },
        content: [],
        parent: ""
    }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Editor
        defaultBlocks={blankNote}
        defaultBlockType={"text"}
        contentContainerStyle={{
          paddingTop: 70
        }}
      >
        <Block
          type="page"
          component={PageBlock}
          options={{
            isTextBased: true,
            name: "Page"
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
          type="text"
          component={TextBlock}
          options={{
            isTextBased: true,
            name: "Text"
          }}
        />

        <Block
          type="image"
          component={ImageBlock}
          options={{
            name: "Image"
          }}
        />
      </Editor>

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
```

## Future Plans
- Adding support for nested blocks.
- Rich text support.
- Dynamic toolbar actions based on focused block.
- Improve the block extraction system.

## Creating your own blocks.
Guide in progress. 

## Warning
This library is still a work in progress so expect breaking changes on future releases.

## Contributing

Feel free to contribute! Fork this repo and create a pull request.

## Discord

Join me on Discord [https://discord.gg/utxtAafD8n](https://discord.gg/utxtAafD8n).

## Disclaimer

This project is an independent open-source initiative and is **not affiliated with, endorsed by, or connected to Notion Labs, Inc.** in any way.

All trademarks, logos, and brand names used in this project are the property of their respective owners. Any references to “Notion” are for **descriptive or comparative purposes only** and do not imply any association or partnership.

