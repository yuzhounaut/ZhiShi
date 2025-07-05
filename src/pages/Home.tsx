import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { plantFamilies } from '@/data/plantData';
import { BookOpen, Users, Award, Leaf } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Leaf className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              欢迎来到
              <span className="text-green-600"> 植识</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              通过互动问答学习植物知识，轻松识别身边的植物世界
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6">
              <BookOpen className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">互动学习</h3>
              <p className="text-gray-600">通过看图识特征的问答模式深入学习</p>
            </div>
            <div className="text-center p-6">
              <Users className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">开放平台</h3>
              <p className="text-gray-600">无需注册，所有功能完全免费开放</p>
            </div>
            <div className="text-center p-6">
              <Award className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">专业内容</h3>
              <p className="text-gray-600">基于专业植物学知识构建的题库</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Selection Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">选择植物科进行挑战</h2>
            <p className="text-gray-600">每个科都有独特的识别特征，来测试你的植物学知识吧！</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantFamilies.map((family) => (
              <Card key={family.id} className="hover:shadow-lg transition-shadow duration-300 border-green-100">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-green-800 text-xl">{family.chineseName}</CardTitle>
                      <CardDescription className="text-gray-500 italic">{family.latinName}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {family.commonSpecies.length} 种
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{family.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">常见植物：</p>
                    <div className="flex flex-wrap gap-1">
                      {family.commonSpecies.slice(0, 3).map((species) => (
                        <Badge key={species} variant="outline" className="text-xs">
                          {species}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Link to={`/quiz/${family.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      开始挑战
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">准备好探索植物世界了吗？</h2>
          <p className="text-xl mb-8 text-green-100">
            通过我们的互动问答和植物鉴定功能，发现植物的奥秘
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/identify">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                🔍 开始植物鉴定
              </Button>
            </Link>
            <Link to="/encyclopedia">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                📱 浏览植物图鉴
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;