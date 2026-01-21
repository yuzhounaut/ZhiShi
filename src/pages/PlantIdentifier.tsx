import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { plantFamilies, plantTraits } from '@/data/plantData';
import { semanticSearch } from '@/lib/ai';
import { Bot, Search, RotateCcw, ExternalLink, Filter, Eraser, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('正在鉴定中...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create a flat list of all trait segments from the identification module
  const traitCorpus = useMemo<TraitCorpusItem[]>(() => {
    return plantFamilies.flatMap(family => {
      const segments = family.identificationModule.split(/[。；,，]/).map(s => s.trim()).filter(Boolean);
      return segments.map(trait => ({
        familyId: family.id,
        trait: trait,
      }));
    });
  }, []);

  const handleAiSearch = async () => {
    if (!userQuery.trim()) return;

    setIsLoading(true);
    setSearchPerformed(true);
    setAiResults([]);
    setErrorMessage(null);

    try {
      setLoadingMessage('正在唤醒AI模型，首次启动可能需要一点时间...');

      const corpusTexts = traitCorpus.map(item => item.trait);
      const searchResults = await semanticSearch(userQuery, corpusTexts);

      setLoadingMessage('正在分析特征...');

      // A map to store the best result for each family
      const bestResultsMap = new Map<string, AIIdentificationResultItem>();

      for (const result of searchResults) {
        if (result.score < 0.3) continue;

        const corpusItem = traitCorpus[result.corpus_id];
        const familyId = corpusItem.familyId;

        if (!bestResultsMap.has(familyId) || result.score > bestResultsMap.get(familyId)!.aiScore) {
          const familyInfo = plantFamilies.find(pf => pf.id === familyId);
          bestResultsMap.set(familyId, {
            familyId: familyId,
            name: familyInfo?.chineseName,
            latinName: familyInfo?.latinName,
            description: familyInfo?.memoryModule,
            aiScore: result.score,
            matchingTrait: result.text,
          });
        }
      }

      const finalResults = Array.from(bestResultsMap.values());
      finalResults.sort((a, b) => b.aiScore - a.aiScore);

      setAiResults(finalResults);
    } catch (error) {
      console.error("AI Search Failed:", error);
      setErrorMessage("AI模型加载或分析失败。请检查模型文件是否正确放置在public目录下，或刷新页面重试。");
    } finally {
      setIsLoading(false);
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-green-800">鉴定结果</CardTitle>
                  {searchPerformed && !isLoading && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      找到 {filteredResults.length} 个可能的科
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <Bot className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700">{loadingMessage}</p>
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
                        <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-green-600">{(familyResult.aiScore * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {familyResult.name || familyResult.familyId}
                                </h3>
                                {familyResult.latinName && (
                                  <p className="text-sm text-gray-500 italic">
                                    {familyResult.latinName}
                                  </p>
                                )}
                              </div>
                              <Badge variant="default" className="bg-blue-500 text-white text-xs whitespace-nowrap">
                                AI匹配特征: {familyResult.matchingTrait}
                              </Badge>
                            </div>
                             {familyResult.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {familyResult.description}
                              </p>
                            )}
                            <Link to={`/encyclopedia/${familyResult.familyId}`}>
                              <Button size="sm" variant="outline" className="mt-2">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                查看图鉴详情
                              </Button>
                            </Link>
                          </div>
                        </div>
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