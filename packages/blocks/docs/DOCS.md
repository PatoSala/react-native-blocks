# `@react-native-blocks/blocks`

## What is its purpose?

`@react-native-blocks/blocks` is the ready-made block library for `@react-native-blocks/core`. It provides Notion-inspired React Native components so an app can assemble an editor without creating every block UI and editing interaction from scratch.

The package exports these block components:

- `PageBlock`
- `TextBlock`
- `HeaderBlock`, `SubHeaderBlock`, and `SubSubHeaderBlock`
- `CheckboxBlock` and `BulletBlock`
- `CalloutBlock` and `QuoteBlock`
- `ImageBlock`
- `CodeBlock`

It also exports `Footer`, an optional keyboard toolbar for inserting, changing, and removing registered blocks.

## How does it work?

Every component receives the `blockId` supplied by core's renderer and reads or changes that block through core hooks. Most text blocks use `useTextInput(blockId)` for their `TextInput`, `useBlocksContext()` to update the document, and `useTextBlocksContext()` to focus another input after an edit.

The bundled text blocks implement editor rules on top of core:

- Enter inserts a text block before or after the cursor, or splits text at a middle selection.
- Backspace at the start merges into the previous compatible text block.
- Empty headings, bullets, checkboxes, callouts, and quotes can turn back into a plain `text` block.
- Blocks are wrapped in `DragProvider`, enabling long-press selection and drag reordering.

`ImageBlock` opens the device image library using `expo-image-picker`; it saves the selected URI in `properties.source` and size data in `format`. `PageBlock` additionally exposes page-title, icon, and cover interactions. `Footer` lists the types registered with core, so its insertion menu includes exactly the block types you register; its “Turn into” menu is limited to types marked `isTextBased`.

## How do you implement it?

### 1. Install it with core

```sh
npm install @react-native-blocks/core @react-native-blocks/blocks
```

`@react-native-blocks/blocks` depends on the core editor and uses `expo-image-picker` and `react-native-emoji-selector`. Configure the underlying React Native/Expo dependencies in the host application, including the platform permissions required for image selection.

### 2. Provide data and register the block types you use

The type string in every document block must exactly match a registered `<Block type="...">`. The first block is a `page` parented by `root`; its `content` specifies the displayed child-block order.

```tsx
import { SafeAreaView } from 'react-native';
import { Block, Editor } from '@react-native-blocks/core';
import {
  BulletBlock,
  CheckboxBlock,
  HeaderBlock,
  ImageBlock,
  PageBlock,
  TextBlock,
} from '@react-native-blocks/blocks';

const initialBlocks = {
  page: {
    id: 'page',
    type: 'page',
    properties: { title: 'Project notes' },
    parent: 'root',
    content: ['heading', 'task', 'image'],
  },
  heading: {
    id: 'heading',
    type: 'header',
    properties: { title: 'Today' },
    parent: 'page',
    content: [],
  },
  task: {
    id: 'task',
    type: 'checkbox',
    properties: { title: 'Ship the first draft' },
    parent: 'page',
    content: [],
  },
  image: {
    id: 'image',
    type: 'image',
    properties: { source: '' },
    parent: 'page',
    content: [],
  },
};

export function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
        defaultBlockType="text"
        defaultBlocks={initialBlocks}
        extractBlocks={(blocks) => {
          // Save the latest block record.
        }}
      >
        <Block type="page" component={PageBlock} options={{ isTextBased: true, name: 'Page' }} />
        <Block type="text" component={TextBlock} options={{ isTextBased: true, name: 'Text' }} />
        <Block type="header" component={HeaderBlock} options={{ isTextBased: true, name: 'Header 1' }} />
        <Block type="checkbox" component={CheckboxBlock} options={{ isTextBased: true, name: 'To-do list' }} />
        <Block type="bullet" component={BulletBlock} options={{ isTextBased: true, name: 'Bulleted list' }} />
        <Block type="image" component={ImageBlock} options={{ name: 'Image' }} />
      </Editor>
    </SafeAreaView>
  );
}
```

Register the other exports with these type names when needed:

| Component | Type |
| --- | --- |
| `SubHeaderBlock` | `sub_header` |
| `SubSubHeaderBlock` | `sub_sub_header` |
| `CalloutBlock` | `callout` |
| `QuoteBlock` | `quote` |
| `CodeBlock` | `code` |

Register `CodeBlock` as text-based if you want it included in text navigation and the footer's conversion menu. The current `CodeBlock` is a basic input; unlike the other bundled blocks, it does not wrap itself with `DragProvider` or implement custom Enter/Backspace behavior.

### 3. Add the optional footer

Pass `Footer` through `Editor`'s `ToolbarComponent` to add controls below the editor. `Footer.ContextProvider` is required.

```tsx
import { Footer } from '@react-native-blocks/blocks';

<Editor
  defaultBlockType="text"
  defaultBlocks={initialBlocks}
  extractBlocks={(blocks) => saveBlocks(blocks)}
  ToolbarComponent={() => (
    <Footer.ContextProvider>
      <Footer>
        <Footer.AddBlock />
        <Footer.TurnBlockInto />
        <Footer.RemoveBlock />
      </Footer>
    </Footer.ContextProvider>
  )}
>
  {/* Registered <Block> declarations */}
</Editor>
```

The footer works from the currently focused block. It presents registered types by their `options.name`, so include a human-readable `name` for every type you expect users to insert or convert to.

### 4. Customize safely

You can mix these bundled components with your own core block components. Keep text blocks compatible with the shared convention—editable text in `properties.title` and `isTextBased: true`—so they work with the standard focus, merge, and footer behaviors. For block-specific data, use additional `properties` or `format` fields and update the block through `useBlocksContext()`.
