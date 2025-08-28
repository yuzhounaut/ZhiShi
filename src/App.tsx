import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import ImageQuiz from './pages/ImageQuiz';
import PlantIdentifier from './pages/PlantIdentifier';
import Encyclopedia from './pages/Encyclopedia';
import NotFound from './pages/NotFound';
import QuizSelectionPage from './pages/QuizSelectionPage'; // Import the new page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<QuizSelectionPage />} /> {/* Changed to QuizSelectionPage */}
          <Route path="/quiz/:familyId" element={<Quiz />} />
          <Route path="/identify" element={<PlantIdentifier />} />
          <Route path="/image-quiz" element={<ImageQuiz />} />
          <Route path="/encyclopedia" element={<Encyclopedia />} />
          <Route path="/encyclopedia/:familyId" element={<Encyclopedia />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
