import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { plantFamilies, quizQuestions, QuizQuestion } from '@/data/plantData';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, RotateCcw, Award } from 'lucide-react';

const Quiz = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const navigate = useNavigate();

  const [currentFamilyQuestions, setCurrentFamilyQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const family = useMemo(() => plantFamilies.find(f => f.id === familyId), [familyId]);

  useEffect(() => {
    if (familyId) {
      const questionsForFamily = quizQuestions.filter(q => q.familyId === familyId);
      setCurrentFamilyQuestions(questionsForFamily);
      // Reset quiz state when familyId changes or component mounts for a new family
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setScore(0);
      setShowFeedback(false);
      setIsCorrect(null);
      setQuizCompleted(false);
    }
  }, [familyId]);

  const currentQuestion = useMemo(() => {
    if (currentFamilyQuestions.length > 0 && currentQuestionIndex < currentFamilyQuestions.length) {
      return currentFamilyQuestions[currentQuestionIndex];
    }
    return null;
  }, [currentFamilyQuestions, currentQuestionIndex]);

  const totalPossiblePoints = useMemo(() => {
    return currentFamilyQuestions.reduce((sum, q) => sum + q.points, 0);
  }, [currentFamilyQuestions]);

  useEffect(() => {
    if (!showFeedback && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, showFeedback]);


  if (!family) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-red-700 mb-2">加载错误</CardTitle>
          <CardDescription className="text-gray-600 mb-6">
            未能找到ID为 "{familyId}" 的植物科信息。
          </CardDescription>
          <Button onClick={() => navigate('/quiz')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> 返回题目选择
          </Button>
        </Card>
      </div>
    );
  }

  if (currentFamilyQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-lime-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <Lightbulb className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-yellow-700 mb-2">题库建设中</CardTitle>
          <CardDescription className="text-gray-600 mb-6">
            该植物科 ({family.chineseName}) 的题目正在快马加鞭准备中，敬请期待！
          </CardDescription>
          <Button onClick={() => navigate('/quiz')} variant="outline">
             <ArrowLeft className="mr-2 h-4 w-4" /> 返回题目选择
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    if (!currentQuestion || userAnswer.trim() === '') return;

    const answerLower = userAnswer.trim().toLowerCase();
    const correct = currentQuestion.acceptableKeywords.some(keyword =>
      answerLower.includes(keyword.toLowerCase())
    );

    setIsCorrect(correct);
    if (correct) {
      setScore(score + currentQuestion.points);
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setShowFeedback(false);
    setIsCorrect(null);
    if (currentQuestionIndex < currentFamilyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setScore(0);
    setShowFeedback(false);
    setIsCorrect(null);
    setQuizCompleted(false);
  };

  const progress = currentFamilyQuestions.length > 0 ? ((currentQuestionIndex + (showFeedback ? 1: 0) ) / currentFamilyQuestions.length) * 100 : 0;


  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-teal-100 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl text-center">
          <CardHeader className="bg-green-600 text-white rounded-t-lg py-8">
            <Award className="h-20 w-20 mx-auto text-yellow-300 mb-3" />
            <CardTitle className="text-4xl font-bold">挑战完成!</CardTitle>
            <CardDescription className="text-green-50 text-lg mt-1">
              您已完成对 <span className="font-semibold">{family.chineseName}</span> 科的知识挑战。
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <p className="text-6xl font-bold text-gray-800 my-4">
              {score} <span className="text-3xl text-gray-500">/ {totalPossiblePoints}分</span>
            </p>
            <Progress value={(score/totalPossiblePoints)*100} className="w-3/4 mx-auto h-3 mb-6" />
            <p className="text-gray-700 mb-8 text-lg">
              {score === totalPossiblePoints ? "太棒了，获得了满分！知识渊博！🎉" : (score >= totalPossiblePoints * 0.7 ? "表现优异，继续加油！👍" : "继续努力，下次会更好！💪")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={restartQuiz} className="bg-green-500 hover:bg-green-600 text-white text-lg py-3">
                <RotateCcw className="mr-2 h-5 w-5" />
                再试一次
              </Button>
              <Button variant="outline" onClick={() => navigate('/quiz')} className="text-green-600 border-green-500 hover:bg-green-50 text-lg py-3">
                <ArrowLeft className="mr-2 h-5 w-5" />
                选择其他科
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    // This case should ideally be covered by the initial checks, but as a fallback:
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
         <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-red-700 mb-2">错误</CardTitle>
          <CardDescription className="text-gray-600 mb-6">无法加载当前题目，请稍后再试。</CardDescription>
          <Button onClick={() => navigate('/quiz')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> 返回题目选择
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" onClick={() => navigate('/quiz')} className="text-gray-700 hover:text-indigo-700 px-2">
              <ArrowLeft className="h-5 w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">返回选择</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-center text-indigo-800 flex-grow px-2 truncate">
              {family.chineseName} <span className="text-gray-500 font-normal hidden sm:inline">({family.latinName})</span>
            </h1>
            <Badge variant="secondary" className="text-sm bg-indigo-200 text-indigo-900 whitespace-nowrap py-1.5 px-3">
              得分: {score}
            </Badge>
          </div>
          <Progress value={progress} className="h-2.5 rounded-full" />
        </div>

        {/* Question Card */}
        <Card className="shadow-xl overflow-hidden border-indigo-200">
          <CardHeader className="bg-indigo-50 p-5 sm:p-6 border-b border-indigo-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
              <CardTitle className="text-lg sm:text-xl text-indigo-900 font-semibold">
                题目 {currentQuestionIndex + 1} / {currentFamilyQuestions.length}
              </CardTitle>
              <Badge variant="outline" className="border-indigo-400 text-indigo-700 text-xs sm:text-sm py-1 px-2.5 self-start sm:self-center">
                {currentQuestion.targetFeatureCategory} - {currentQuestion.points}分
              </Badge>
            </div>
            {currentQuestion.imageUrl && (
              <div className="my-4 rounded-lg overflow-hidden shadow-md aspect-video bg-gray-100 flex items-center justify-center">
                <img
                  src={currentQuestion.imageUrl}
                  alt={`特征: ${currentQuestion.targetFeatureCategory} - ${family.chineseName}`}
                  className="w-full h-full object-contain max-h-64 sm:max-h-80"
                />
              </div>
            )}
            <p className="text-md sm:text-lg text-gray-800 mt-3 font-medium leading-relaxed">
              {currentQuestion.prompt}
            </p>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 bg-white">
            <div className="space-y-4 mb-6">
              <Input
                ref={inputRef}
                type="text"
                placeholder="输入您认为正确的特征关键词..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !showFeedback && userAnswer.trim() !== '' && handleSubmitAnswer()}
                disabled={showFeedback}
                className="text-base py-3 px-4 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                aria-label="答案输入框"
              />
            </div>

            {showFeedback && (
              <Alert className={`mb-5 p-4 rounded-md ${isCorrect ? "bg-green-50 border-green-400 text-green-800" : "bg-red-50 border-red-400 text-red-800"}`}>
                <div className="flex items-center">
                  {isCorrect ? <CheckCircle className="h-6 w-6 text-green-600 mr-3" /> : <XCircle className="h-6 w-6 text-red-600 mr-3" />}
                  <div className="flex-grow">
                    <AlertTitle className="font-bold text-lg">
                      {isCorrect ? "回答正确！" : "回答错误"}
                    </AlertTitle>
                    <AlertDescription className="text-sm mt-1">
                      {isCorrect ? `太棒了！获得 ${currentQuestion.points} 分！` :
                       currentQuestion.acceptableKeywords.length > 0 ? `提示: 正确关键词可能包括 "${currentQuestion.acceptableKeywords.slice(0,2).join('", "')}" 等。` : "请再接再厉！"}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {!showFeedback ? (
                <Button 
                  onClick={handleSubmitAnswer}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3 rounded-md"
                  disabled={userAnswer.trim() === ''}
                >
                  提交答案
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-lg py-3 rounded-md">
                  {currentQuestionIndex < currentFamilyQuestions.length - 1 ? '下一题' : '查看总分'}
                </Button>
              )}
            </div>
             {/* Hint button can be added here if hints are implemented in data */}
          </CardContent>
        </Card>

        {/* Optional: Display Family Info during Quiz */}
        {/*
        <Card className="mt-8 border-gray-200">
          <CardHeader>
            <CardTitle className="text-base text-gray-700">{family.chineseName} ({family.latinName}) 简介</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p className="line-clamp-3">{family.description}</p>
          </CardContent>
        </Card>
        */}
      </div>
    </div>
  );
};

export default Quiz;