import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { plantFamilies } from '@/data/plantData';
import { Search, ArrowLeft, BookOpen, ExternalLink, GraduationCap, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-background text-foreground py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center justify-center md:justify-start mb-2">
                 <BookOpen className="h-8 w-8 text-primary mr-3" />
                 <h1 className="text-4xl font-serif font-bold text-foreground">科特征知识库</h1>
              </div>
              <p className="text-muted-foreground text-lg ml-1">
                浏览完整的植物科数据库，深入了解分类特征
              </p>
            </div>

             {/* Search Bar */}
            <div className="w-full md:max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="搜索科名、拉丁名或特征..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-card border-border focus:border-primary/50 text-foreground shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredFamilies.map((family) => (
            <Card key={family.id} className="hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/30 bg-card group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-serif text-foreground group-hover:text-primary transition-colors">
                        {family.chineseName}
                    </CardTitle>
                    <p className="text-muted-foreground italic text-sm font-mono mt-1">{family.latinName}</p>
                  </div>
                  <Badge variant="secondary" className="bg-secondary text-primary hover:bg-secondary/80">
                    {family.sourceType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed line-clamp-3 h-16">
                  {family.memoryModule}
                </p>

                <div className="flex gap-3">
                  <Link to={`/encyclopedia/families/${family.id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary group-hover:border-primary/40" size="sm">
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      详情
                    </Button>
                  </Link>
                  <Link to={`/quiz/${family.id}`}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" size="sm">
                      <GraduationCap className="h-3.5 w-3.5 mr-2" />
                      练习
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFamilies.length === 0 && (
          <div className="text-center py-16 bg-card/30 rounded-lg border border-dashed border-border">
            <div className="text-6xl mb-4 grayscale opacity-50">🌿</div>
            <h3 className="text-xl font-serif text-foreground mb-2">未找到相关结果</h3>
            <p className="text-muted-foreground">
              请尝试更换关键词，或浏览下方完整列表
            </p>
          </div>
        )}

        {/* Note Footer */}
        <div className="mt-8 p-8 bg-card rounded-xl border border-border shadow-sm text-sm text-muted-foreground leading-relaxed max-w-4xl mx-auto">
          <p className="font-bold text-foreground mb-4 text-base font-serif">被子植物科筛选依据说明：</p>
          <ol className="list-decimal list-inside space-y-3 marker:text-primary/70">
            <li>药典药材数量2及以上的科68个，药材数量1来源物种2及以上的科11个，药材数量1来源物种1较常见科20个，计99科；</li>
            <li>地方特色科筛选9个；</li>
            <li>新拆科6个（睡莲科拆出莲科，木兰科拆出五味子科，百合科拆出藜芦科、菝葜科、天门冬科，毛茛科拆出芍药科）；</li>
            <li>合并科扣去9个（紫金牛科并入报春花科，藜科并入苋科，浮萍科并入天南星科，七叶树科并入无患子科，木棉科并入锦葵科，鹿蹄草科并入杜鹃花科，败酱科/川续断科并入忍冬科，萝藦科并入夹竹桃科，石榴科并入千屈菜科但该科仅石榴1种药材故科数不减）；</li>
          </ol>
          <p className="mt-4 font-bold text-primary text-right">共计105科</p>
        </div>
      </div>
    </div>
  );
};

const FamilyDetail = ({ familyId }: { familyId: string }) => {
  const family = plantFamilies.find(f => f.id === familyId);

  if (!family) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto border-none shadow-xl">
          <CardContent className="p-10 text-center">
            <h2 className="text-2xl font-serif font-bold mb-4 text-foreground">未找到该植物科</h2>
            <p className="text-muted-foreground mb-8">请检查链接是否正确</p>
            <Link to="/encyclopedia/families">
              <Button className="w-full">返回列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <Link to="/encyclopedia/families" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回知识库列表
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2 tracking-tight">{family.chineseName}</h1>
              <p className="text-muted-foreground italic text-xl font-mono">{family.latinName}</p>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-base px-4 py-1.5 self-start md:self-center">
              {family.sourceType}
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Main Description */}
          <Card className="border-none shadow-md bg-card overflow-hidden">
            <div className="h-1 bg-primary w-full" />
            <CardHeader>
              <CardTitle className="text-xl font-serif text-primary flex items-center">
                 <BookOpen className="h-5 w-5 mr-2" />
                 科特征记忆模块
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 leading-loose text-lg whitespace-pre-wrap pl-1">{family.memoryModule}</p>
            </CardContent>
          </Card>

          {/* AI Identification Module */}
          <Card className="border-none shadow-sm bg-card/50">
             <CardHeader>
              <CardTitle className="text-lg font-serif text-foreground/80 flex items-center">
                 <Search className="h-5 w-5 mr-2" />
                 未知科检索模块 (AI 识别参考)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background rounded-lg p-6 border border-border">
                <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
                    {family.identificationModule.split(/[。；]/).filter(s => s.trim()).map((trait, idx) => (
                    <li key={idx} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {trait.trim()}
                    </li>
                    ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Trait Details (Parsed) */}
          <Card className="border-none shadow-md bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-primary">结构化特征详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(family.traits || {}).map(([category, traits]) => (
                  (traits as string[]).length > 0 && (
                    <div key={category} className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <h4 className="font-medium text-foreground mb-4 pb-2 border-b border-border/50 capitalize flex items-center">
                        {category === 'growth' ? '🌱 生长习性' :
                         category === 'root' ? '🫚 根部特征' :
                         category === 'stem' ? '🎋 茎部特征' :
                         category === 'leaf' ? '🍃 叶部特征' :
                         category === 'flower' ? '🌸 花部特征' :
                         category === 'fruit' ? '🍎 果实特征' : category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(traits as string[]).map((trait) => (
                          <Badge key={trait} variant="secondary" className="bg-secondary/50 text-foreground border-transparent hover:bg-secondary">
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
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link to={`/quiz/${family.id}`}>
              <Button size="lg" className="w-full sm:w-auto min-w-[200px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                <GraduationCap className="h-5 w-5 mr-2" />
                开始问答挑战
              </Button>
            </Link>
            <Link to="/identifier">
              <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px] border-primary text-primary hover:bg-primary/5">
                <Search className="h-5 w-5 mr-2" />
                使用智能鉴定
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Encyclopedia;
