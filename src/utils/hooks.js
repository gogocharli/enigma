import {useState, useEffect, useRef} from 'react';

/**
 * Saves and retrieves data to and from sessionStorage
 * @param {string} key
 * @param {any} initalValue
 * @param {{serialize: (any) => string, deserialize: (string) => any}}
 * serializeOptions
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
 */
function useSessionStorage(
  key,
  initalValue = '',
  {serialize = JSON.stringify, deserialize = JSON.parse} = {},
) {
  const [state, setState] = useState(() => {
    const storedValue = window.sessionStorage.getItem(key);
    if (storedValue) {
      return deserialize(storedValue);
    }
    return typeof initalValue === 'function' ? initalValue() : initalValue;
  });

  const prevKeyRef = useRef(key);
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.sessionStorage.removeItem(prevKey);
      prevKeyRef.current = key;
    }

    window.sessionStorage.setItem(key, serialize(state));
    prevKeyRef.current = key;

    return () => {
      window.sessionStorage.clear();
    };
  }, [key, serialize, state]);

  return [state, setState];
}

export {useSessionStorage};
