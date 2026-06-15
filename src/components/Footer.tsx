import { useEffect } from 'react';

const Footer = () => {
  useEffect(() => {
    // 动态加载不蒜子脚本
    const script = document.createElement('script');
    script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // 组件卸载时移除脚本
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <footer className="w-full border-t border-border bg-background/95 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <p className="mb-2">© {new Date().getFullYear()} ZhiShi - 植识. All rights reserved.</p>
        <div className="flex items-center justify-center space-x-2">
          <span id="busuanzi_container_site_pv" style={{ display: 'none' }}>
            本站总访问量：<span id="busuanzi_value_site_pv" className="font-semibold text-primary"></span> 次
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
