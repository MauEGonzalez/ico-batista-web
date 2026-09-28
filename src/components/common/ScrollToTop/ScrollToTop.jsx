// /src/components/common/ScrollToTop/ScrollToTop.jsx
// Al cambiar de página, vuelve al inicio (React Router no lo hace solo).
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
