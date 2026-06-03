import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { SmoothScroll } from '@/utils/Lenis';
import { Cursor } from '@/components/layout/Cursor';
import ViewportFrame from '@/components/layout/ViewportFrame';
import Loader from '@/components/layout/Loader';
import ProjectDetail from '@/components/sections/ProjectDetail';
import { Home } from '@/pages/Home';
import Archive from '@/pages/Archive';
import { useUIStore } from '@/store/useUIStore';

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
          <Route path="/archive" element={<Archive />} />
        </Routes>

        <ProjectDetail />
        
        <SpeedInsights />
      </SmoothScroll>
    </Router>
  );
}

export default App;
