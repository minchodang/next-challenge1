import { useCallback } from 'react';

const useRouter = () => {
  const push = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  return {
    push,
  };
};

export default useRouter;
