import { useState, useMemo } from 'react'; // useMemo restored
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Added Accordion
import { plantFamilies, quizQuestions, plantTraits } from '@/data/plantData'; // Restored plantTraits import
import { Search, RotateCcw, ExternalLink, Filter, Eraser } from 'lucide-react'; // Filter is still used in input card title

interface IdentificationResultItem { // Renamed and expanded
  familyId: string;
  name?: string;
  latinName?: string;
  description?: string;
  matchedCount: number; // Specifically for keyword matches
  matchedKeywords?: string[]; // To store the actual matched keywords
  matchedByKeyword: boolean;
  matchedByTraits: boolean;
  // selectedTraitNames?: string[]; // Optional: If we want to show which traits matched
}

const PlantIdentifier = () => {
  const [userKeywordsInput, setUserKeywordsInput] = useState('');
  const [identificationResults, setIdentificationResults] = useState<IdentificationResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]); // Restored

  // const [traitSearchTerm, setTraitSearchTerm] = useState(''); // Remains Removed
  // const [customTraitInput, setCustomTraitInput] = useState(''); // Remains Removed

  const parseKeywordsString = (keywordsString: string): string[] => {
    return keywordsString
      .split(/[，,]/) // Split by Chinese or English comma
      .map(keyword => keyword.trim().toLowerCase())
      .filter(keyword => keyword !== '');
  };

  // Helper function (can be moved to a utils file if used elsewhere often)
  const areCharSetsEqual = (str1: string, str2: string): boolean => {
    if (str1.length !== str2.length) {
      return false;
    }
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    if (set1.size !== set2.size) {
      return false;
    }
    for (const char of set1) {
      if (!set2.has(char)) {
        return false;
      }
    }
    return true;
  };

  // This will be the new combined handler
  const handleSearchAndFilter = (
    // Optional parameters to allow direct passing of next state from handlers
    keywordQueryOverride?: string,
    selectedTraitsOverride?: string[]
  ) => {
    setIsLoading(true);
    setSearchPerformed(true);
    setIdentificationResults([]); // Clear previous results

    const currentKeywordsString = typeof keywordQueryOverride === 'string' ? keywordQueryOverride : userKeywordsInput;
    const currentSelectedTraits = selectedTraitsOverride !== undefined ? selectedTraitsOverride : selectedTraits;

    const userKeywords = parseKeywordsString(currentKeywordsString);

    // --- Perform Keyword Search ---
    let keywordMatchedFamiliesData: IdentificationResultItem[] = [];
    if (userKeywords.length > 0) {
      const keywordResultsMap = new Map<string, IdentificationResultItem>();

      quizQuestions.forEach(questionEntry => {
        const familyId = questionEntry.familyId;
        const standardKeywords = (questionEntry.acceptableKeywords || []).map(kw => kw.toLowerCase());
        if (standardKeywords.length === 0) return;

        const matchedStandardKeywordsForThisFamily = new Set<string>();
        userKeywords.forEach(uKeyword => {
          if (!uKeyword) return;
          standardKeywords.forEach(sKeyword => {
            if (!sKeyword) return;
            if (sKeyword.includes(uKeyword) || uKeyword.includes(sKeyword) || areCharSetsEqual(uKeyword, sKeyword)) {
              matchedStandardKeywordsForThisFamily.add(sKeyword);
            }
          });
        });

        if (matchedStandardKeywordsForThisFamily.size > 0) {
          const familyInfo = plantFamilies.find(pf => pf.id === familyId);
          keywordResultsMap.set(familyId, {
            familyId: familyId,
            name: familyInfo?.chineseName,
            latinName: familyInfo?.latinName,
            description: familyInfo?.description,
            matchedCount: matchedStandardKeywordsForThisFamily.size,
            matchedKeywords: Array.from(matchedStandardKeywordsForThisFamily), // Store matched keywords
            matchedByKeyword: true, // Explicitly set
            matchedByTraits: false, // Initialize
          });
        }
      });
      keywordMatchedFamiliesData = Array.from(keywordResultsMap.values());
      // Sorting of keywordMatchedFamiliesData itself is not strictly needed here as finalResults will be sorted
    }

    // --- Perform Trait Button Filtering ---
    const familiesMatchingTraits = getFamiliesByTraitSelection; // This is PlantFamily[]

    // --- Combine Results (OR logic) ---
    const combinedResultsMap = new Map<string, IdentificationResultItem>();

    // Process keyword matches
    keywordMatchedFamiliesData.forEach(kmFamily => {
      combinedResultsMap.set(kmFamily.familyId, kmFamily); // kmFamily already has matchedByKeyword: true, matchedByTraits: false
    });

    // Process trait matches
    if (selectedTraits.length > 0) {
        familiesMatchingTraits.forEach(tmFamily => { // tmFamily is of type PlantFamily
            const existingEntry = combinedResultsMap.get(tmFamily.id);
            if (existingEntry) {
                existingEntry.matchedByTraits = true;
            } else {
                combinedResultsMap.set(tmFamily.id, {
                    familyId: tmFamily.id,
                    name: tmFamily.chineseName,
                    latinName: tmFamily.latinName,
                    description: tmFamily.description,
                    matchedCount: 0, // Keyword match count is 0 for trait-only matches
                    matchedByKeyword: false,
                    matchedByTraits: true,
                });
            }
        });
    }

    let finalResults = Array.from(combinedResultsMap.values());

    // Simplified Sorting Logic:
    // 1. Primary: Matched by keywords (true before false)
    // 2. Secondary: Keyword match count (descending) - only relevant if matchedByKeyword is true
    // 3. Tertiary: Matched by traits (true before false) - for tie-breaking or for trait-only results
    // 4. Quaternary: Alphabetical by name
    finalResults.sort((a, b) => {
      if (a.matchedByKeyword && !b.matchedByKeyword) return -1;
      if (!a.matchedByKeyword && b.matchedByKeyword) return 1;

      if (a.matchedByKeyword && b.matchedByKeyword) { // Both matched by keyword, sort by count
        if (b.matchedCount !== a.matchedCount) {
          return b.matchedCount - a.matchedCount;
        }
        // If keyword counts are same, prefer one that also matches traits
        if (a.matchedByTraits && !b.matchedByTraits) return -1;
        if (!a.matchedByTraits && b.matchedByTraits) return 1;
      }

      // If neither or only one matched by keyword (and they are thus "equal" on that primary criterion),
      // or if keyword-matched items have same count & trait status,
      // then consider trait matching for non-keyword items or further tie-breaking
      if (!a.matchedByKeyword && !b.matchedByKeyword) { // Both are trait-only or neither
          if (a.matchedByTraits && !b.matchedByTraits) return -1;
          if (!a.matchedByTraits && b.matchedByTraits) return 1;
      }

      return (a.name || a.familyId).localeCompare(b.name || b.familyId);
    });

    if (userKeywords.length === 0 && selectedTraits.length === 0) {
      setSearchPerformed(false);
      setIdentificationResults([]);
    } else {
      setIdentificationResults(finalResults);
    }

    setIsLoading(false);
  };

  // Removed handleIdentify_OLD function


  // Restore traitsByCategory
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

  // Restored trait-based filtering logic
  const getFamiliesByTraitSelection = useMemo(() => {
    if (selectedTraits.length === 0) {
      // If no traits selected, it doesn't contribute to filtering here.
      // The combined logic will handle if it should return all or none.
      // For now, returning all, assuming it might be OR'd with keyword results.
      // Or, more accurately for an independent filter, return an empty array if it's meant to be a filter pass.
      // Let's return plantFamilies for now, and the combiner function will decide.
      // Decision: If this function is called, it means trait filtering is active.
      // If selectedTraits is empty, it implies no *trait-based* filtering is applied from this method's perspective.
      // The combined handler will decide what this means.
      // For this function's standalone purpose, if no traits are selected, no families are filtered *by traits*.
      // So, if it's part of an OR, it provides no results. If part of AND, it doesn't restrict.
      // Let's design it to return only families that match ALL selected traits.
      // If selectedTraits is empty, it means "all families match this (empty) set of trait criteria".
      // This was the original behavior of filteredFamilies.
      return plantFamilies;
    }
    return plantFamilies.filter(family => {
      const familyTraitNames = [ // Get all trait names for the current family
        ...(family.traits.growth || []),
        ...(family.traits.leaf || []),
        ...(family.traits.flower || []),
        ...(family.traits.fruit || [])
      ];
      return selectedTraits.every(selectedTraitId => {
        const traitObj = plantTraits.find(t => t.id === selectedTraitId);
        return traitObj && familyTraitNames.includes(traitObj.name);
      });
    });
  }, [selectedTraits, plantFamilies, plantTraits]); // Added dependencies

  // Restore toggleTrait and resetFilters
  const toggleTrait = (traitId: string) => {
    const newSelectedTraits = selectedTraits.includes(traitId)
      ? selectedTraits.filter(id => id !== traitId)
      : [...selectedTraits, traitId];
    setSelectedTraits(newSelectedTraits);
    handleSearchAndFilter(userKeywordsInput, newSelectedTraits);
  };

  const resetFilters = () => {
    setSelectedTraits([]);
    handleSearchAndFilter(userKeywordsInput, []); // Pass empty array for traits
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">植物鉴定</h1>
          </div>
          <p className="text-gray-600 text-lg">
            通过选择观察到的植物特征，我们帮你找到可能的植物科属
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Filters (Desktop) / Top Section (Mobile) */}
          <div className="lg:col-span-1 space-y-6"> {/* Added space-y-6 for spacing */}
            <Card className="sticky top-24"> {/* Keyword Input Card */}
              <CardHeader>
                <CardTitle className="flex items-center">
                  {/* Using Search icon from header, or a new one like Bot / Sparkles for AI features */}
                  <Search className="h-5 w-5 mr-2 text-green-600" />
                  特征关键词输入
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder="例如: 草本, 叶对生, 白花..."
                  value={userKeywordsInput}
                  onChange={(e) => setUserKeywordsInput(e.target.value)}
                  className="h-12 text-base"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleSearchAndFilter()} // Call without overrides to use current state
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={userKeywordsInput.trim() === '' || isLoading}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    关键词鉴定
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setUserKeywordsInput('')}
                    disabled={userKeywordsInput.trim() === ''}
                  >
                    <Eraser className="h-4 w-4 mr-2" />
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="trait-filter">
                <AccordionTrigger>
                  <div className="flex items-center text-base font-medium"> {/* Matched CardTitle styling */}
                    <Filter className="h-5 w-5 mr-2 text-green-600" />
                    按特征筛选 (可选)
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {/* Restored Trait Selection Card Content */}
                  {/* Note: CardHeader is effectively replaced by AccordionTrigger, Card itself is replaced by AccordionItem/Content */}
                  <div className="pt-4"> {/* Add some padding that CardHeader would have given */}
                    {selectedTraits.length > 0 && (
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-500">
                          已选择 {selectedTraits.length} 个特征
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters} // This will also call handleSearchAndFilter later
                          className="text-red-600 hover:text-red-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          重置特征
                        </Button>
                      </div>
                    )}
                    <div className="space-y-6 max-h-80 overflow-y-auto"> {/* Adjusted max-h */}
                      {Object.entries(traitsByCategory).map(([category, traits]) => (
                        <div key={category}>
                          <h3 className="font-medium text-gray-800 mb-3 flex items-center sticky top-0 bg-gray-50 z-10 py-2"> {/* Ensure bg matches accordion content bg */}
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                            {category}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {traits.map(trait => (
                              <Button
                                key={trait.id}
                                variant={selectedTraits.includes(trait.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleTrait(trait.id)} // This will also call handleSearchAndFilter later
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

          {/* Right Content - Results */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-green-800">鉴定结果</CardTitle>
                  {searchPerformed && !isLoading && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      找到 {identificationResults.length} 个可能的科
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <RotateCcw className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700">正在鉴定中...</p>
                  </div>
                ) : !searchPerformed ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💡</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">请输入特征进行鉴定</h3>
                    <p className="text-gray-500 mb-4">
                      在左侧输入框中输入观察到的植物特征，用逗号分隔。
                    </p>
                  </div>
                ) : identificationResults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤷</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">未找到匹配结果</h3>
                    <p className="text-gray-500 mb-4">
                      请尝试调整或减少关键词，或确保关键词准确。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {identificationResults.map((familyResult, index) => (
                      <div key={familyResult.familyId}>
                        <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🌿</span> {/* Placeholder icon */}
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
                              <div className="flex flex-col items-end space-y-1">
                                {familyResult.matchedByKeyword && (
                                  <>
                                    <Badge variant="default" className="bg-blue-500 text-white text-xs">
                                      关键词匹配: {familyResult.matchedCount}
                                    </Badge>
                                    {familyResult.matchedKeywords && familyResult.matchedKeywords.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {familyResult.matchedKeywords.map(keyword => (
                                          <Badge key={keyword} variant="outline" className="text-xs text-blue-700 border-blue-300">
                                            {keyword}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                                {familyResult.matchedByTraits && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    特征匹配
                                  </Badge>
                                )}
                              </div>
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
                        {index < identificationResults.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">使用提示</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 在上方的输入框中输入观察到的植物特征，用逗号分隔（中英文皆可）。</li>
                      <li>• 例如：草本, 叶对生, 花冠唇形, 茎四棱</li>
                      <li>• 特征词越准确、越多，鉴定结果可能越精确。</li>
                      <li>• 点击结果中的"查看详情"可跳转到植物图鉴页面。</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantIdentifier;