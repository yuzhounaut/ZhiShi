import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { plantFamilies } from '@/data/plantData';
import { BookOpenText, Image as ImageIcon, GraduationCap } from 'lucide-react';

const QuizSelectionPage = () => {
  const familiesToDisplay = plantFamilies;

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-16 space-y-4">
          <div className="inline-block p-4 bg-primary/5 rounded-full mb-4">
            <BookOpenText className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-2 tracking-tight">
            互动问答挑战
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            通过专业的形态学测试，巩固您的植物分类知识体系。
          </p>
        </header>

        {familiesToDisplay.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border/60">
            <p className="text-xl text-muted-foreground font-serif">暂无可供挑战的植物科。</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card for the Morphology Image Quiz */}
            <Card className="hover:shadow-xl transition-all duration-300 border-border/60 hover:border-primary/40 flex flex-col bg-card hover:-translate-y-1 group">
                 <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-primary text-2xl font-serif font-bold group-hover:text-primary/80 transition-colors">形态学模块</CardTitle>
                      <CardDescription className="text-muted-foreground font-serif italic mt-1">图文双向练习</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-secondary/30 text-primary border-primary/20 whitespace-nowrap">
                      <ImageIcon className="h-3.5 w-3.5 mr-1.5"/>
                      图鉴模式
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    通过“名词认图”和“图片识词”的双向练习，系统掌握核心形态学专业术语。
                  </p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Link to="/image-quiz">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md h-11 text-base">
                      开始图文练习
                    </Button>
                  </Link>
                </div>
            </Card>

            {familiesToDisplay.map((family) => (
              <Card key={family.id} className="hover:shadow-xl transition-all duration-300 border-border/60 hover:border-primary/40 flex flex-col bg-card hover:-translate-y-1 group">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-foreground text-2xl font-serif font-bold group-hover:text-primary transition-colors">{family.chineseName}</CardTitle>
                      <CardDescription className="text-muted-foreground font-mono italic text-sm mt-1">{family.latinName}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-secondary text-primary hover:bg-secondary/80 whitespace-nowrap">
                      {family.sourceType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed line-clamp-4">
                    {family.memoryModule}
                  </p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Link to={`/quiz/${family.id}`}>
                    <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground h-11 text-base group-hover:border-primary/60">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      开始挑战
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSelectionPage;
