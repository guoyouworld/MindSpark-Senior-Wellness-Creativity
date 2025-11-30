import React from 'react';
import { Tag, Calendar, GitCommit, Box, Monitor, Apple, Code2 } from 'lucide-react';
import { releases } from '../data/releases';

interface Asset {
  name: string;
  size: string;
  url: string;
  iconType: string;
}

interface Release {
  version: string;
  title: string;
  date: string;
  isLatest: boolean;
  isPreRelease: boolean;
  author: string;
  authorAvatar: string;
  commitHash: string;
  description: string;
  assets: Asset[];
}

const VersionRelease: React.FC = () => {
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'apple': return <Apple className="h-4 w-4" />;
      case 'monitor': return <Monitor className="h-4 w-4" />;
      case 'code': return <Code2 className="h-4 w-4" />;
      case 'box': default: return <Box className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-8 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="h-8 w-8 text-stone-700" />
          <h2 className="text-3xl font-bold text-stone-900">Releases</h2>
        </div>
        <p className="text-stone-500">
           分镜助手 (Storyboard Assistant) 官方版本发布与更新日志。
        </p>
      </div>

      {/* Release List */}
      <div className="space-y-12">
        {(releases as Release[]).map((release, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-6 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Column: Meta Info */}
            <div className="md:w-1/4 flex-shrink-0 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                 <Tag className="h-4 w-4 text-stone-500" />
                 <span className="font-bold text-xl text-stone-800">{release.version}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-stone-500">
                 <GitCommit className="h-4 w-4" />
                 <span className="font-mono bg-stone-100 px-1 rounded">{release.commitHash}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-stone-500">
                 <Calendar className="h-4 w-4" />
                 <span>{release.date}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {release.isLatest && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                    Latest
                  </span>
                )}
                {release.isPreRelease && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                    Pre-release
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex-grow">
               <div className="bg-white rounded-xl border border-stone-300 shadow-sm overflow-hidden">
                  
                  {/* Title Bar */}
                  <div className="bg-stone-50 border-b border-stone-200 p-4 flex items-center justify-between">
                     <h3 className="text-xl font-bold text-stone-900">{release.title}</h3>
                     <div className="flex items-center gap-2 text-sm text-stone-500">
                        <img src={release.authorAvatar} alt={release.author} className="w-6 h-6 rounded-full bg-stone-200" />
                        <span>{release.author} released this</span>
                     </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 md:p-8">
                     <div 
                        className="prose prose-stone max-w-none mb-8"
                        dangerouslySetInnerHTML={{ __html: release.description }}
                     />

                     {/* Assets Section */}
                     <div className="border-t border-stone-200 pt-4">
                        <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                           <Box className="h-5 w-5 text-stone-500" /> Assets
                        </h4>
                        <div className="bg-stone-50 rounded-lg border border-stone-200 divide-y divide-stone-200">
                           {release.assets.map((asset, i) => (
                             <div key={i} className="flex items-center justify-between p-3 hover:bg-stone-100 transition-colors group">
                                <div className="flex items-center gap-3">
                                   <div className="text-stone-500 group-hover:text-blue-600 transition-colors">
                                     {getIcon(asset.iconType)}
                                   </div>
                                   <a href={asset.url} className="text-blue-600 font-medium hover:underline truncate">
                                      {asset.name}
                                   </a>
                                </div>
                                <span className="text-sm text-stone-500 font-mono">{asset.size}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

               </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionRelease;