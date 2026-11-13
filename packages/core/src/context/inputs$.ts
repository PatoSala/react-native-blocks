import { observable } from "@legendapp/state";

interface Input {
  selection: {
    start: number,
    end: number
  },
  focused: boolean
}

interface Store {
  inputs: Record<string, Input> | {},
  registerInput: (blockId: string, input: Input) => void,
  unregisterInput: (blockId: string) => void
}

export const inputs$ = observable<Store>({
  inputs: {},
  registerInput: (blockId: string, input: Input) => {
    inputs$.inputs.assign({
      [blockId]: input
    });
  },
  unregisterInput: (blockId: string) => {
    inputs$.inputs[blockId].delete();
  }
});