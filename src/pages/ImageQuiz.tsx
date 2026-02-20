import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { atlasItems, AtlasItem } from '@/data/atlasData';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Award, Image as ImageIcon, Type, ArrowRight } from 'lucide-react';

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
  const [options, setOptions] = useState<({ item: AtlasItem } | { noun: string })[]>([]);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-xl shadow-2xl text-center border-none bg-card overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground py-12">
            <Award className="h-20 w-20 mx-auto text-secondary mb-4" />
            <CardTitle className="text-4xl font-serif font-bold">练习完成</CardTitle>
          </CardHeader>
          <CardContent className="p-10 bg-card">
            <p className="text-6xl font-serif font-bold text-foreground my-8">
              {score} <span className="text-3xl text-muted-foreground font-light">/ {TOTAL_QUESTIONS}分</span>
            </p>
            <Progress value={(score/TOTAL_QUESTIONS)*100} className="w-3/4 mx-auto h-3 mb-12 bg-secondary" indicatorClassName="bg-primary" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={restartQuiz} className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg h-12 shadow-md">
                <RotateCcw className="mr-2 h-5 w-5" />
                重新开始
              </Button>
              <Button variant="outline" onClick={() => navigate('/quiz')} className="border-primary/30 text-primary hover:bg-primary/5 text-lg h-12">
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center mb-16 space-y-4">
             <div className="inline-block p-4 bg-primary/5 rounded-full mb-2">
                <ImageIcon className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">形态学图文练习</h1>
            <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto">使用形态名词图鉴中的高清图片进行双向专业测试</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
            <Card onClick={() => startQuiz('term-to-image')} className="hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer bg-card border-border/60 hover:-translate-y-1 group">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">名词认图</CardTitle>
                    <div className="p-3 bg-secondary/30 rounded-full group-hover:bg-secondary/50 transition-colors">
                        <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed">根据给出的形态学专业术语，在四张显微或宏观图片中选出正确的图示。</p>
                </CardContent>
            </Card>
            <Card onClick={() => startQuiz('image-to-term')} className="hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer bg-card border-border/60 hover:-translate-y-1 group">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">图片识词</CardTitle>
                     <div className="p-3 bg-secondary/30 rounded-full group-hover:bg-secondary/50 transition-colors">
                        <Type className="h-6 w-6 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed">根据给出的植物特征图片，准确识别并选择对应的形态学名词。</p>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 transition-colors duration-300 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={restartQuiz} className="text-muted-foreground hover:text-destructive px-2 -ml-2">
              <ArrowLeft className="h-5 w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline font-medium">退出练习</span>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-center text-foreground flex-grow px-2 truncate tracking-tight">
              {quizMode === 'term-to-image' ? '名词认图' : '图片识词'}
            </h1>
            <Badge variant="outline" className="text-sm bg-background border-primary/20 text-primary whitespace-nowrap py-1.5 px-3 font-mono">
              得分: {score}
            </Badge>
          </div>
          <Progress value={(questionCount / TOTAL_QUESTIONS) * 100} className="h-1.5 rounded-full bg-secondary" indicatorClassName="bg-primary" />
        </div>

        <Card className="shadow-xl bg-card border-border/50 overflow-hidden rounded-xl">
          <CardHeader className="border-b border-border/40 bg-secondary/10 py-8">
            <CardTitle className="text-center text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {quizMode === 'term-to-image' ? (
                  <span>请找出：<span className="text-primary border-b-2 border-primary/20 pb-1">{currentQuestion?.noun}</span></span>
              ) : '这是什么特征？'}
            </CardTitle>
            {quizMode === 'image-to-term' && (
              <div className="w-full max-w-2xl mx-auto aspect-video bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center mt-6 shadow-inner">
                <img
                  src={currentQuestion?.item.url}
                  alt="特征图片"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-8">
            <div className={`grid gap-6 ${quizMode === 'term-to-image' ? 'grid-cols-2 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
              {options.map((option, idx) => {
                 // Type guard helper
                 const isItemOption = (opt: typeof option): opt is { item: AtlasItem } => 'item' in opt;
                 const isNounOption = (opt: typeof option): opt is { noun: string } => 'noun' in opt;

                 if (quizMode === 'term-to-image' && isItemOption(option)) {
                    return (
                        <div
                            key={option.item.id}
                            onClick={() => handleAnswer(option.item.id)}
                            className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 group
                            ${showFeedback && option.item.id === currentQuestion?.item.id ? 'border-primary ring-4 ring-primary/20 scale-[1.02] z-10' : ''}
                            ${showFeedback && option.item.id === selectedId && !isCurrentCorrect ? 'border-destructive ring-4 ring-destructive/20 grayscale' : 'border-transparent'}
                            ${!showFeedback ? 'hover:border-primary/50 hover:shadow-lg hover:-translate-y-1' : ''}
                            bg-secondary/10
                            `}
                        >
                            <img src={option.item.url} alt="选项图片" className="w-full h-full object-cover"/>
                            {showFeedback && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                    {option.item.id === currentQuestion?.item.id && (
                                        <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                                            <CheckCircle className="h-8 w-8"/>
                                        </div>
                                    )}
                                    {option.item.id === selectedId && !isCurrentCorrect && (
                                         <div className="bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg">
                                            <XCircle className="h-8 w-8"/>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                 } else if (quizMode === 'image-to-term' && isNounOption(option)) {
                     return (
                        <Button
                            key={option.noun}
                            onClick={() => handleAnswer(option.noun)}
                            variant="outline"
                            className={`h-auto text-lg p-6 justify-center transition-all duration-300 break-words whitespace-normal border-border/60 hover:bg-secondary/20
                            ${showFeedback && option.noun === currentQuestion?.noun ? 'bg-primary hover:bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]' : ''}
                            ${showFeedback && option.noun === selectedId && !isCurrentCorrect ? 'bg-destructive/10 text-destructive border-destructive/50' : ''}
                            `}
                            disabled={showFeedback}
                        >
                            {option.noun}
                        </Button>
                     );
                 }
                 return null;
              })}
            </div>

            {showFeedback && (
              <div className="mt-10 flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 bg-secondary/10 p-6 rounded-xl border border-border/50">
                <div className="text-center">
                    <div className={`text-xl font-serif font-bold mb-2 flex items-center justify-center gap-2 ${isCurrentCorrect ? 'text-primary' : 'text-destructive'}`}>
                        {isCurrentCorrect ? <CheckCircle className="h-6 w-6"/> : <XCircle className="h-6 w-6"/>}
                        {isCurrentCorrect ? '回答正确！' : `回答错误`}
                    </div>
                    {!isCurrentCorrect && (
                         <p className="text-lg text-foreground font-medium">正确答案是：<span className="text-primary font-bold">{currentQuestion?.noun}</span></p>
                    )}
                </div>

                <div className="text-sm text-muted-foreground italic font-serif bg-background px-4 py-2 rounded-full border border-border/50 shadow-sm">
                  图源分类：{currentQuestion?.item.path.join(' > ')}
                </div>

                <Button onClick={handleNextQuestion} size="lg" className="px-10 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5">
                    {questionCount >= TOTAL_QUESTIONS ? (
                        <>查看最终得分 <ArrowRight className="ml-2 h-5 w-5" /></>
                    ) : (
                        <>下一题 <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
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
