import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { plantFamilies } from '@/data/plantData';
import { BookOpen, Users, Award, Leaf, Search, Bot, Sparkles, BookMarked } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4 transition-colors duration-300">
      {/* Hero Section */}
      <section className="text-center mb-16 space-y-6">
        <div className="container mx-auto max-w-3xl flex flex-col items-center">
          <div className="p-4 bg-primary/5 rounded-full mb-6">
            <Leaf className="h-24 w-24 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4 tracking-tight">
            欢迎来到 <span className="text-primary italic">植识</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            探索自然之美，开启您的智能植物识别与深度学习之旅。
          </p>
        </div>
      </section>

      {/* Core Feature: Plant Identification */}
      <section className="mb-20">
        <div className="container mx-auto max-w-3xl">
          <Card className="bg-card border-none shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="pb-8 pt-10 text-center">
              <div className="flex justify-center mb-6">
                 <div className="bg-primary/10 p-4 rounded-full">
                    <Search className="h-10 w-10 text-primary" />
                 </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">智能鉴定</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                基于形态特征的专业植物分类与识别系统
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-10 px-6">
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
                  实时特征分析
                </Badge>
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
                  <Bot className="h-3.5 w-3.5 mr-2 text-primary" />
                  AI 辅助识别
                </Badge>
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
                  <Users className="h-3.5 w-3.5 mr-2 text-primary" />
                  科属精准定位
                </Badge>
              </div>
              <Link to="/identifier">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px] h-14 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  立即开始鉴定
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Secondary Features */}
      <section className="mb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/encyclopedia/families" className="group block h-full">
              <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card group-hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 inline-block p-3 bg-secondary/30 rounded-lg group-hover:bg-secondary/50 transition-colors">
                    <BookMarked className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-serif text-foreground">科特征知识库</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    系统化整理植物科属特征，提供详尽的识别要点与形态描述。
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/encyclopedia/atlas" className="group block h-full">
              <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card group-hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 inline-block p-3 bg-secondary/30 rounded-lg group-hover:bg-secondary/50 transition-colors">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-serif text-foreground">形态名词图鉴</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    图文并茂的植物学术语词典，通过直观图像理解专业形态名词。
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/quiz" className="group block h-full">
              <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card group-hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 inline-block p-3 bg-secondary/30 rounded-lg group-hover:bg-secondary/50 transition-colors">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-serif text-foreground">互动问答挑战</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    通过趣味性问答测试您的植物学知识，巩固学习成果。
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Families */}
      <section className="py-16 bg-card/50 rounded-3xl mx-4 lg:mx-8 mb-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-border pb-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                热门科属概览
              </h2>
              <p className="text-muted-foreground text-lg">
                深入了解常见植物科的独特特征与分类学地位
              </p>
            </div>
            <Link to="/quiz" className="hidden md:block">
               <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  查看全部
               </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plantFamilies.slice(0, 3).map((family) => (
              <Card key={family.id} className="bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-xl font-serif text-foreground group-hover:text-primary transition-colors">
                        {family.chineseName}
                      </CardTitle>
                      <CardDescription className="text-sm font-mono italic text-muted-foreground mt-1">
                        {family.latinName}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                      {family.sourceType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-6">
                    {family.memoryModule}
                  </p>
                  <Link to={`/quiz/${family.id}`}>
                    <Button variant="secondary" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      开始学习
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/quiz">
               <Button variant="outline" className="w-full border-primary text-primary">
                  查看全部
               </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
