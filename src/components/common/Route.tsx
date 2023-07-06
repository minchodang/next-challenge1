import React, { ReactNode, useContext } from 'react';
import { RouterContext } from './Router';

interface RouteProps {
  path: string;
  component: ReactNode;
}

const Route: React.FC<RouteProps> = ({ path, component: Component }) => {
  const { currentPath } = useContext(RouterContext);
  const pathMatch = new RegExp(`^${path}$`).test(currentPath);

  return pathMatch ? Component : null;
};

export default Route;
