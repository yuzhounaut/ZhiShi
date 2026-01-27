import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Quiz = lazy(() => import('./pages/Quiz'));
const ImageQuiz = lazy(() => import('./pages/ImageQuiz'));
const PlantIdentifier = lazy(() => import('./pages/PlantIdentifier'));
const Encyclopedia = lazy(() => import('./pages/Encyclopedia'));
const Atlas = lazy(() => import('./pages/Atlas'));
const NotFound = lazy(() => import('./pages/NotFound'));
const QuizSelectionPage = lazy(() => import('./pages/QuizSelectionPage'));

const PageLoader = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Header />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<QuizSelectionPage />} />
            <Route path="/quiz/:familyId" element={<Quiz />} />
            <Route path="/identify" element={<PlantIdentifier />} />
            <Route path="/image-quiz" element={<ImageQuiz />} />
            <Route path="/encyclopedia" element={<Navigate to="/encyclopedia/families" replace />} />
            <Route path="/encyclopedia/families" element={<Encyclopedia />} />
            <Route path="/encyclopedia/families/:familyId" element={<Encyclopedia />} />
            <Route path="/encyclopedia/atlas" element={<Atlas />} />
            <Route path="/encyclopedia/atlas/item/:itemId" element={<Atlas />} />
            <Route path="/encyclopedia/atlas/*" element={<Atlas />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
