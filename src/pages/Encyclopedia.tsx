import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { plantFamilies } from '@/data/plantData';
import { Search, ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';

const Encyclopedia = () => {
  const { familyId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');

  // If familyId is provided, show detail view
  if (familyId) {
    return <FamilyDetail familyId={familyId} />;
  }

  // Filter families based on search term
  const filteredFamilies = plantFamilies.filter(family =>
    family.chineseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.latinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.commonSpecies.some(species => 
      species.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">植物图鉴</h1>
          </div>
          <p className="text-gray-600 text-lg mb-6">
            浏览完整的植物科数据库，深入了解各种植物的特征和分类
          </p>

          {/* Search Bar */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="搜索植物科名或常见植物..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFamilies.map((family) => (
            <Card key={family.id} className="hover:shadow-lg transition-shadow duration-300 border-green-100">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-green-800 text-xl">{family.chineseName}</CardTitle>
                    <p className="text-gray-500 italic text-sm">{family.latinName}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {family.commonSpecies.length} 种
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                  {family.description}
                </p>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">主要特征：</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {family.characteristics.slice(0, 2).map((char, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-1">•</span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">常见植物：</p>
                  <div className="flex flex-wrap gap-1">
                    {family.commonSpecies.slice(0, 3).map((species) => (
                      <Badge key={species} variant="outline" className="text-xs">
                        {species}
                      </Badge>
                    ))}
                    {family.commonSpecies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{family.commonSpecies.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/encyclopedia/${family.id}`} className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      查看详情
                    </Button>
                  </Link>
                  <Link to={`/quiz/${family.id}`}>
                    <Button variant="outline" size="sm">
                      问答
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFamilies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">未找到相关结果</h3>
            <p className="text-gray-500">
              请尝试使用其他关键词搜索
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const FamilyDetail = ({ familyId }: { familyId: string }) => {
  const family = plantFamilies.find(f => f.id === familyId);

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">未找到该植物科</h2>
            <p className="text-gray-600 mb-4">请检查链接是否正确</p>
            <Link to="/encyclopedia">
              <Button>返回图鉴列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/encyclopedia" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回图鉴列表
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{family.chineseName}</h1>
              <p className="text-gray-500 italic text-lg">{family.latinName}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-3 py-1">
              {family.commonSpecies.length} 种植物
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Main Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">科属简介</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{family.description}</p>
            </CardContent>
          </Card>

          {/* Images Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">植物图片</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌿</div>
                    <p className="text-gray-600 text-sm">{family.chineseName}代表植物</p>
                  </div>
                </div>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🌸</div>
                    <p className="text-gray-600 text-sm">花部特征</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Characteristics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">主要特征</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {family.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{char}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Common Species */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">常见植物</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {family.commonSpecies.map((species) => (
                  <div key={species} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🌱</div>
                    <p className="text-sm font-medium text-gray-800">{species}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trait Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">特征详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">生长习性</h4>
                  <div className="flex flex-wrap gap-2">
                    {family.traits.growth.map((trait) => (
                      <Badge key={trait} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">叶部特征</h4>
                  <div className="flex flex-wrap gap-2">
                    {family.traits.leaf.map((trait) => (
                      <Badge key={trait} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">花部特征</h4>
                  <div className="flex flex-wrap gap-2">
                    {family.traits.flower.map((trait) => (
                      <Badge key={trait} variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">果实特征</h4>
                  <div className="flex flex-wrap gap-2">
                    {family.traits.fruit.map((trait) => (
                      <Badge key={trait} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/quiz/${family.id}`}>
              <Button className="bg-green-600 hover:bg-green-700">
                📚 开始问答挑战
              </Button>
            </Link>
            <Link to="/identify">
              <Button variant="outline">
                🔍 使用植物鉴定
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Encyclopedia;