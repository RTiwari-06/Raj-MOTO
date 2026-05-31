import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SmoothScroll } from '@/utils/Lenis';
import { Cursor } from '@/components/layout/Cursor';
import ViewportFrame from '@/components/layout/ViewportFrame';
import { Home } from '@/pages/Home';
import Archive from '@/pages/Archive';

function App() {
  return (
    <Router>
      <SmoothScroll>
        <Cursor />
        <ViewportFrame />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
        
      </SmoothScroll>
    </Router>
  );
}

export default App;
