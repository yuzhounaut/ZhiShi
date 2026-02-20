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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-12 border-none shadow-xl bg-card">
          <Lightbulb className="h-16 w-16 mx-auto text-primary/40 mb-6" />
          <CardTitle className="text-2xl font-serif font-bold text-foreground mb-4">挑战准备中</CardTitle>
          <CardDescription className="text-muted-foreground mb-8">
            未能找到ID为 "{familyId}" 的植物科挑战信息，或该科的特征数据不完整。
          </CardDescription>
          <Button onClick={() => navigate('/quiz')} variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-2xl text-center border-none bg-card overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground py-10">
                    <Trophy className="h-20 w-20 mx-auto text-yellow-300/90 mb-4" />
                    <CardTitle className="text-4xl font-serif font-bold">挑战完成</CardTitle>
                    <CardDescription className="text-primary-foreground/80 text-lg mt-2 font-light">
                        您已完成对 <span className="font-semibold border-b border-primary-foreground/40 pb-0.5">{family.chineseName}</span> 科的特征认知挑战。
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 md:p-10">
                    <p className="text-6xl font-serif font-bold text-foreground my-6">
                        {score} <span className="text-3xl text-muted-foreground font-light">/ {totalSteps} 关</span>
                    </p>
                    <Progress value={(score/totalSteps)*100} className="w-3/4 mx-auto h-3 mb-8 bg-secondary" indicatorClassName="bg-primary" />

                    <div className="space-y-3 my-8 text-left max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {stepResults.map((result, index) => (
                            <div key={index} className={`flex items-center justify-between p-3 rounded-lg text-sm border ${result.isCorrect ? 'bg-primary/5 border-primary/20 text-foreground' : 'bg-destructive/5 border-destructive/20 text-destructive'}`}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <span className="font-serif font-bold min-w-[3rem]">{result.stepName}</span>
                                  <span className="italic truncate text-muted-foreground">“{result.userAnswer}”</span>
                                </div>
                                {result.isCorrect ? <CheckCircle className="h-5 w-5 text-primary shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                        <Button onClick={restartQuiz} className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-12 shadow-md">
                            <RotateCcw className="mr-2 h-5 w-5" />
                            再试一次
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/quiz')} className="border-primary/30 text-primary hover:bg-primary/5 text-lg h-12">
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
    <div className="min-h-screen bg-background text-foreground py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-4xl flex flex-col items-center">
        <div className="w-full mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate('/quiz')} className="text-muted-foreground hover:text-primary px-2 -ml-2">
              <ArrowLeft className="h-5 w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline font-medium">返回选择</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-center text-foreground flex-grow px-2 truncate tracking-tight">
              {family.chineseName} <span className="text-muted-foreground font-light text-xl mx-2">|</span> 序贯挑战
            </h1>
            <Badge variant="outline" className="text-sm bg-background border-primary/20 text-primary whitespace-nowrap py-1.5 px-3 font-mono">
              得分: {score}
            </Badge>
          </div>
          <Progress value={progress} className="h-1.5 rounded-full bg-secondary" indicatorClassName="bg-primary" />
        </div>

        <Card className="w-full shadow-xl overflow-hidden border-border/60 bg-card rounded-xl">
          <CardHeader className="bg-secondary/20 p-6 sm:p-8 border-b border-border/40">
            <div className="flex justify-between items-center gap-2 mb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">
                第 {currentStepIndex + 1} / {totalSteps} 关
              </CardTitle>
            </div>
            <p className="text-xl sm:text-2xl text-foreground mt-2 font-serif font-medium leading-relaxed">
              请描述该科植物的 <span className='font-bold text-primary border-b-2 border-primary/20 pb-0.5'>{currentStepInfo.name}</span> 有什么典型特征？
            </p>
          </CardHeader>

          <CardContent className="p-6 sm:p-10 bg-card">
            <div className="space-y-6 mb-8">
              <Input
                ref={inputRef}
                type="text"
                placeholder={`描述${currentStepInfo.name}特征...`}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !showFeedback && userAnswer.trim() !== '' && handleAnswerSubmit()}
                disabled={showFeedback || isLoading}
                className="text-lg py-6 px-6 h-16 border-border focus:border-primary/50 focus:ring-primary/20 shadow-sm transition-all"
              />
            </div>

            {isLoading && (
                <div className="text-center py-6">
                    <Bot className="h-8 w-8 text-primary animate-bounce mx-auto mb-3 opacity-80" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">{loadingMessage}</p>
                </div>
            )}

            {showFeedback && (
              <Alert className={`mb-8 p-5 rounded-lg border-l-4 shadow-sm ${isCorrect ? "bg-primary/5 border-l-primary border-y-transparent border-r-transparent text-foreground" : "bg-destructive/5 border-l-destructive border-y-transparent border-r-transparent text-foreground"}`}>
                <div className="flex items-start">
                  {isCorrect ? <CheckCircle className="h-6 w-6 text-primary mr-4 mt-0.5" /> : <XCircle className="h-6 w-6 text-destructive mr-4 mt-0.5" />}
                  <div className="flex-grow">
                    <AlertTitle className="font-serif font-bold text-lg mb-1">
                      {isCorrect ? "回答正确" : "回答错误"}
                    </AlertTitle>
                    <AlertDescription className="text-base space-y-2 text-muted-foreground leading-relaxed">
                      <p>
                        {isCorrect ? "非常出色！准确掌握了关键特征。" : "未能匹配到关键特征，请再接再厉。"}
                      </p>
                      {!isCorrect && (
                         <p className="text-sm font-mono mt-2 pt-2 border-t border-border/50 text-foreground/80">
                          参考答案: {family.traits[currentStepInfo.key]?.join('、')}
                        </p>
                      )}
                      {isCorrect && (
                        <p className="text-sm font-mono mt-2 pt-2 border-t border-primary/10 text-primary/80">
                          参考答案: {family.traits[currentStepInfo.key]?.join('、')}
                        </p>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {showFeedback ? (
                isCorrect ? (
                  <Button onClick={handleNextStep} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 rounded-lg shadow-md transition-all hover:-translate-y-0.5">
                    {currentStepIndex === totalSteps - 1 ? '查看最终得分' : '进入下一关'}
                  </Button>
                ) : (
                  <Button onClick={tryAgain} variant="secondary" className="flex-1 text-foreground hover:bg-secondary/80 text-lg h-14 rounded-lg">
                    再试一次
                  </Button>
                )
              ) : (
                <Button onClick={handleAnswerSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-14 rounded-lg shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none" disabled={!userAnswer.trim() || isLoading}>
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
