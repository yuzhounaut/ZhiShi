import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { plantFamilies, quizQuestions } from '@/data/plantData';
import { ArrowLeft, Check, X, Lightbulb, RotateCcw } from 'lucide-react';

const Quiz = () => {
  const { familyId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const family = plantFamilies.find(f => f.id === familyId);
  const questions = quizQuestions.filter(q => q.familyId === familyId);

  useEffect(() => {
    if (!family || questions.length === 0) {
      return;
    }
  }, [family, questions]);

  if (!family || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">题库建设中</h2>
            <p className="text-gray-600 mb-4">该植物科的题目正在准备中，敬请期待！</p>
            <Link to="/">
              <Button>返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;

    const question = questions[currentQuestion];
    const isCorrect = question.correctAnswers.some(answer => 
      currentAnswer.toLowerCase().includes(answer.toLowerCase()) ||
      answer.toLowerCase().includes(currentAnswer.toLowerCase())
    );

    const newAnswers = [...userAnswers, currentAnswer];
    setUserAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer('');
      setShowHint(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setCurrentAnswer('');
    setShowResult(false);
    setScore(0);
    setShowHint(false);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800">
                {family.chineseName} - 挑战完成！
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-green-600 mb-4">
                  {score}/{questions.length}
                </div>
                <p className="text-xl text-gray-600">
                  正确率: {Math.round((score / questions.length) * 100)}%
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">答案解析</h3>
                {questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-500 mr-2">题目 {index + 1}:</span>
                      {question.correctAnswers.some(answer => 
                        userAnswers[index]?.toLowerCase().includes(answer.toLowerCase()) ||
                        answer.toLowerCase().includes(userAnswers[index]?.toLowerCase())
                      ) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">你的答案: {userAnswers[index] || '未回答'}</p>
                    <p className="text-sm text-green-700 mb-2">
                      正确答案: {question.correctAnswers.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500">{question.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button onClick={resetQuiz} className="bg-green-600 hover:bg-green-700">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重新挑战
                </Button>
                <Link to="/">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回首页
                  </Button>
                </Link>
                <Link to="/encyclopedia">
                  <Button variant="outline">
                    📱 查看植物图鉴
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Link>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {family.chineseName} 挑战
            </h1>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {currentQuestion + 1}/{questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              题目 {currentQuestion + 1}: 观察下图，描述你看到的植物特征
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for plant image */}
            <div className="w-full h-64 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🌿</div>
                <p className="text-gray-600">植物特征图片</p>
                <p className="text-sm text-gray-500">({family.chineseName})</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  请输入你观察到的植物特征（多个特征请用逗号分隔）：
                </label>
                <Input
                  id="answer"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="例如：5片花瓣，雄蕊多数，有托叶..."
                  className="w-full"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                />
              </div>

              {showHint && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">提示</span>
                  </div>
                  <p className="text-blue-700 text-sm">{question.hint}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  提交答案
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowHint(!showHint)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showHint ? '隐藏提示' : '显示提示'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-800">{family.chineseName} ({family.latinName})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{family.description}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">主要特征：</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {family.characteristics.map((char, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">常见植物：</h4>
                <div className="flex flex-wrap gap-1">
                  {family.commonSpecies.map((species) => (
                    <Badge key={species} variant="outline" className="text-xs">
                      {species}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;