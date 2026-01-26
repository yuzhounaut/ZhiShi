import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { atlasItems, AtlasItem } from '@/data/atlasData';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Award, Image as ImageIcon, Type } from 'lucide-react';

type QuizMode = 'term-to-image' | 'image-to-term';

const TOTAL_QUESTIONS = 5;

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Helper to get the target noun for an atlas item
const getTargetNoun = (item: AtlasItem): string => {
  // For "叶-叶的组成-托叶-托叶刺-枣.JPG", path is ["叶", "叶的组成", "托叶", "托叶刺", "枣"]
  // User says answer should be "托叶", which is index 2.
  if (item.path.length >= 4) {
    return item.path[2]; // e.g., "托叶", "单果", "芽"
  } else if (item.path.length >= 3) {
    return item.path[1]; // e.g., "方茎"
  }
  return item.path[0];
};

const ImageQuiz = () => {
  const navigate = useNavigate();
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [score, setScore] = useState(0);

  const [currentQuestion, setCurrentQuestion] = useState<{ item: AtlasItem, noun: string } | null>(null);
  const [options, setOptions] = useState<{ item?: AtlasItem, noun?: string }[]>([]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null); // item.id for image, noun for term

  // All valid nouns for distractors
  const allNouns = useMemo(() => {
    const nouns = new Set<string>();
    atlasItems.forEach(item => {
      const noun = getTargetNoun(item);
      if (noun) nouns.add(noun);
    });
    return Array.from(nouns);
  }, []);

  const generateQuestion = (mode: QuizMode) => {
    // 1. Pick a random item for the correct answer
    // Filter items to ensure they have enough path depth for a meaningful noun
    const validItems = atlasItems.filter(item => item.path.length >= 3);
    const correctItem = validItems[Math.floor(Math.random() * validItems.length)];
    const correctNoun = getTargetNoun(correctItem);

    if (mode === 'image-to-term') {
      // Correct answer is the noun
      // Distractors are other nouns
      const distractors: string[] = [];
      while (distractors.length < 3) {
        const randomNoun = allNouns[Math.floor(Math.random() * allNouns.length)];
        if (randomNoun !== correctNoun && !distractors.includes(randomNoun)) {
          distractors.push(randomNoun);
        }
      }

      const questionOptions = shuffleArray([correctNoun, ...distractors]).map(n => ({ noun: n }));
      setCurrentQuestion({ item: correctItem, noun: correctNoun });
      setOptions(questionOptions);
    } else {
      // term-to-image
      // Correct answer is the item (image)
      // Distractors are items with DIFFERENT target nouns
      const distractors: AtlasItem[] = [];
      while (distractors.length < 3) {
        const randomItem = validItems[Math.floor(Math.random() * validItems.length)];
        const randomNoun = getTargetNoun(randomItem);
        if (randomNoun !== correctNoun && !distractors.some(d => d.id === randomItem.id)) {
          distractors.push(randomItem);
        }
      }

      const questionOptions = shuffleArray([correctItem, ...distractors]).map(item => ({ item }));
      setCurrentQuestion({ item: correctItem, noun: correctNoun });
      setOptions(questionOptions);
    }
  };

  const startQuiz = (mode: QuizMode) => {
    setQuizMode(mode);
    setQuestionCount(1);
    setScore(0);
    setShowFeedback(false);
    setSelectedId(null);
    generateQuestion(mode);
  };

  const handleAnswer = (id: string) => {
    if (showFeedback) return;

    setSelectedId(id);
    const isCorrect = quizMode === 'image-to-term'
      ? id === currentQuestion?.noun
      : id === currentQuestion?.item.id;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (questionCount >= TOTAL_QUESTIONS) {
      setQuizMode(null);
      return;
    }
    setQuestionCount(prev => prev + 1);
    setShowFeedback(false);
    setSelectedId(null);
    generateQuestion(quizMode!);
  };

  const restartQuiz = () => {
    setQuizMode(null);
    setQuestionCount(0);
    setScore(0);
  };

  const isCurrentCorrect = useMemo(() => {
    if (quizMode === 'image-to-term') return selectedId === currentQuestion?.noun;
    return selectedId === currentQuestion?.item.id;
  }, [selectedId, currentQuestion, quizMode]);

  // --- Render Logic ---

  if (quizMode === null && questionCount > 0) {
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
              <Button variant="outline" onClick={() => navigate('/quiz')} className="text-indigo-700 border-indigo-500 hover:bg-indigo-50 text-lg py-3">
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
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800">形态学名词练习</h1>
            <p className="text-lg text-gray-600 mt-2">使用名词图鉴中的高清图片进行双向练习</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card onClick={() => startQuiz('term-to-image')} className="hover:shadow-xl hover:border-purple-500 transition-all cursor-pointer bg-white group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-2xl font-bold text-purple-700">名词认图</CardTitle>
                    <ImageIcon className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">根据给出的形态学名词，在四张图中选出正确的图示。</p>
                </CardContent>
            </Card>
            <Card onClick={() => startQuiz('image-to-term')} className="hover:shadow-xl hover:border-indigo-500 transition-all cursor-pointer bg-white group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-2xl font-bold text-indigo-700">图片识词</CardTitle>
                    <Type className="h-8 w-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">根据给出的特征图片，在四个名词中选出正确的描述。</p>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

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

        <Card className="shadow-lg bg-white overflow-hidden">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-center text-2xl sm:text-3xl font-bold text-gray-800">
              {quizMode === 'term-to-image' ? `请找出：${currentQuestion?.noun}` : '这是什么特征？'}
            </CardTitle>
            {quizMode === 'image-to-term' && (
              <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center mt-4">
                <img
                  src={currentQuestion?.item.url}
                  alt="特征图片"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className={`grid grid-cols-2 gap-4 ${quizMode === 'term-to-image' ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
              {options.map((option, idx) => (
                quizMode === 'term-to-image' ? (
                  <div
                    key={option.item?.id || idx}
                    onClick={() => handleAnswer(option.item!.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-4 cursor-pointer transition-all
                      ${showFeedback && option.item?.id === currentQuestion?.item.id ? 'border-green-500 scale-105 z-10' : ''}
                      ${showFeedback && option.item?.id === selectedId && !isCurrentCorrect ? 'border-red-500' : 'border-transparent'}
                      ${!showFeedback ? 'hover:border-blue-400 hover:shadow-lg' : ''}
                    `}
                  >
                    <img src={option.item?.url} alt="选项图片" className="w-full h-full object-cover"/>
                    {showFeedback && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            {option.item?.id === currentQuestion?.item.id && <CheckCircle className="h-12 w-12 text-white bg-green-500 rounded-full p-1"/>}
                            {option.item?.id === selectedId && !isCurrentCorrect && <XCircle className="h-12 w-12 text-white bg-red-500 rounded-full p-1"/>}
                        </div>
                    )}
                  </div>
                ) : (
                  <Button
                    key={option.noun || idx}
                    onClick={() => handleAnswer(option.noun!)}
                    variant={showFeedback ? (option.noun === currentQuestion?.noun ? 'default' : (option.noun === selectedId ? 'destructive' : 'outline')) : 'outline'}
                    className={`h-auto text-lg p-6 justify-center transition-all duration-300 break-words whitespace-normal
                      ${showFeedback && option.noun === currentQuestion?.noun ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg scale-105' : ''}
                    `}
                    disabled={showFeedback}
                  >
                    {option.noun}
                  </Button>
                )
              ))}
            </div>

            {showFeedback && (
              <div className="mt-8 flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className={`text-lg font-bold ${isCurrentCorrect ? 'text-green-600' : 'text-red-600'}`}>
                   {isCurrentCorrect ? '回答正确！' : `回答错误，正确答案是：${currentQuestion?.noun}`}
                </div>
                <div className="text-sm text-gray-500 italic mb-2">
                  图源：{currentQuestion?.item.path.join(' > ')}
                </div>
                <Button onClick={handleNextQuestion} size="lg" className="px-12 py-6 text-xl bg-indigo-600 hover:bg-indigo-700">
                    {questionCount >= TOTAL_QUESTIONS ? '查看最终得分' : '下一题'}
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
