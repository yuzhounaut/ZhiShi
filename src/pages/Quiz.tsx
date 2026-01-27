import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { plantFamilies } from '@/data/plantData';
import { semanticSearch } from '@/lib/ai';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, RotateCcw, Bot, Sparkles, Trophy } from 'lucide-react';
import type { PlantFamily } from '@/data/plantData';

type TraitKey = keyof PlantFamily['traits'];

const CHALLENGE_SEQUENCE: { key: TraitKey, name: string }[] = [
  { key: 'growth', name: '习性' },
  { key: 'root', name: '根' },
  { key: 'stem', name: '茎' },
  { key: 'leaf', name: '叶' },
  { key: 'flower', name: '花' },
  { key: 'fruit', name: '果实' }
];

const CORRECTNESS_THRESHOLD = 0.4; // AI similarity score threshold

interface StepResult {
  stepName: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswers: string[];
}

const SequentialQuiz = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [family, setFamily] = useState<PlantFamily | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    const foundFamily = plantFamilies.find(f => f.id === familyId);
    if (foundFamily) {
      setFamily(foundFamily);
      // Check if this family has at least one trait defined for the first step
      const firstStepKey = CHALLENGE_SEQUENCE[0].key;
      if (!foundFamily.traits[firstStepKey] || foundFamily.traits[firstStepKey].length === 0) {
        // This family is not configured for the quiz, handle this case
        setFamily(null); // Mark as not found for quiz purposes
      }
    } else {
        setFamily(null);
    }
  }, [familyId]);

  useEffect(() => {
    if (!showFeedback && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showFeedback, isLoading, currentStepIndex]);

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim() || !family) return;

    setIsLoading(true);
    setLoadingMessage('AI裁判正在分析您的答案...');

    const currentStep = CHALLENGE_SEQUENCE[currentStepIndex];
    const correctAnswers = family.traits[currentStep.key];

    if (!correctAnswers || correctAnswers.length === 0) {
        // This case means the family has no defined traits for this step.
        // We can treat this as an automatic pass or handle it as an error.
        // Let's treat it as correct but provide a note.
        setIsCorrect(true);
        setStepResults(prev => [...prev, {
            stepName: currentStep.name,
            userAnswer: userAnswer,
            isCorrect: true,
            correctAnswers: ['该科在此特征上无典型数据']
        }]);
        setShowFeedback(true);
        setIsLoading(false);
        return;
    }

    const aiResults = await semanticSearch(userAnswer, correctAnswers);
    const topScore = aiResults.length > 0 ? aiResults[0].score : 0;

    // 1. 检查关键词包含关系：答案包含预定义的特征词，或答案是长特征词的有效部分（>=2字）
    const containsKeyword = correctAnswers.some(kw => userAnswer.includes(kw));
    const matchesKeywordPart = userAnswer.length >= 2 && correctAnswers.some(kw => kw.includes(userAnswer));

    // 2. 检查是否仅含英文或数字
    const isOnlyEnglishOrDigits = /^[A-Za-z0-9\s.,!?-]+$/.test(userAnswer);

    let correct = topScore >= CORRECTNESS_THRESHOLD;

    // 必须包含关键词或其有效部分
    if (!(containsKeyword || matchesKeywordPart)) {
      correct = false;
    }

    // 直接拒绝仅含英文字母或数字的答案
    if (isOnlyEnglishOrDigits) {
      correct = false;
    }

    // 优化短答案匹配：如果是单字，必须是正确答案中的某个词的精确匹配
    // 避免“本”匹配到“草本”或“多年生”的情况
    if (userAnswer.trim().length <= 1) {
      const isExactMatch = correctAnswers.some(ans => ans === userAnswer.trim());
      if (!isExactMatch) {
        correct = false;
      }
    }

    setIsCorrect(correct);
    // Only record the result if the answer is correct, to enforce the "must answer correctly" rule
    if (correct) {
      setStepResults(prev => [...prev, {
        stepName: currentStep.name,
        userAnswer: userAnswer,
        isCorrect: true,
        correctAnswers: correctAnswers
      }]);
    }

    setShowFeedback(true);
    setIsLoading(false);
  };

  const handleNextStep = () => {
    setShowFeedback(false);
    setUserAnswer('');
    if (currentStepIndex < CHALLENGE_SEQUENCE.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const tryAgain = () => {
      setShowFeedback(false);
      setUserAnswer('');
  }

  const restartQuiz = () => {
    setCurrentStepIndex(0);
    setUserAnswer('');
    setStepResults([]);
    setShowFeedback(false);
    setIsCorrect(false);
    setQuizCompleted(false);
  };

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <Lightbulb className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-yellow-700 mb-2">挑战准备中</CardTitle>
          <CardDescription className="text-gray-600 mb-6">
            未能找到ID为 "{familyId}" 的植物科挑战信息，或该科的特征数据不完整。
          </CardDescription>
          <Button onClick={() => navigate('/quiz')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> 返回题目选择
          </Button>
        </Card>
      </div>
    );
  }

  const score = stepResults.filter(r => r.isCorrect).length;
  const totalSteps = CHALLENGE_SEQUENCE.length;
  const progress = (currentStepIndex / totalSteps) * 100;
  const currentStepInfo = CHALLENGE_SEQUENCE[currentStepIndex];

  if (quizCompleted) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-2xl text-center">
                <CardHeader className="bg-green-600 text-white rounded-t-lg py-8">
                    <Trophy className="h-20 w-20 mx-auto text-yellow-300 mb-3" />
                    <CardTitle className="text-4xl font-bold">挑战完成!</CardTitle>
                    <CardDescription className="text-green-50 text-lg mt-1">
                        您已完成对 <span className="font-semibold">{family.chineseName}</span> 科的特征认知挑战。
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 bg-white rounded-b-lg">
                    <p className="text-6xl font-bold text-gray-800 my-4">
                        {score} <span className="text-3xl text-gray-500">/ {totalSteps} 关</span>
                    </p>
                    <Progress value={(score/totalSteps)*100} className="w-3/4 mx-auto h-3 mb-6 [&>div]:bg-green-500" />
                    <div className="space-y-2 my-6">
                        {stepResults.map((result, index) => (
                            <div key={index} className={`flex items-center justify-between p-2 rounded-md text-sm ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                                <span className="font-semibold">{result.stepName}:</span>
                                <span className="italic truncate mx-2 flex-1 text-left">“{result.userAnswer}”</span>
                                {result.isCorrect ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                        <Button onClick={restartQuiz} className="bg-green-600 hover:bg-green-700 text-white text-lg py-3">
                            <RotateCcw className="mr-2 h-5 w-5" />
                            再试一次
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/quiz')} className="text-green-700 border-green-500 hover:bg-green-50 text-lg py-3">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            选择其他科
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" onClick={() => navigate('/quiz')} className="text-gray-700 hover:text-blue-700 px-2">
              <ArrowLeft className="h-5 w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">返回选择</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-800 flex-grow px-2 truncate">
              {family.chineseName} - 序贯挑战
            </h1>
            <Badge variant="secondary" className="text-sm bg-blue-100 text-blue-900 whitespace-nowrap py-1.5 px-3">
              得分: {score}
            </Badge>
          </div>
          <Progress value={progress} className="h-2.5 rounded-full [&>div]:bg-blue-500" />
        </div>

        <Card className="shadow-xl overflow-hidden border-blue-300">
          <CardHeader className="bg-blue-50 p-5 sm:p-6 border-b border-blue-200">
            <div className="flex justify-between items-center gap-2 mb-2">
              <CardTitle className="text-lg sm:text-xl text-blue-900 font-semibold">
                第 {currentStepIndex + 1} / {totalSteps} 关: 【{currentStepInfo.name}】特征
              </CardTitle>
            </div>
            <p className="text-md sm:text-lg text-gray-800 mt-3 font-medium leading-relaxed">
              请描述该科植物的 <span className='font-bold text-blue-700'>{currentStepInfo.name}</span> 有什么典型特征？
            </p>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 bg-white">
            <div className="space-y-4 mb-6">
              <Input
                ref={inputRef}
                type="text"
                placeholder={`描述${currentStepInfo.name}特征, 如 "${family.traits[currentStepInfo.key]?.[0] || '...'}"`}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !showFeedback && userAnswer.trim() !== '' && handleAnswerSubmit()}
                disabled={showFeedback || isLoading}
                className="text-base py-3 px-4 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {isLoading && (
                <div className="text-center py-4">
                    <Bot className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">{loadingMessage}</p>
                </div>
            )}

            {showFeedback && (
              <Alert className={`mb-5 p-4 rounded-md ${isCorrect ? "bg-green-50 border-green-400 text-green-800" : "bg-red-50 border-red-400 text-red-800"}`}>
                <div className="flex items-start">
                  {isCorrect ? <CheckCircle className="h-6 w-6 text-green-600 mr-3" /> : <XCircle className="h-6 w-6 text-red-600 mr-3" />}
                  <div className="flex-grow">
                    <AlertTitle className="font-bold text-lg">
                      {isCorrect ? "回答正确！" : "回答错误！"}
                    </AlertTitle>
                    <AlertDescription className="text-sm mt-1 space-y-1">
                      <p>
                        {isCorrect ? "太棒了！请进入下一关。" : "请再试一次。"}
                      </p>
                      <p className="text-xs font-mono">
                        提示: 该科的正确特征包括 “{family.traits[currentStepInfo.key]?.join('”, “')}”。
                      </p>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {showFeedback ? (
                isCorrect ? (
                  <Button onClick={handleNextStep} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-md">
                    {currentStepIndex === totalSteps - 1 ? '查看最终得分' : '进入下一关'}
                  </Button>
                ) : (
                  <Button onClick={tryAgain} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-lg py-3 rounded-md">
                    再试一次
                  </Button>
                )
              ) : (
                <Button onClick={handleAnswerSubmit} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-3 rounded-md" disabled={!userAnswer.trim() || isLoading}>
                  <Sparkles className="h-5 w-5 mr-2" />
                  提交答案
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SequentialQuiz;