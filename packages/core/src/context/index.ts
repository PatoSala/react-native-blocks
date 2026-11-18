// export all contexts as a single 'store' object.

/**
 * Then users could just do:
 * import { store } from "@react-native-blocks/core";
 * 
 * store.blocks -> blocks observable
 * store.inputs -> inputs observable
 * store.measures -> measures observable
 * 
 * store.insertBlock
 * store.updateBlock
 * store.removeBlock
 * 
 * store.registerInput
 * store.unregisterInput
 * 
 * store.focusBlock
 */