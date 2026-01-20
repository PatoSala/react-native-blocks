import React from "react";

export function useForceUpdate() {
  const [, setTick] = React.useState(0);
  return React.useCallback(() => {
    setTick(t => t + 1);
  }, []);
}