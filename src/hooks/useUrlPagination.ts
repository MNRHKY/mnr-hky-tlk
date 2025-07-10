import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export const useUrlPagination = (defaultPage: number = 1) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentPage = parseInt(searchParams.get('page') || defaultPage.toString(), 10);
  
  const setPage = useCallback((page: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (page === defaultPage) {
      newParams.delete('page');
    } else {
      newParams.set('page', page.toString());
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams, defaultPage]);
  
  return { currentPage, setPage };
};