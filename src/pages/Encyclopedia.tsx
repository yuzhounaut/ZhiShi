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
    family.memoryModule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.identificationModule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.sourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.id.toLowerCase().includes(searchTerm.toLowerCase())
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
                placeholder="搜索植物科名或特征关键词..."
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
                    {family.sourceType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-4">
                  {family.memoryModule}
                </p>

                <div className="flex gap-2">
                  <Link to={`/encyclopedia/families/${family.id}`} className="flex-1">
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

        {/* Note Footer */}
        <div className="mt-16 p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600 leading-relaxed">
          <p className="font-semibold mb-2 text-gray-800">被子植物科筛选依据：</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>药典药材数量2及以上的科68个，药材数量1来源物种2及以上的科11个，药材数量1来源物种1较常见科20个，计99科；</li>
            <li>地方特色科筛选9个；</li>
            <li>新拆科6个（睡莲科拆出莲科，木兰科拆出五味子科，百合科拆出藜芦科、菝葜科、天门冬科，毛茛科拆出芍药科）；</li>
            <li>合并科扣去9个（紫金牛科并入报春花科，藜科并入苋科，浮萍科并入天南星科，七叶树科并入无患子科，木棉科并入锦葵科，鹿蹄草科并入杜鹃花科，败酱科/川续断科并入忍冬科，萝藦科并入夹竹桃科，石榴科并入千屈菜科但该科仅石榴1种药材故科数不减）；</li>
          </ol>
          <p className="mt-2 font-medium">共计105科。</p>
        </div>
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
            <Link to="/encyclopedia/families">
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
          <Link to="/encyclopedia/families" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回图鉴列表
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{family.chineseName}</h1>
              <p className="text-gray-500 italic text-lg">{family.latinName}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-3 py-1">
              {family.sourceType}
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Main Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">科特征记忆模块</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{family.memoryModule}</p>
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

          {/* AI Identification Module */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">未知科检索模块 (AI 识别参考)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-700 italic">
                {family.identificationModule.split(/[。；]/).filter(s => s.trim()).map((trait, idx) => (
                  <li key={idx}>{trait.trim()}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Trait Details (Parsed) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">结构化特征详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                {Object.entries(family.traits || {}).map(([category, traits]) => (
                  (traits as string[]).length > 0 && (
                    <div key={category}>
                      <h4 className="font-medium text-gray-800 mb-3 capitalize">
                        {category === 'growth' ? '生长习性' :
                         category === 'root' ? '根部特征' :
                         category === 'stem' ? '茎部特征' :
                         category === 'leaf' ? '叶部特征' :
                         category === 'flower' ? '花部特征' :
                         category === 'fruit' ? '果实特征' : category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(traits as string[]).map((trait) => (
                          <Badge key={trait} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                ))}
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