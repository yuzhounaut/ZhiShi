import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { plantFamilies, plantTraits } from '@/data/plantData';
import { Search, RotateCcw, ExternalLink, Filter, Plus } from 'lucide-react';

const PlantIdentifier = () => {
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [traitSearchTerm, setTraitSearchTerm] = useState('');
  const [customTraitInput, setCustomTraitInput] = useState('');

  // Group traits by category
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

  // Filter families based on selected traits
  const filteredFamilies = useMemo(() => {
    if (selectedTraits.length === 0) {
      return plantFamilies;
    }

    return plantFamilies.filter(family => {
      const familyTraits = [
        ...family.traits.growth,
        ...family.traits.leaf,
        ...family.traits.flower,
        ...family.traits.fruit
      ];

      return selectedTraits.every(selectedTrait => {
        const trait = plantTraits.find(t => t.id === selectedTrait);
        return trait && familyTraits.includes(trait.name);
      });
    });
  }, [selectedTraits]);

  const toggleTrait = (traitId: string) => {
    setSelectedTraits(prev =>
      prev.includes(traitId)
        ? prev.filter(id => id !== traitId)
        : [...prev, traitId]
    );
  };

  const resetFilters = () => {
    setSelectedTraits([]);
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
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-green-600" />
                    特征筛选
                  </CardTitle>
                  {selectedTraits.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="text-red-600 hover:text-red-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      重置
                    </Button>
                  )}
                </div>
                {selectedTraits.length > 0 && (
                  <p className="text-sm text-gray-500">
                    已选择 {selectedTraits.length} 个特征
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(traitsByCategory).map(([category, traits]) => (
                  <div key={category}>
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center">
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
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Results */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-green-800">筛选结果</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    已找到 {filteredFamilies.length} 个匹配的科
                  </Badge>
                </div>
                {selectedTraits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-sm text-gray-600 mr-2">当前筛选条件:</span>
                    {selectedTraits.map(traitId => {
                      const trait = plantTraits.find(t => t.id === traitId);
                      return trait ? (
                        <Badge
                          key={traitId}
                          variant="secondary"
                          className="bg-green-100 text-green-800 cursor-pointer hover:bg-red-100 hover:text-red-800"
                          onClick={() => toggleTrait(traitId)}
                        >
                          {trait.name} ×
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {filteredFamilies.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">未找到匹配结果</h3>
                    <p className="text-gray-500 mb-4">
                      请尝试调整筛选条件，或减少特征选择
                    </p>
                    <Button onClick={resetFilters} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      重置筛选条件
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFamilies.map((family, index) => (
                      <div key={family.id}>
                        <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          {/* Plant Icon */}
                          <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🌿</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {family.chineseName}
                                </h3>
                                <p className="text-sm text-gray-500 italic">
                                  {family.latinName}
                                </p>
                              </div>
                              <Link to={`/encyclopedia/${family.id}`}>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  查看详情
                                </Button>
                              </Link>
                            </div>

                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {family.description}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {family.commonSpecies.slice(0, 4).map(species => (
                                <Badge key={species} variant="outline" className="text-xs">
                                  {species}
                                </Badge>
                              ))}
                              {family.commonSpecies.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{family.commonSpecies.length - 4}种
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < filteredFamilies.length - 1 && <Separator className="my-2" />}
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
                      <li>• 点击特征标签来选择或取消选择</li>
                      <li>• 选择的特征越多，结果越精确</li>
                      <li>• 点击"查看详情"可跳转到植物图鉴页面</li>
                      <li>• 使用"重置"按钮清空所有筛选条件</li>
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