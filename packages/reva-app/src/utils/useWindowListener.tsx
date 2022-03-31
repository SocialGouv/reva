// Forked from https://usehooks-ts.com/react-hook/use-event-listener
import { useEffect, useLayoutEffect, useRef } from "react";

function useWindowListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void
) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);

  useLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!(window && window.addEventListener)) {
      return;
    }

    // Create event listener that calls handler function stored in ref
    const eventListener: typeof handler = (event) =>
      savedHandler.current(event);

    window.addEventListener(eventName, eventListener);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener(eventName, eventListener);
    };
  }, [eventName]);
}

export default useWindowListener;
