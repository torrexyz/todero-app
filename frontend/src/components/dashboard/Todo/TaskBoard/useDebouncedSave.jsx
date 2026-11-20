import { useRef, useEffect, useCallback } from "react";

//====================//

export function useDebouncedSave(saveCall, delay) {
  //..........//

  const timeoutRef = useRef(null);
  const pendingArgsRef = useRef(null);
  const saveCallRef = useRef(saveCall);

  //..........//

  useEffect(() => {
    saveCallRef.current = saveCall;
  });

  //..........//

  const cancel = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    pendingArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (!timeoutRef.current) return;

    const args = pendingArgsRef.current;
    cancel();
    saveCallRef.current(...args);
  }, [cancel]);

  const schedule = useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      pendingArgsRef.current = args;
      timeoutRef.current = setTimeout(flush, delay);
    },
    [delay, flush],
  );

  //..........//

  useEffect(() => flush, [flush]);

  //..........//

  return { schedule, flush, cancel };
}
