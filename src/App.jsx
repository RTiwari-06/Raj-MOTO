import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SmoothScroll } from '@/utils/Lenis';
import { Cursor } from '@/components/layout/Cursor';
import ViewportFrame from '@/components/layout/ViewportFrame';
import Loader from '@/components/layout/Loader';
import { Home } from '@/pages/Home';
import { useUIStore } from '@/store/useUIStore';

const Archive = lazy(() => import('@/pages/Archive'));

function App() {
  const isLoaded = useUIStore((state) => state.isLoaded);
  const setIsLoaded = useUIStore((state) => state.setIsLoaded);

  return (
    <Router>
      <SmoothScroll>
        {!isLoaded && <Loader onComplete={() => setIsLoaded(true)} />}
        
        <Cursor />
        <ViewportFrame />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/archive"
            element={
              <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <Archive />
              </Suspense>
            }
          />
        </Routes>

      </SmoothScroll>
    </Router>
  );
}

export default App;
