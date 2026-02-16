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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">形态名词图鉴</h1>
            </div>

            {/* Search Bar */}
            <div className="w-full md:max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="搜索植物术语 (如: 托叶, 蓇葖果)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Breadcrumbs */}
          {!isSearching && (
            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/encyclopedia/atlas">全部</Link>
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
                            <BreadcrumbPage>{part}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to={`/encyclopedia/atlas/${pathUpToNow}`}>{part}</Link>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                搜索结果: "{searchTerm}" ({searchResults.length})
              </h2>
              <Button variant="ghost" onClick={() => setSearchTerm('')} className="text-green-600">
                清除搜索
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
              <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-700">未找到相关术语</h3>
                <p className="text-gray-500 mt-2">请尝试使用其他关键词搜索</p>
              </div>
            )}
          </div>
        ) : (
          /* Normal Grid View */
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
              <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                <div className="text-5xl mb-4">🌿</div>
                <h3 className="text-lg font-medium text-gray-700">该分类下暂无内容</h3>
                <Button
                  variant="link"
                  onClick={() => navigate('/encyclopedia/atlas')}
                  className="mt-2 text-green-600"
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

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">未找到该术语</h2>
          <Button onClick={() => navigate('/encyclopedia/atlas')}>返回列表</Button>
        </div>
      </div>
    );
  }

  const backPath = item.path.slice(0, -1).join('/');

  // Find the most specific definition for the current path
  const definitionData = useMemo(() => {
    // Reverse traverse the path to find the most specific term with a definition
    for (let i = item.path.length - 1; i >= 0; i--) {
      const term = item.path[i];
      // @ts-ignore - Importing JSON allows string indexing but TS might complain without proper type
      const def = atlasDefinitions[term];
      if (def) {
        return {
          term,
          ...def
        };
      }
    }
    return null;
  }, [item.path]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/encyclopedia/atlas/${backPath}`)}
            className="text-green-600 pl-0 hover:bg-transparent hover:text-green-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回 {item.path[item.path.length - 2] || '列表'}
          </Button>
        </div>

        <Card className="overflow-hidden bg-white shadow-lg border-green-50">
          <div className="bg-gray-900 relative aspect-video sm:aspect-[16/9] flex items-center justify-center">
            <img
              src={item.url}
              alt={item.name}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute top-4 right-4">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm"
                onClick={() => window.open(item.url, '_blank')}
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 text-green-600 font-medium">
                  <BookOpen className="h-5 w-5" />
                  <span>形态特征详述</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.displayName}</h1>

                <div className="flex flex-wrap gap-2 mb-6">
                  {item.path.map((p, idx) => (
                    <React.Fragment key={idx}>
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-100">
                        {p}
                      </span>
                      {idx < item.path.length - 1 && (
                        <span className="text-gray-300 self-center">/</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {definitionData && (
                  <div className="bg-green-50/50 rounded-lg p-6 border border-green-100 mt-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{definitionData.term}</h3>
                      <span className="text-sm font-medium text-gray-500 font-mono">{definitionData.english}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {definitionData.definition}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full md:w-64 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
                  <div className="flex items-center text-sm">
                    <ImageIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">原始名称</p>
                      <p className="text-gray-700 font-medium break-all">{item.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <Maximize2 className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">图片分辨率</p>
                      <p className="text-gray-700 font-medium">{item.width} × {item.height} px</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">更新时间</p>
                      <p className="text-gray-700 font-medium">
                        {new Date(item.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 shadow-md"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  查看高清原图
                </Button>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
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
      className="group cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 border-gray-200 flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}

        {isFolder && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
            <div className="bg-white/90 p-2 rounded-full shadow-sm">
              <Folder className="h-5 w-5 text-green-600" />
            </div>
          </div>
        )}

        {!isFolder && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 p-1.5 rounded-full shadow-sm">
              <ZoomIn className="h-4 w-4 text-green-600" />
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-3 flex-1 flex flex-col justify-center">
        <h3 className="font-medium text-sm text-gray-800 line-clamp-2 text-center group-hover:text-green-700 transition-colors">
          {name}
        </h3>
        {subtext && (
          <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 text-center">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Atlas;
