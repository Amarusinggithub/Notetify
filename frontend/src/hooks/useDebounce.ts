import { useEffect, useState } from 'react';

function useDebounce<T>(value: T, delay: number) {
  const [debounceValue, setDebounceValue] = useState<T>();

  useEffect(() => {
    let timeOut = setTimeout(() => {
      setDebounceValue(value);
    }, delay);
    return () => {
      clearInterval(timeOut);
    };
  }, [value, delay]);

  return debounceValue;
}

export default useDebounce;
