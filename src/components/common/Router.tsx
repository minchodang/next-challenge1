import React, { useEffect, useState, ReactNode } from 'react';

interface RouterProps {
  children: ReactNode;
}

interface RouterContextData {
  currentPath: string;
}

export const RouterContext = React.createContext<RouterContextData>({
  currentPath: '',
});

const Router: React.FC<RouterProps> = ({ children }) => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath: path }}>
      {children}
    </RouterContext.Provider>
  );
};

export default Router;
