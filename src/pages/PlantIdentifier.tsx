import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { plantFamilies, plantTraits } from '@/data/plantData';
import { semanticSearch, semanticSearchBatch, preloadAI } from '@/lib/ai';
import { Bot, Search, RotateCcw, ExternalLink, Filter, Eraser, Sparkles, Loader2 } from 'lucide-react';
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
      setLoadingMessage('正在初始化 AI 引擎...');

      // Call preload with progress callback
      await preloadAI((prog, msg) => {
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
        if (avgScore > 0.3) {
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

      setProgress(100);
      // Small delay to show 100% completion
      setTimeout(() => {
        setAiResults(finalResults);
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Bot className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">AI植物鉴定</h1>
          </div>
          <p className="text-gray-600 text-lg">
            请用自然语言描述您观察到的植物特征，AI将为您分析最可能的科属。
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-green-600" />
                  AI智能分析输入
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="例如：茎是四方形的，叶子在茎上成对生长，花冠像嘴唇..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="h-32 text-base"
                  disabled={isLoading}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAiSearch}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!userQuery.trim() || isLoading}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    AI鉴定
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetAll}
                    disabled={!userQuery.trim() && selectedTraits.length === 0}
                  >
                    <Eraser className="h-4 w-4 mr-2" />
                    重置
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="trait-filter">
                <AccordionTrigger>
                  <div className="flex items-center text-base font-medium">
                    <Filter className="h-5 w-5 mr-2 text-green-600" />
                    按特征精确筛选 (可选)
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4">
                    {selectedTraits.length > 0 && (
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-500">
                          已选择 {selectedTraits.length} 个特征
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="text-red-600 hover:text-red-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          重置特征
                        </Button>
                      </div>
                    )}
                    <div className="space-y-6 max-h-80 overflow-y-auto">
                      {Object.entries(traitsByCategory).map(([category, traits]) => (
                        <div key={category}>
                          <h3 className="font-medium text-gray-800 mb-3 flex items-center sticky top-0 bg-white z-10 py-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                            {category}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {traits.map(trait => (
                              <Button
                                key={trait.id}
                                variant={selectedTraits.includes(trait.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleTrait(trait.id)}
                                className={`text-xs transition-all duration-200 ${
                                  selectedTraits.includes(trait.id)
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "hover:bg-green-50 hover:border-green-300"
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
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-lg sm:text-xl text-green-800">鉴定结果</CardTitle>
                  {searchPerformed && !isLoading && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
                      找到 {filteredResults.length} 个可能的科
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in duration-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl animate-pulse opacity-60"></div>
                      <div className="relative bg-white p-6 rounded-full shadow-lg border-2 border-green-100">
                        <Bot className="h-16 w-16 text-green-600 animate-bounce" />
                        <div className="absolute -top-1 -right-1">
                          <Loader2 className="h-6 w-6 text-green-400 animate-spin" />
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-md space-y-4 px-2 sm:px-0">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-1 gap-2">
                        <div className="space-y-1 min-w-0">
                          <p className="text-base sm:text-lg font-semibold text-green-800 flex items-start sm:items-center">
                            <Sparkles className="h-4 w-4 mr-2 mt-1 sm:mt-0 animate-pulse shrink-0" />
                            <span className="break-words">{loadingMessage}</span>
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400">正在通过深度学习分析植物形态特征...</p>
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-green-600 tabular-nums self-end sm:self-auto">{Math.round(progress)}%</span>
                      </div>

                      <div className="relative pt-1">
                        <Progress value={progress} className="h-3 w-full bg-green-50 shadow-inner" />
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-full">
                           <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer -translate-x-full"></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className={`h-1 rounded-full transition-colors duration-500 ${progress > 20 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-1 rounded-full transition-colors duration-500 ${progress > 50 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                        <div className={`h-1 rounded-full transition-colors duration-500 ${progress > 80 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 italic animate-pulse">
                      提示：描述越详细（如叶形、花色、茎的形状），鉴定越准确。
                    </p>
                  </div>
                ) : errorMessage ? (
                  <div className="text-center py-12 text-red-600">
                    <div className="text-6xl mb-4">☹️</div>
                    <h3 className="text-lg font-medium text-red-700 mb-2">发生错误</h3>
                    <p className="text-red-500 mb-4">
                      {errorMessage}
                    </p>
                  </div>
                ) : !searchPerformed ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌿</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">准备开始智能鉴定</h3>
                    <p className="text-gray-500 mb-4">
                      在左侧输入框中描述您观察到的植物特征，然后点击“AI鉴定”。
                    </p>
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤷</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">未找到匹配结果</h3>
                    <p className="text-gray-500 mb-4">
                      请尝试用不同的方式描述特征，或减少精确筛选的条件。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResults.map((familyResult, index) => (
                      <div key={familyResult.familyId}>
                        <Link
                          to={`/encyclopedia/families/${familyResult.familyId}`}
                          className="block group"
                        >
                          <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-green-50/50 transition-all duration-300 border border-transparent hover:border-green-100 hover:shadow-sm">
                            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                              <span className="text-xl sm:text-2xl font-bold text-green-600 group-hover:text-green-700">{(familyResult.aiScore * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2 sm:mb-1">
                                <div className="min-w-0">
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words group-hover:text-green-700 transition-colors">
                                    {familyResult.name || familyResult.familyId}
                                  </h3>
                                  {familyResult.latinName && (
                                    <p className="text-xs sm:text-sm text-gray-500 italic break-words">
                                      {familyResult.latinName}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="default" className="bg-blue-500 text-white text-[10px] sm:text-xs w-fit shrink-0">
                                  AI匹配特征: {familyResult.matchingTrait}
                                </Badge>
                              </div>
                               {familyResult.description && (
                                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                                  {familyResult.description}
                                </p>
                              )}
                              <div className="inline-flex items-center text-xs sm:text-sm font-medium text-green-600 mt-2 py-1.5 px-3 rounded-md border border-green-200 bg-white group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all duration-200">
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                查看图鉴详情
                              </div>
                            </div>
                          </div>
                        </Link>
                        {index < filteredResults.length - 1 && <Separator className="my-2" />}
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