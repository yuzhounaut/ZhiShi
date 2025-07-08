import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { plantFamilies } from '@/data/plantData';
import { BookOpenText } from 'lucide-react';

const QuizSelectionPage = () => {
  // For now, let's take all families. If you specifically need only 10, we can slice it.
  // const familiesToDisplay = plantFamilies.slice(0, 10);
  const familiesToDisplay = plantFamilies;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-lime-100 to-green-100 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <BookOpenText className="h-16 w-16 mx-auto text-green-700 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            知识挑战
          </h1>
          <p className="text-lg text-gray-700">
            选择一个植物科，开始您的学习之旅，测试您的植物学知识！
          </p>
        </header>

        {familiesToDisplay.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">暂无可供挑战的植物科。</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {familiesToDisplay.map((family) => (
              <Card key={family.id} className="hover:shadow-xl transition-shadow duration-300 border-yellow-200 flex flex-col bg-white">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-lime-700 text-2xl">{family.chineseName}</CardTitle>
                      <CardDescription className="text-gray-500 italic">{family.latinName}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 whitespace-nowrap">
                      {family.commonSpecies.length} 常见种
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-4">
                    {family.description}
                  </p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link to={`/quiz/${family.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      开始挑战：{family.chineseName}
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
