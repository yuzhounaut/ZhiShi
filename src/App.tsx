import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import ImageQuiz from './pages/ImageQuiz';
import PlantIdentifier from './pages/PlantIdentifier';
import Encyclopedia from './pages/Encyclopedia';
import Atlas from './pages/Atlas';
import NotFound from './pages/NotFound';
import QuizSelectionPage from './pages/QuizSelectionPage'; // Import the new page

import { useEffect } from 'react';
import { preloadAIData } from '@/lib/ai';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Silently preload retrieval library (traits and embeddings) in the background
    preloadAIData();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<QuizSelectionPage />} /> {/* Changed to QuizSelectionPage */}
          <Route path="/quiz/:familyId" element={<Quiz />} />
          <Route path="/identifier" element={<PlantIdentifier />} />
          <Route path="/image-quiz" element={<ImageQuiz />} />
          <Route path="/encyclopedia" element={<Navigate to="/encyclopedia/families" replace />} />
          <Route path="/encyclopedia/families" element={<Encyclopedia />} />
          <Route path="/encyclopedia/families/:familyId" element={<Encyclopedia />} />
          <Route path="/encyclopedia/atlas" element={<Atlas />} />
          <Route path="/encyclopedia/atlas/item/:itemId" element={<Atlas />} />
          <Route path="/encyclopedia/atlas/*" element={<Atlas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
