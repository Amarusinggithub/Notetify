import React, { createContext, PropsWithChildren, useContext, useState } from 'react';

type SearchContextType ={
  query: string;
  params: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setParams: React.Dispatch<React.SetStateAction<string>>;
}

type SearchProviderProps = PropsWithChildren;

const SearchContext = createContext<SearchContextType | undefined>(undefined);


const SearchProvider = ({ children }:SearchProviderProps) => {
  const [query, setQuery] = useState<string>('');
  const [params, setParams] = useState<string>('');

  return (

    /*<SearchContext.Provider
    value={{
        query,
        params,
        setParams,
        setQuery
    }}
    >
    {children}
    </SearchContext.Provider>*/
  );
};

function useSearchState(): SearchContextType {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider>');
  }
  return context;
}

export { SearchContext, SearchProvider };
export default useSearchState;




