import { createContext, useContext, useState } from "react";

export const SearchContext = createContext({
  searchTerm: "",
  setSearchTerm: () => {},
});

const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context)
    throw new Error("useSearch must be used within a SearchProvider");
  return context;
};

export default SearchProvider;
