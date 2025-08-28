import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { morphologyQuizData } from '@/data/plantData';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Award, Image as ImageIcon, Type, Shuffle } from 'lucide-react';
import type { MorphologyQuizItem } from '@/data/plantData';

type QuizMode = 'term-to-image' | 'image-to-term';

const TOTAL_QUESTIONS = 5; // Let's do a short quiz of 5 questions

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const ImageQuiz = () => {
  const navigate = useNavigate();
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [score, setScore] = useState(0);

  const [currentQuestion, setCurrentQuestion] = useState<MorphologyQuizItem | null>(null);
  const [options, setOptions] = useState<MorphologyQuizItem[]>([]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const isCorrect = useMemo(() => {
    return selectedAnswerId === currentQuestion?.id;
  }, [selectedAnswerId, currentQuestion]);

  const generateQuestion = (mode: QuizMode) => {
    // Get one random item for the correct answer
    const correctIndex = Math.floor(Math.random() * morphologyQuizData.length);
    const correctItem = morphologyQuizData[correctIndex];

    // Get 3 other random items for distractors
    const distractors: MorphologyQuizItem[] = [];
    while (distractors.length < 3) {
      const randomIndex = Math.floor(Math.random() * morphologyQuizData.length);
      const randomItem = morphologyQuizData[randomIndex];
      // Ensure the distractor is not the correct answer and not already in the list
      if (randomItem.id !== correctItem.id && !distractors.some(d => d.id === randomItem.id)) {
        distractors.push(randomItem);
      }
    }

    setCurrentQuestion(correctItem);
    setOptions(shuffleArray([correctItem, ...distractors]));
  };

  const startQuiz = (mode: QuizMode) => {
    setQuizMode(mode);
    setQuestionCount(1);
    setScore(0);
    setShowFeedback(false);
    setSelectedAnswerId(null);
    generateQuestion(mode);
  };

  const handleAnswer = (selectedId: string) => {
    if (showFeedback) return; // Prevent answering again

    setSelectedAnswerId(selectedId);
    if (selectedId === currentQuestion?.id) {
      setScore(prev => prev + 1);
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (questionCount >= TOTAL_QUESTIONS) {
      // End of quiz
      setQuizMode(null); // This will trigger the results screen
      return;
    }
    setQuestionCount(prev => prev + 1);
    setShowFeedback(false);
    setSelectedAnswerId(null);
    generateQuestion(quizMode!);
  };

  const restartQuiz = () => {
    setQuizMode(null);
    setQuestionCount(0);
    setScore(0);
  }

  // --- Render Logic ---

  if (quizMode === null && questionCount > 0) {
    // --- Quiz Results Screen ---
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl text-center">
          <CardHeader className="bg-indigo-600 text-white rounded-t-lg py-8">
            <Award className="h-20 w-20 mx-auto text-amber-300 mb-3" />
            <CardTitle className="text-4xl font-bold">练习完成!</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white rounded-b-lg">
            <p className="text-6xl font-bold text-gray-800 my-4">
              {score} <span className="text-3xl text-gray-500">/ {TOTAL_QUESTIONS}分</span>
            </p>
            <Progress value={(score/TOTAL_QUESTIONS)*100} className="w-3/4 mx-auto h-3 mb-6 [&>div]:bg-indigo-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <Button onClick={restartQuiz} className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3">
                <RotateCcw className="mr-2 h-5 w-5" />
                重新开始
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="text-indigo-700 border-indigo-500 hover:bg-indigo-50 text-lg py-3">
                <ArrowLeft className="mr-2 h-5 w-5" />
                返回主页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizMode === null) {
    // --- Mode Selection Screen ---
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800">形态学名词练习</h1>
            <p className="text-lg text-gray-600 mt-2">选择一个模式开始图文双向练习</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card onClick={() => startQuiz('term-to-image')} className="hover:shadow-xl hover:border-purple-500 transition-all cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-2xl font-bold text-purple-700">名词认图</CardTitle>
                    <Type className="h-8 w-8 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">根据给出的形态学名词，在四张图片中选出正确的图示。</p>
                </CardContent>
            </Card>
            <Card onClick={() => startQuiz('image-to-term')} className="hover:shadow-xl hover:border-indigo-500 transition-all cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-2xl font-bold text-indigo-700">图片识词</CardTitle>
                    <ImageIcon className="h-8 w-8 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">根据给出的特征图片，在四个名词中选出正确的描述。</p>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  // --- Main Quiz Screen ---
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" onClick={restartQuiz} className="text-gray-700 hover:text-red-700 px-2">
              <ArrowLeft className="h-5 w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">退出练习</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex-grow px-2 truncate">
              {quizMode === 'term-to-image' ? '名词认图' : '图片识词'}
            </h1>
            <Badge variant="secondary" className="text-sm bg-gray-200 text-gray-900 whitespace-nowrap py-1.5 px-3">
              得分: {score}
            </Badge>
          </div>
          <Progress value={(questionCount / TOTAL_QUESTIONS) * 100} className="h-2.5 rounded-full" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold text-gray-800 mb-4">
              {quizMode === 'term-to-image' ? currentQuestion?.term : '这是什么特征？'}
            </CardTitle>
            {quizMode === 'image-to-term' && (
              <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={currentQuestion?.imageUrl} alt={currentQuestion?.term} className="w-full h-full object-contain"/>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-2 gap-4 ${quizMode === 'term-to-image' ? 'aspect-w-16 aspect-h-9' : ''}`}>
              {options.map(option => (
                quizMode === 'term-to-image' ? (
                  <div key={option.id} onClick={() => handleAnswer(option.id)}
                    className={`relative rounded-lg overflow-hidden border-4 cursor-pointer transition-all
                      ${showFeedback && option.id === currentQuestion?.id ? 'border-green-500' : ''}
                      ${showFeedback && option.id === selectedAnswerId && !isCorrect ? 'border-red-500' : 'border-transparent'}
                      ${!showFeedback ? 'hover:border-blue-400' : ''}
                    `}>
                    <img src={option.imageUrl} alt={option.term} className="w-full h-full object-cover"/>
                    {showFeedback && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            {option.id === currentQuestion?.id && <CheckCircle className="h-16 w-16 text-white bg-green-500 rounded-full p-2"/>}
                            {option.id === selectedAnswerId && !isCorrect && <XCircle className="h-16 w-16 text-white bg-red-500 rounded-full p-2"/>}
                        </div>
                    )}
                  </div>
                ) : ( // image-to-term
                  <Button key={option.id} onClick={() => handleAnswer(option.id)}
                    variant={showFeedback ? (option.id === currentQuestion?.id ? 'default' : (option.id === selectedAnswerId ? 'destructive' : 'outline')) : 'outline'}
                    className={`h-auto text-lg p-4 justify-center transition-all duration-300
                      ${showFeedback && option.id === currentQuestion?.id ? 'bg-green-600 hover:bg-green-700' : ''}
                    `}
                    disabled={showFeedback}>
                    {option.term}
                  </Button>
                )
              ))}
            </div>
            {showFeedback && (
                <div className="mt-6 text-center">
                    <Button onClick={handleNextQuestion} size="lg" className="text-xl">
                        {questionCount >= TOTAL_QUESTIONS ? '查看得分' : '下一题'}
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageQuiz;
