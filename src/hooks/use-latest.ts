import { useRef } from "react";

/**
 * Returns a ref that always holds the most recent value passed in.
 * Use it to call the latest version of a function from an effect without
 * adding that function to the effect's dependency array.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
