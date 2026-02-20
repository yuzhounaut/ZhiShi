import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Search, BookOpen, Folder, ArrowLeft, Image as ImageIcon, ZoomIn, ExternalLink, Calendar, Maximize2 } from 'lucide-react';
import { getNodesAtPath, searchAtlas, atlasItems, AtlasItem, AtlasNode } from '@/data/atlasData';
import atlasDefinitions from '@/data/atlasDefinitions.json';

const Atlas = () => {
  const params = useParams();
  const itemId = params['itemId'];

  if (itemId) {
    return <AtlasItemDetail itemId={itemId} />;
  }

  return <AtlasGrid />;
};

const AtlasGrid = () => {
  const params = useParams();
  const navigate = useNavigate();
  const splat = params['*'] || '';

  const currentPath = useMemo(() =>
    splat ? splat.split('/').filter(Boolean).map(decodeURIComponent) : [],
    [splat]
  );

  const [searchTerm, setSearchTerm] = useState('');

  const nodes = useMemo(() => getNodesAtPath(currentPath), [currentPath]);
  const searchResults = useMemo(() => searchAtlas(searchTerm), [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const isSearching = searchTerm.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border/50 pb-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary mr-4" />
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-1">形态名词图鉴</h1>
                <p className="text-muted-foreground italic">
                  Botanic Terminology Illustrated
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full md:max-w-md">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="搜索植物术语 (如: 托叶, 蓇葖果)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-card border-border focus:border-primary/50 text-foreground shadow-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Breadcrumbs */}
          {!isSearching && (
            <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <Breadcrumb>
                <BreadcrumbList className="text-muted-foreground">
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/encyclopedia/atlas" className="hover:text-primary transition-colors font-medium">全部</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {currentPath.map((part, index) => {
                    const pathUpToNow = currentPath.slice(0, index + 1).join('/');
                    const isLast = index === currentPath.length - 1;
                    return (
                      <React.Fragment key={pathUpToNow}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage className="font-serif text-foreground font-semibold">{part}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to={`/encyclopedia/atlas/${pathUpToNow}`} className="hover:text-primary transition-colors">{part}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
        </div>

        {/* Search Results View */}
        {isSearching ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif font-bold text-foreground">
                搜索结果: "{searchTerm}" <span className="text-muted-foreground font-normal ml-2">({searchResults.length})</span>
              </h2>
              <Button variant="ghost" onClick={() => setSearchTerm('')} className="text-primary hover:text-primary/80 hover:bg-primary/5">
                清除搜索
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.map((item) => (
                <AtlasGridItem
                  key={item.id}
                  name={item.displayName}
                  subtext={item.path.slice(0, -1).join(' > ')}
                  imageUrl={item.url}
                  onClick={() => navigate(`/encyclopedia/atlas/item/${item.id}`)}
                />
              ))}
            </div>

            {searchResults.length === 0 && (
              <div className="text-center py-20 bg-card rounded-lg border border-dashed border-border/50">
                <div className="text-5xl mb-4 grayscale opacity-40">🔍</div>
                <h3 className="text-xl font-serif font-medium text-foreground mb-2">未找到相关术语</h3>
                <p className="text-muted-foreground">请尝试使用其他关键词搜索</p>
              </div>
            )}
          </div>
        ) : (
          /* Normal Grid View */
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {nodes.map((node) => (
                <AtlasGridItem
                  key={node.fullPath}
                  name={node.name}
                  imageUrl={node.coverUrl}
                  isFolder={!node.isLeaf}
                  onClick={() => {
                    if (node.isLeaf && node.item) {
                      navigate(`/encyclopedia/atlas/item/${node.item.id}`);
                    } else {
                      navigate(`/encyclopedia/atlas/${node.fullPath.split('-').join('/')}`);
                    }
                  }}
                />
              ))}
            </div>

            {nodes.length === 0 && (
              <div className="text-center py-24 bg-card rounded-xl border border-dashed border-border/50">
                <div className="text-6xl mb-6 grayscale opacity-30">🌿</div>
                <h3 className="text-2xl font-serif font-medium text-foreground mb-4">该分类下暂无内容</h3>
                <Button
                  variant="link"
                  onClick={() => navigate('/encyclopedia/atlas')}
                  className="text-primary hover:text-primary/80 text-lg"
                >
                  返回首页
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AtlasItemDetail = ({ itemId }: { itemId: string }) => {
  const navigate = useNavigate();
  const item = useMemo(() => atlasItems.find(i => i.id === itemId), [itemId]);

  // Find the most specific definition for the current path
  const definitionData = useMemo(() => {
    if (!item) return null;
    // Reverse traverse the path to find the most specific term with a definition
    for (let i = item.path.length - 1; i >= 0; i--) {
      const term = item.path[i];
      // @ts-expect-error - Importing JSON allows string indexing but TS might complain without proper type
      const def = atlasDefinitions[term];
      if (def) {
        return {
          term,
          ...def
        };
      }
    }
    return null;
  }, [item]);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-card p-12 rounded-xl border border-border shadow-lg">
          <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">未找到该术语</h2>
          <Button onClick={() => navigate('/encyclopedia/atlas')} className="bg-primary text-primary-foreground">返回列表</Button>
        </div>
      </div>
    );
  }

  const backPath = item.path.slice(0, -1).join('/');

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/encyclopedia/atlas/${backPath}`)}
            className="text-muted-foreground hover:text-primary hover:bg-transparent p-0 flex items-center group transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">返回 {item.path[item.path.length - 2] || '列表'}</span>
          </Button>
        </div>

        <Card className="overflow-hidden bg-card shadow-xl border-border/50 rounded-xl">
          <div className="bg-neutral-900 relative aspect-video md:aspect-[21/9] flex items-center justify-center group">
            <img
              src={item.url}
              alt={item.name}
              className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                variant="secondary"
                className="bg-black/40 hover:bg-black/60 border-none text-white backdrop-blur-md rounded-full shadow-lg"
                onClick={() => window.open(item.url, '_blank')}
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
              <div className="flex-1 space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-3 text-primary font-medium tracking-wide text-sm uppercase">
                      <BookOpen className="h-4 w-4" />
                      <span>形态特征详述</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">{item.displayName}</h1>

                    <div className="flex flex-wrap gap-2 items-center">
                      {item.path.map((p, idx) => (
                        <React.Fragment key={idx}>
                          <span className="bg-secondary/40 text-foreground px-3 py-1.5 rounded-md text-sm font-medium border border-border/50">
                            {p}
                          </span>
                          {idx < item.path.length - 1 && (
                            <span className="text-muted-foreground self-center">/</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                </div>

                {definitionData && (
                  <div className="bg-secondary/20 rounded-xl p-8 border-l-4 border-primary shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 mb-4 border-b border-primary/10 pb-4">
                      <h3 className="text-2xl font-serif font-bold text-foreground">{definitionData.term}</h3>
                      <span className="text-base font-medium text-muted-foreground font-serif italic">{definitionData.english}</span>
                    </div>
                    <p className="text-foreground/80 leading-loose text-lg font-light tracking-wide">
                      {definitionData.definition}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full lg:w-80 space-y-6">
                <div className="bg-secondary/10 rounded-xl p-6 space-y-5 border border-border/60">
                  <div className="flex items-start text-sm group">
                    <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5 mr-4 group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">原始名称</p>
                      <p className="text-foreground font-medium break-all font-mono text-xs">{item.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start text-sm group">
                    <Maximize2 className="h-5 w-5 text-muted-foreground mt-0.5 mr-4 group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">图片分辨率</p>
                      <p className="text-foreground font-medium font-mono">{item.width} × {item.height} px</p>
                    </div>
                  </div>
                  <div className="flex items-start text-sm group">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-4 group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">收录时间</p>
                      <p className="text-foreground font-medium font-serif">
                        {new Date(item.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg h-12 text-base font-medium transition-all hover:scale-[1.02]"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  查看高清原图
                </Button>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-border/40 text-center">
              <p className="text-muted-foreground text-sm font-light italic">
                点击上方图片或按钮可查看原图。层级导航可帮助您快速了解该术语在植物学分类中的位置。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface AtlasGridItemProps {
  name: string;
  imageUrl?: string;
  isFolder?: boolean;
  subtext?: string;
  onClick: () => void;
}

const AtlasGridItem = ({ name, imageUrl, isFolder, subtext, onClick }: AtlasGridItemProps) => {
  return (
    <Card
      className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-500 border-border/60 hover:border-primary/40 flex flex-col h-full bg-card hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/10">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}

        {isFolder && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors backdrop-blur-[2px]">
            <div className="bg-background/95 p-3 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
              <Folder className="h-6 w-6 text-primary fill-primary/10" />
            </div>
          </div>
        )}

        {!isFolder && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="bg-background/90 p-2 rounded-full shadow-md backdrop-blur-sm">
              <ZoomIn className="h-4 w-4 text-primary" />
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-center text-center bg-card group-hover:bg-secondary/5 transition-colors">
        <h3 className="font-serif font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        {subtext && (
          <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-1 font-mono tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Atlas;
