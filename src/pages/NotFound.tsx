import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md space-y-8">
        <div className="inline-flex p-6 bg-secondary/10 rounded-full border border-border/50 shadow-sm animate-pulse-slow">
            <Leaf className="h-16 w-16 text-primary opacity-80" />
        </div>

        <div>
            <h1 className="text-8xl font-serif font-bold text-primary mb-2 tracking-tight">404</h1>
            <p className="text-2xl font-serif font-medium text-foreground tracking-wide">页面未找到</p>
        </div>

        <p className="text-muted-foreground leading-relaxed px-4">
          您正在寻找的植物标本可能已被移走，或者该路径不存在。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
              返回首页
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => window.history.back()} className="w-full sm:w-auto border-border/60 text-muted-foreground hover:bg-secondary/10">
            返回上一页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
