import { createContext, useContext } from 'react';

const context = createContext('/');

export const { Provider } = context;

export const useBaseUrl = baseUrlProp => {
  const target = useContext(context);
  return baseUrlProp || target?.baseUrl;
};

export const useProps = () => {
  return useContext(context);
};

export default context;
