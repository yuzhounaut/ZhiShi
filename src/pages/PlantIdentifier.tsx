import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { plantFamilies, plantTraits } from '@/data/plantData';
import { semanticSearchBatch, initializeAIModel } from '@/lib/ai';
import { Bot, RotateCcw, ExternalLink, Filter, Eraser, Sparkles, Loader2, Leaf } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

// Data structure for our AI search corpus
interface TraitCorpusItem {
  familyId: string;
  trait: string;
}

// New result item structure for AI-powered results
interface AIIdentificationResultItem {
  familyId: string;
  name?: string;
  latinName?: string;
  description?: string;
  // AI-specific fields
  aiScore: number;
  matchingTrait: string;
}

const PlantIdentifier = () => {
  const [userQuery, setUserQuery] = useState('');
  const [aiResults, setAiResults] = useState<AIIdentificationResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('正在鉴定中...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Create a flat list of all trait segments from both identification and memory modules
  const traitCorpus = useMemo<TraitCorpusItem[]>(() => {
    return plantFamilies.flatMap(family => {
      const idSegments = family.identificationModule.split(/[。；,，]/).map(s => s.trim()).filter(Boolean);
      const memSegments = family.memoryModule.split(/[。；,，]/).map(s => s.trim()).filter(Boolean);

      // Combine both modules to provide a richer corpus for semantic matching
      const allSegments = [...new Set([...idSegments, ...memSegments])];

      return allSegments.map(trait => ({
        familyId: family.id,
        trait: trait,
      }));
    });
  }, []);

  const handleAiSearch = async () => {
    if (!userQuery.trim()) return;

    setIsLoading(true);
    setProgress(0);
    setSearchPerformed(true);
    setAiResults([]);
    setErrorMessage(null);

    // Clear simulated progress - we will use real progress from preloadAI
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    try {
      setLoadingMessage('正在准备 AI 引擎...');

      // Call initializeAIModel with progress callback (Staged loading)
      await initializeAIModel((prog, msg) => {
        setProgress(prog);
        setLoadingMessage(msg);
      });

      // Split query into segments for multi-trait matching
      const querySegments = userQuery.split(/[。；,，\n]/).map(s => s.trim()).filter(Boolean);

      if (querySegments.length === 0) {
        setIsLoading(false);
        return;
      }

      const corpusTexts = traitCorpus.map(item => item.trait);

      setLoadingMessage('正在进行语义特征比对...');
      // Start a slow simulation for the actual search part since it's hard to get progress from search
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 99) return 99;
          return prev + 0.5;
        });
      }, 200);

      // The AI will use precomputed embeddings if available, making this much faster
      const batchResults = await semanticSearchBatch(querySegments, corpusTexts);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setLoadingMessage('正在汇总分析结果...');
      setProgress(95);

      // For each family, we want to find how well it matches ALL query segments
      const familyScores = new Map<string, { totalScore: number, matches: string[] }>();

      batchResults.forEach((queryResult, qIdx) => {
        const segment = querySegments[qIdx];
        const bestScoresPerFamily = new Map<string, { score: number, text: string }>();

        queryResult.forEach(result => {
          // Exact match requirement for single-character segments
          if (segment.length <= 1 && result.text !== segment) {
            return;
          }

          const corpusItem = traitCorpus[result.corpus_id];
          const familyId = corpusItem.familyId;

          if (!bestScoresPerFamily.has(familyId) || result.score > bestScoresPerFamily.get(familyId)!.score) {
            bestScoresPerFamily.set(familyId, { score: result.score, text: result.text });
          }
        });

        bestScoresPerFamily.forEach((data, familyId) => {
          if (!familyScores.has(familyId)) {
            familyScores.set(familyId, { totalScore: 0, matches: [] });
          }
          const current = familyScores.get(familyId)!;
          current.totalScore += data.score;
          // We pick the best matching trait for each query segment to show in UI
          if (data.score > 0.6) {
             current.matches.push(data.text);
          }
        });
      });

      const finalResults: AIIdentificationResultItem[] = [];
      familyScores.forEach((data, familyId) => {
        const avgScore = data.totalScore / querySegments.length;

        // Only show results with a reasonable average matching score
        if (avgScore > 0.8) {
          const familyInfo = plantFamilies.find(pf => pf.id === familyId);
          finalResults.push({
            familyId: familyId,
            name: familyInfo?.chineseName,
            latinName: familyInfo?.latinName,
            description: familyInfo?.memoryModule,
            aiScore: avgScore,
            // Show the top matching trait from the first segment or most relevant
            matchingTrait: data.matches[0] || "综合匹配",
          });
        }
      });

      finalResults.sort((a, b) => b.aiScore - a.aiScore);
      const topResults = finalResults.slice(0, 10);

      setProgress(100);
      // Small delay to show 100% completion
      setTimeout(() => {
        setAiResults(topResults);
        setIsLoading(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }, 500);
    } catch (error) {
      console.error("AI Search Failed:", error);
      setErrorMessage("AI模型加载或分析失败。请检查模型文件是否正确放置在public目录下，或刷新页面重试。");
      setIsLoading(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  // Filtering logic based on selected structured traits
  const filteredResults = useMemo(() => {
    if (selectedTraits.length === 0) {
      return aiResults;
    }

    const selectedTraitNames = selectedTraits.map(traitId => {
        const traitObj = plantTraits.find(t => t.id === traitId);
        return traitObj?.name;
    }).filter(Boolean);


    return aiResults.filter(result => {
        const family = plantFamilies.find(f => f.id === result.familyId);
        if (!family) return false;

        const familyTraitNames = Object.values(family.traits || {}).flat();

        return selectedTraitNames.every(selectedName =>
          familyTraitNames.some(ftn => (ftn as string).includes(selectedName!) || selectedName!.includes(ftn as string))
        );
    });
  }, [aiResults, selectedTraits]);


  const traitsByCategory = useMemo(() => {
    const categories: { [key: string]: typeof plantTraits } = {};
    plantTraits.forEach(trait => {
      if (!categories[trait.category]) {
        categories[trait.category] = [];
      }
      categories[trait.category].push(trait);
    });
    return categories;
  }, []);

  const toggleTrait = (traitId: string) => {
    setSelectedTraits(prev =>
      prev.includes(traitId) ? prev.filter(id => id !== traitId) : [...prev, traitId]
    );
  };

  const resetFilters = () => {
    setSelectedTraits([]);
  };

  const resetAll = () => {
    setUserQuery('');
    setAiResults([]);
    setSelectedTraits([]);
    setSearchPerformed(false);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-500">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start mb-4">
            <div className="p-3 bg-secondary/10 rounded-full mr-4 border border-border/50">
                <Bot className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">智能鉴定</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl font-serif leading-relaxed pl-0 sm:pl-[4.5rem]">
            请用自然语言描述您观察到的植物特征（如：花瓣数量、叶片形状、生长环境），AI 将为您分析最可能的科属。
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/60 shadow-md sticky top-24">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="flex items-center text-xl font-serif text-primary">
                  <Sparkles className="h-5 w-5 mr-2 text-secondary" />
                  特征描述
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <Textarea
                  placeholder="例如：茎是四方形的，叶子在茎上成对生长，花冠像嘴唇..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="h-40 text-base resize-none bg-background/50 border-border focus:border-primary/50 focus:ring-primary/20 transition-all font-serif"
                  disabled={isLoading}
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleAiSearch}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all duration-300"
                    disabled={!userQuery.trim() || isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
                    {isLoading ? '分析中' : '开始鉴定'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetAll}
                    disabled={!userQuery.trim() && selectedTraits.length === 0}
                    className="border-border/60 text-muted-foreground hover:bg-secondary/10 hover:text-foreground"
                  >
                    <Eraser className="h-4 w-4 mr-2" />
                    重置
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full bg-card/30 rounded-lg border border-border/40 px-2">
              <AccordionItem value="trait-filter" className="border-none">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center text-base font-medium font-serif text-foreground/80">
                    <Filter className="h-4 w-4 mr-2 text-primary" />
                    按特征精确筛选 (可选)
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4">
                    {selectedTraits.length > 0 && (
                      <div className="flex justify-between items-center mb-4 px-1">
                        <p className="text-sm text-muted-foreground font-serif">
                          已选择 <span className="text-primary font-bold">{selectedTraits.length}</span> 个特征
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetFilters}
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-8"
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          清除
                        </Button>
                      </div>
                    )}
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(traitsByCategory).map(([category, traits]) => (
                        <div key={category}>
                          <h3 className="font-medium text-foreground/90 mb-3 flex items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 border-b border-border/30">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                            {category}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {traits.map(trait => (
                              <Button
                                key={trait.id}
                                variant={selectedTraits.includes(trait.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleTrait(trait.id)}
                                className={`text-xs h-7 px-2.5 rounded-full transition-all duration-200 ${
                                  selectedTraits.includes(trait.id)
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                    : "bg-transparent border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-secondary/5"
                                }`}
                              >
                                {trait.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="lg:col-span-2">
            <Card className="min-h-[500px] border-border/60 shadow-sm bg-card/40 backdrop-blur-sm">
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-xl font-serif text-primary flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-primary/70" />
                    鉴定结果
                  </CardTitle>
                  {searchPerformed && !isLoading && (
                    <Badge variant="secondary" className="bg-secondary/20 text-primary-foreground/90 border-transparent hover:bg-secondary/30 w-fit px-3 py-1 text-primary">
                      找到 {filteredResults.length} 个可能的科
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-in fade-in duration-700">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse opacity-60"></div>
                      <div className="relative bg-background p-8 rounded-full shadow-lg border border-border/50">
                        <Bot className="h-16 w-16 text-primary animate-bounce-slow" />
                        <div className="absolute -top-1 -right-1">
                          <Loader2 className="h-6 w-6 text-secondary animate-spin" />
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-md space-y-5 px-4 sm:px-0">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-1 gap-2">
                        <div className="space-y-1 min-w-0">
                          <p className="text-lg font-serif font-semibold text-primary flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 animate-pulse text-secondary shrink-0" />
                            <span className="break-words">{loadingMessage}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">正在通过深度学习分析植物形态特征...</p>
                        </div>
                        <span className="text-3xl font-serif font-bold text-secondary tabular-nums self-end sm:self-auto opacity-80">{Math.round(progress)}%</span>
                      </div>

                      <div className="relative pt-1">
                        <Progress value={progress} className="h-2 w-full bg-secondary/20" indicatorClassName='bg-primary transition-all duration-500' />
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-6 border-t border-border/30 pt-4">
                        <div className="space-y-2 flex flex-col items-center">
                          <div className={`h-2 w-2 rounded-full transition-all duration-500 ${progress >= 15 ? 'bg-primary scale-125' : 'bg-muted scale-100'}`}></div>
                          <p className={`text-[10px] text-center font-medium transition-colors ${progress >= 15 ? 'text-primary' : 'text-muted-foreground'}`}>基础数据</p>
                        </div>
                        <div className="space-y-2 flex flex-col items-center">
                          <div className={`h-2 w-2 rounded-full transition-all duration-500 ${progress >= 85 ? 'bg-primary scale-125' : 'bg-muted scale-100'}`}></div>
                          <p className={`text-[10px] text-center font-medium transition-colors ${progress >= 85 ? 'text-primary' : 'text-muted-foreground'}`}>AI 模型</p>
                        </div>
                        <div className="space-y-2 flex flex-col items-center">
                          <div className={`h-2 w-2 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-primary scale-125' : 'bg-muted scale-100'}`}></div>
                          <p className={`text-[10px] text-center font-medium transition-colors ${progress >= 100 ? 'text-primary' : 'text-muted-foreground'}`}>分析完成</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : errorMessage ? (
                  <div className="text-center py-20 text-destructive/80 animate-in zoom-in-95 duration-300">
                    <div className="text-6xl mb-6 opacity-80">☹️</div>
                    <h3 className="text-xl font-serif font-medium text-destructive mb-3">发生错误</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                      {errorMessage}
                    </p>
                  </div>
                ) : !searchPerformed ? (
                  <div className="text-center py-24 flex flex-col items-center animate-in fade-in duration-700">
                    <div className="p-6 bg-secondary/5 rounded-full mb-6 border border-secondary/20">
                        <Leaf className="h-16 w-16 text-primary/40" />
                    </div>
                    <h3 className="text-2xl font-serif font-medium text-foreground mb-3">准备开始鉴定</h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      在左侧输入框中描述您观察到的植物特征，<br/>AI 将尝试为您匹配最相似的植物科属。
                    </p>
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-20 animate-in zoom-in-95 duration-300">
                    <div className="text-6xl mb-6 opacity-70">🤷</div>
                    <h3 className="text-xl font-serif font-medium text-foreground mb-3">未找到匹配结果</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      请尝试用不同的方式描述特征，或减少精确筛选的条件。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredResults.map((familyResult, index) => (
                      <div key={familyResult.familyId} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                        <Link
                          to={`/encyclopedia/families/${familyResult.familyId}`}
                          className="block group"
                        >
                          <div className="flex items-start space-x-4 sm:space-x-6 p-5 sm:p-6 rounded-xl hover:bg-secondary/10 transition-all duration-300 border border-transparent hover:border-secondary/20 hover:shadow-md bg-card/60">
                            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-primary/5 group-hover:bg-primary/10 rounded-xl flex items-center justify-center transition-colors border border-primary/10">
                              <span className="text-xl sm:text-2xl font-serif font-bold text-primary group-hover:text-primary/80">{(familyResult.aiScore * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <div>
                                  <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors flex items-center">
                                    {familyResult.name || familyResult.familyId}
                                    <ExternalLink className="h-3.5 w-3.5 ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
                                  </h3>
                                  {familyResult.latinName && (
                                    <p className="text-sm text-muted-foreground font-serif italic">
                                      {familyResult.latinName}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 w-fit shrink-0 font-normal">
                                  匹配特征: {familyResult.matchingTrait}
                                </Badge>
                              </div>
                               {familyResult.description && (
                                <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2 font-serif opacity-80">
                                  {familyResult.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                        {index < filteredResults.length - 1 && <Separator className="my-4 opacity-50" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantIdentifier;
