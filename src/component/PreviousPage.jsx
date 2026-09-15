import { createContext, useContext, useState } from 'react';

const PreviousPageContext = createContext();

export const PreviousPageProvider = ({ children }) => {
  const [visitedPages, setVisitedPages] = useState([]);

  const visitPage = (path, label) => {
    setVisitedPages((prev) => {
      const exists = prev.find((p) => p.path === path);
      if (exists) return prev;
      return [...prev, { path, label }];
    });
  };

  return (
    <PreviousPageContext.Provider value={{ visitedPages, visitPage }}>
      {children}
    </PreviousPageContext.Provider>
  );
};

export const useVisitedPages = () => useContext(PreviousPageContext);
