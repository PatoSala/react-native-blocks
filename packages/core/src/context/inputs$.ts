import { observable } from "@legendapp/state";

export const inputs$ = observable({
  refs: {},
  register: (id: string, ref: any) => {
    if (!inputs$.refs[blockId].peek()) {
      inputs$.refs[blockId].set({
        [id]: ref
      });
    }
  },
  unregister: (id: string) => {
    inputs$.inputs[blockId].delete();
  },
  focus: (id: string) => {
    inputs$.refs[blockId][id].current?.focus();
  }
});