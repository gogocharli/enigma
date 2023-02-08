import {useState, useEffect, useRef} from 'react';

interface SerializeOptions<T> {
  serialize?: (data: T) => string;
  deserialize?: (key: string) => T;
}

/**
 * Saves and retrieves data to and from sessionStorage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
 */
function useSessionStorage<T>(
  key: string,
  initalValue: T | (() => T),
  {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  }: SerializeOptions<T> = {},
) {
  const [data, setStoredData] = useState(() => {
    const storedValue = window.sessionStorage.getItem(key);
    if (storedValue) {
      return deserialize(storedValue);
    }
    return initalValue instanceof Function ? initalValue() : initalValue;
  });

  const prevKeyRef = useRef(key);
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.sessionStorage.removeItem(prevKey);
      prevKeyRef.current = key;
    }

    window.sessionStorage.setItem(key, serialize(data));
    prevKeyRef.current = key;

    return () => {
      window.sessionStorage.clear();
    };
  }, [key, serialize, data]);

  return [data, setStoredData];
}

export {useSessionStorage};
