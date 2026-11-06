# `@react-native-blocks/core`

## What is its purpose?

`@react-native-blocks/core` is the editor engine for block-based React Native interfaces. It does not provide a visual language for blocks; instead, it lets an application register block components and manages the document data, ordering, focus, text-input coordination, scrolling, and drag-and-drop behavior around them.

Use it when you want to build an editor with your own block types, or use it as the engine beneath `@react-native-blocks/blocks`.

## How does it work?

### Document model

The document is a record keyed by block ID. A block has an `id`, `type`, `properties`, `parent`, and an optional ordered `content` array of child IDs. `createBlock` creates a block and assigns it a UUID.

The editor injects an internal `root` block. In the current implementation, rendering is flat: it renders the first top-level block (`root.content[0]`) followed by that block's direct `content` items. Although blocks have parent/child fields, arbitrary nested trees are not yet rendered.

```ts
const initialBlocks = {
  page: {
    id: 'page',
    type: 'page',
    properties: { title: 'My note' },
    parent: 'root',
    content: ['intro'],
  },
  intro: {
    id: 'intro',
    type: 'text',
    properties: { title: 'Hello world' },
    parent: 'page',
    content: [],
  },
};
```

### Registration and rendering

`<Block>` is a declaration component: it renders nothing itself. `Editor` reads its child declarations, registers each `type` with its React component, and renders the component matching every block's `type`. Registered blocks receive a `blockId` prop.

Mark text-editable types with `options.isTextBased: true`. Core uses that list for text-block navigation and for features such as changing a block's type.

### State and editor services

`Editor` composes providers for block state, text-input refs, scrolling, layout measurement, and gestures. `useBlocksContext()` gives block components operations such as:

- `insertBlock`, `removeBlock`, `updateBlock`, and `updateBlockV2`
- `turnBlockInto`, `moveBlock`, `splitBlock`, and `mergeBlock`
- current `blocks`, `blocksOrder`, `focusedBlockId`, and selection/movement state

`useTextInput(blockId)` supplies controlled interaction behavior for a React Native `TextInput`: it preserves the current value and selection, records focus, saves the title on blur, and exposes imperative input refs through `useTextBlocksContext()`. A text block can override the supplied `onSubmitEditing` and `onKeyPress` to define its own Enter and Backspace semantics.

`DragProvider` is available for block components that should support long-press selection and drag reordering. It uses measured block layouts, a move indicator, a ghost block, and edge auto-scrolling.

Whenever `blocksOrder` changes, `extractBlocks(blocks)` receives the current block record. Use it to synchronize editor changes to application state or storage. Supply this callback even when it is a no-op.

## How do you implement it?

### 1. Install dependencies

```sh
npm install @react-native-blocks/core
```

The package expects React Native plus its declared peer/dependent packages, including `react-native-gesture-handler`, `react-native-reanimated`, and Expo Crypto. Follow those libraries' installation and Babel setup instructions in the host app.

### 2. Build a block component

This minimal text block uses the core input behavior and wraps its UI in `DragProvider`.

```tsx
import { TextInput } from 'react-native';
import { DragProvider, useTextInput } from '@react-native-blocks/core';

export function ParagraphBlock({ blockId }: { blockId: string }) {
  const { getTextInputProps } = useTextInput(blockId);

  return (
    <DragProvider blockId={blockId}>
      <TextInput
        {...getTextInputProps()}
        style={{ fontSize: 16, lineHeight: 24, paddingVertical: 6 }}
      />
    </DragProvider>
  );
}
```

For richer behavior, use `getValue()` and `getSelection()` from `useTextInput`, then call `createBlock`, `insertBlock`, `updateBlockV2`, and `removeBlock` from `useBlocksContext()` in custom Enter/Backspace handlers.

### 3. Mount the editor and register blocks

`defaultBlockType` is required by the current API and should be a registered text block type. The first block must be the page/root-level block described in the document model above.

```tsx
import { SafeAreaView } from 'react-native';
import { Block, Editor } from '@react-native-blocks/core';
import { ParagraphBlock } from './ParagraphBlock';
import { PageBlock } from './PageBlock';

export function NoteEditor() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Editor
        defaultBlockType="text"
        defaultBlocks={initialBlocks}
        extractBlocks={(blocks) => {
          // Persist or lift editor data here.
        }}
        onBlankSpacePress={({ blocks, insertBlock, inputRefs }) => {
          // Optional: create/focus a final text block.
        }}
      >
        <Block
          type="page"
          component={PageBlock}
          options={{ isTextBased: true, name: 'Page' }}
        />
        <Block
          type="text"
          component={ParagraphBlock}
          options={{ isTextBased: true, name: 'Text' }}
        />
      </Editor>
    </SafeAreaView>
  );
}
```

`contentContainerStyle` customizes the editor scroll container. `ToolbarComponent` renders below the provider tree and can use core hooks; it is where `@react-native-blocks/blocks` mounts its optional `Footer`.

### 4. Keep the block contract consistent

Text-based blocks should store their editable string in `properties.title`, because core's text helpers read and write that field. Non-text blocks may store other fields in `properties` and `format`; for example, the bundled image block uses `properties.source`, `format.block_width`, and `format.block_aspect_ratio`.

When a custom block is inserted, set its `parent` to the container/page block and update that parent's `content` via `insertBlock`. Do not mutate the `blocks` record directly; use the context methods so the editor re-renders and exports the updated document.
