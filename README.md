![Frame 14.png](assets/cover.png?raw=true)

# React Native Blocks

[Inspired by the data model behind Notion's flexibility](https://www.notion.com/blog/data-model-behind-notion), React Native Blocks let's you create modular block-based text editors like Notion.

<div style="width: 100%; display: flex; justify-content: center; align-items: center;">
  <img src="assets/screenshot.png" alt="drawing" width="400px"/>
</div>

## Quick start

### 1. Install in your React Native Project.

```
npm install @react-native-blocks/core
```

### 2. Install a block-component library

`@react-native-blocks/core` by its own only provides the necessary tools to create a block-based text editors but does not provide the block components to render. Its up to you if you want to use an already existing set of blocks, create your own or even use both at the same time. Each block is a self-contained unit: it manages its own state and defines how it interacts with other blocks as long as they allow it. In this example we'll be using [@react-native-blocks/blocks](https://www.npmjs.com/package/@react-native-blocks/blocks) which provides a set of blocks similar to the ones present in Notion (Pages, Headings, Checkboxes, etc).

```
npm install @react-native-blocks/blocks
```

## Usage
To see an example usage go to [https://www.npmjs.com/package/@react-native-blocks/core](https://www.npmjs.com/package/@react-native-blocks/core) or join me on [Discord](https://discord.gg/utxtAafD8n) to get help.

## Future Plans
- Adding support for nested blocks.
- Rich text support (working on it on [react-native-rich-text](https://github.com/PatoSala/react-native-rich-text)).
- Improve block extraction strategie.

## Creating your own blocks.
Guide in progress. 

## Warning
This library is still a work in progress so expect breaking changes on future releases.

## Contributing

See the [contributing guide](https://github.com/PatoSala/react-native-blocks/blob/main/CONTRIBUTING.md)

## Discord

Join me on Discord [https://discord.gg/utxtAafD8n](https://discord.gg/utxtAafD8n).

## Disclaimer

This project is an independent open-source initiative and is **not affiliated with, endorsed by, or connected to Notion Labs, Inc.** in any way.

All trademarks, logos, and brand names used in this project are the property of their respective owners. Any references to “Notion” are for **descriptive or comparative purposes only** and do not imply any association or partnership.

