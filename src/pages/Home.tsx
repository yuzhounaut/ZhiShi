import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { plantFamilies } from '@/data/plantData';
import { BookOpen, Users, Award, Leaf, Search, Bot, Sparkles, BookMarked } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      {/* Hero Section - Simplified */}
      <section className="text-center mb-12">
        <div className="container mx-auto max-w-3xl">
          <Leaf className="h-20 w-20 mx-auto text-green-600 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            欢迎来到 <span className="text-green-600">植识</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            您的智能植物识别与学习助手。
          </p>
        </div>
      </section>

      {/* Core Feature: Plant Identification */}
      <section className="mb-16">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white shadow-xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center mb-3">
                <Search className="h-12 w-12 mr-3" />
                <CardTitle className="text-3xl md:text-4xl font-bold">植物智能鉴定</CardTitle>
              </div>
              <CardDescription className="text-green-100 text-center text-md">
                通过选择植物特征关键词，快速识别未知植物。
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="secondary" className="bg-green-700 text-white text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  实时搜索
                </Badge>
                <Badge variant="secondary" className="bg-green-700 text-white text-xs">
                  <Bot className="h-3 w-3 mr-1" />
                  自定义特征
                </Badge>
                <Badge variant="secondary" className="bg-green-700 text-white text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  精准识别
                </Badge>
              </div>
              <Link to="/identify">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-green-600 hover:bg-green-50 text-lg font-semibold py-3 px-8 shadow-md transition-transform hover:scale-105"
                >
                  立即开始鉴定
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Secondary Features */}
      <section className="mb-16">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">探索更多功能</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/encyclopedia" className="block">
              <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center text-green-600">
                    <BookMarked className="h-8 w-8 mr-3" />
                    <CardTitle className="text-xl">植物图鉴</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">浏览详细的植物科属信息，了解更多植物知识</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/quiz" className="block"> {/* Assuming /quiz is the main quiz page */}
              <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center text-blue-600">
                    <Award className="h-8 w-8 mr-3" />
                    <CardTitle className="text-xl">知识挑战</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">通过互动问答巩固您的植物学知识</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Original Features - Simplified and moved down */}
      <section className="py-12 px-4 bg-white rounded-lg shadow">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">植物科学习与挑战</h2>
            <p className="text-gray-600">每个科都有独特的识别特征，来测试你的植物学知识吧！</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantFamilies.slice(0, 3).map((family) => ( // Displaying only first 3 for brevity, can be more
              <Card key={family.id} className="hover:shadow-lg transition-shadow duration-300 border-green-100">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-green-800 text-lg">{family.chineseName}</CardTitle>
                      <CardDescription className="text-gray-500 italic text-sm">{family.latinName}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {family.commonSpecies.length} 种
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-3">{family.description}</p>
                  <Link to={`/quiz/${family.id}`}>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      开始挑战
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          {plantFamilies.length > 3 && (
            <div className="text-center mt-8">
              <Link to="/quiz"> {/* Link to a page that shows all families for quiz */}
                <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                  查看所有科挑战
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
