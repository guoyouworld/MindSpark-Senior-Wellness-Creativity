import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Upload, 
  Image as ImageIcon, 
  Settings, 
  Play, 
  Youtube, 
  MousePointer2, 
  Terminal, 
  Wand2, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  CircleDashed,
  Circle,
  Plus,
  X,
  Palette
} from 'lucide-react';
import { TextConfig, generateText } from '../services/gemini';

const PLATFORMS = [
  { id: 'bilibili', name: '哔哩哔哩 (Bilibili)', color: 'text-blue-500' },
  { id: 'douyin', name: '抖音 (Douyin)', color: 'text-stone-900' },
  { id: 'kuaishou', name: '快手 (Kuaishou)', color: 'text-orange-500' },
  { id: 'video_account', name: '微信视频号', color: 'text-green-600' },
  { id: 'xiaohongshu', name: '小红书', color: 'text-rose-500' },
  { id: 'youtube', name: 'YouTube', color: 'text-red-600' },
];

const PRESET_COLORS = [
  { label: 'Black', value: 'text-stone-900', bg: 'bg-stone-900' },
  { label: 'Blue', value: 'text-blue-600', bg: 'bg-blue-600' },
  { label: 'Green', value: 'text-green-600', bg: 'bg-green-600' },
  { label: 'Purple', value: 'text-purple-600', bg: 'bg-purple-600' },
  { label: 'Rose', value: 'text-rose-600', bg: 'bg-rose-600' },
  { label: 'Amber', value: 'text-amber-600', bg: 'bg-amber-600' },
  { label: 'Teal', value: 'text-teal-600', bg: 'bg-teal-600' },
];

const VideoPublisher: React.FC = () => {
  // --- ASSET STATE ---
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  // --- CUSTOM PLATFORMS STATE ---
  const [customPlatforms, setCustomPlatforms] = useState<{id: string, name: string, color: string}[]>([]);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformColor, setNewPlatformColor] = useState(PRESET_COLORS[0].value);

  // --- TRAINING STATE ---
  // Track which platforms have been "trained" (simulated recording of user actions)
  const [trainedStatus, setTrainedStatus] = useState<Record<string, boolean>>({});

  // --- AI CONFIG STATE ---
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [aiConfig, setAiConfig] = useState<TextConfig>({
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    systemInstruction: 'You are a social media expert. Optimize titles and descriptions for viral reach.'
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  // --- AUTOMATION STATE ---
  const [isRecording, setIsRecording] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // --- HANDLERS ---

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) return;
    const newId = `custom_${Date.now()}`;
    setCustomPlatforms(prev => [...prev, {
      id: newId,
      name: newPlatformName.trim(),
      color: newPlatformColor
    }]);
    setNewPlatformName('');
    setShowAddPlatform(false);
  };

  const getAllPlatforms = () => [...PLATFORMS, ...customPlatforms];

  const handleAiOptimize = async () => {
    if (!title && !description) return alert("请先填写一些基础内容供 AI 优化");
    setIsOptimizing(true);
    try {
      const prompt = `
        Please optimize the following video metadata for maximum engagement on Chinese social media (Bilibili, Douyin, Kuaishou).
        Current Title: ${title}
        Current Description: ${description}
        
        Output format:
        Title: [Optimized Title]
        Description: [Optimized Description with hashtags]
        
        Keep it catchy but relevant.
      `;
      const result = await generateText(prompt, aiConfig);
      
      // Simple parsing (assuming AI follows instruction, otherwise just dump text)
      const titleMatch = result.match(/Title:\s*(.*)/i);
      const descMatch = result.match(/Description:\s*([\s\S]*)/i);
      
      if (titleMatch) setTitle(titleMatch[1].trim());
      if (descMatch) setDescription(descMatch[1].trim());
      if (!titleMatch && !descMatch) setDescription(result); // Fallback

    } catch (e) {
      alert("AI Optimization Failed: " + (e as Error).message);
    } finally {
      setIsOptimizing(false);
    }
  };

  // --- SIMULATION LOGIC ---

  const startTraining = () => {
    if (selectedPlatforms.length === 0) return alert("请选择一个平台进行录制");
    if (selectedPlatforms.length > 1) return alert("录制模式下，请一次只选择一个平台进行操作教学。");

    const platformId = selectedPlatforms[0];
    const allPlats = getAllPlatforms();
    const platformName = allPlats.find(p => p.id === platformId)?.name;

    if (trainedStatus[platformId]) {
      if(!confirm(`${platformName} 已经录制过操作流程。是否重新录制？`)) return;
    }

    setIsRecording(true);
    setLogs([
      `🎥 开始录制 [${platformName}] 操作流程...`,
      "⚠️ 请在弹出的窗口中手动完成一次视频上传。",
      "🤖 AI 正在观察并学习您的点击路径..."
    ]);
    
    // Simulate "Learning" process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress === 20) setLogs(prev => [...prev, "🖱️ 检测到鼠标移动: 点击 '上传按钮'"]);
      if (progress === 40) setLogs(prev => [...prev, "📂 检测到文件选择: 视频/封面"]);
      if (progress === 60) setLogs(prev => [...prev, "⌨️ 记录输入框位置: 标题/简介"]);
      if (progress === 80) setLogs(prev => [...prev, "✅ 记录发布按钮坐标"]);

      if (progress >= 100) {
        clearInterval(interval);
        setIsRecording(false);
        setTrainedStatus(prev => ({ ...prev, [platformId]: true }));
        setLogs(prev => [...prev, `✨ [${platformName}] 操作流程学习完毕！已保存指纹。`]);
        alert(`✅ ${platformName} 操作录制完成！\n以后 AI 将自动模拟此流程进行发布。`);
      }
    }, 800);
  };

  const startPublishing = () => {
    if (!videoFile) return alert("请上传视频");
    if (!title) return alert("请填写标题");
    if (selectedPlatforms.length === 0) return alert("请选择平台");

    // Check if all selected platforms are trained
    const allPlats = getAllPlatforms();
    const untrained = selectedPlatforms.filter(p => !trainedStatus[p]);
    if (untrained.length > 0) {
      const names = untrained.map(id => allPlats.find(p => p.id === id)?.name).join(', ');
      return alert(`以下平台尚未进行操作录制(首次使用需要人工示范):\n${names}\n\n请先选择单个平台并点击“训练模式”进行配置。`);
    }

    setIsRunning(true);
    setLogs(["🚀 初始化 MCP 浏览器代理..."]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const currentPlatformId = selectedPlatforms[Math.floor(step / 6) % selectedPlatforms.length];
      const currentPlatformName = allPlats.find(p => p.id === currentPlatformId)?.name;
      
      const newLogs = [];
      
      if (step === 1) newLogs.push("🔒 加载本地指纹环境 (防关联模式)...");
      if (step === 2) newLogs.push(`📂 读取视频文件: ${videoFile.name}`);
      
      if (step > 2) {
         const actionType = Math.random();
         if (actionType > 0.8) newLogs.push(`[${currentPlatformName}] 🖱️ 模拟鼠标: 移动至上传区 (X: ${Math.floor(Math.random()*800)}, Y: ${Math.floor(Math.random()*600)})`);
         else if (actionType > 0.6) newLogs.push(`[${currentPlatformName}] ⌨️ 模拟键盘: 输入标题 "${title.substring(0, 5)}..."`);
         else if (actionType > 0.4) newLogs.push(`[${currentPlatformName}] ⏳ 等待平台转码... ${(Math.random() * 100).toFixed(1)}%`);
         else newLogs.push(`[${currentPlatformName}] ✅ 步骤校验通过`);
      }

      if (step > 25) {
        newLogs.push("✨ 所有任务队列执行完毕！");
        clearInterval(interval);
        setIsRunning(false);
      }

      setLogs(prev => [...prev, ...newLogs]);

    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-teal-800 flex items-center justify-center gap-2">
          <Video className="h-8 w-8 text-rose-500" />
          视频智投 (Auto-Publisher)
        </h2>
        <p className="text-stone-500 mt-2">
          基于本地浏览器环境模拟人工操作 (MCP Agent)，一键分发至全网平台。
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* LEFT: ASSET STUDIO */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-teal-600"/> 素材准备
              </h3>
              
              {/* File Inputs */}
              <div className="space-y-4">
                 <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:bg-stone-50 transition-colors">
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" id="video-upload" />
                    <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                       <Video className="h-10 w-10 text-stone-400" />
                       <span className="text-stone-600 font-medium">
                         {videoFile ? `已选择: ${videoFile.name}` : "点击上传视频文件"}
                       </span>
                    </label>
                 </div>

                 <div className="flex gap-4">
                   <div className="flex-1 border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:bg-stone-50 transition-colors relative overflow-hidden group">
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" id="cover-upload" />
                      <label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center gap-2 relative z-10">
                         <ImageIcon className="h-8 w-8 text-stone-400" />
                         <span className="text-xs text-stone-600">
                           {coverFile ? "更换封面" : "上传封面 (9:16 / 16:9)"}
                         </span>
                      </label>
                      {coverPreview && (
                        <div className="absolute inset-0 opacity-30 group-hover:opacity-10 transition-opacity">
                          <img src={coverPreview} className="w-full h-full object-cover" alt="preview" />
                        </div>
                      )}
                   </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 relative">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-stone-800">元数据 (Metadata)</h3>
                 <button 
                   onClick={() => setShowAiConfig(!showAiConfig)}
                   className="text-xs flex items-center gap-1 text-stone-500 hover:text-teal-600 border px-2 py-1 rounded"
                 >
                   <Settings className="h-3 w-3" /> 配置 AI 模型
                 </button>
              </div>

              {/* AI Config Dropdown */}
              {showAiConfig && (
                <div className="bg-stone-100 p-4 rounded-xl mb-4 animate-in slide-in-from-top-2 border border-stone-200">
                   <div className="flex gap-2 mb-3">
                      <button onClick={() => setAiConfig({...aiConfig, provider: 'gemini', model: 'gemini-2.5-flash'})} className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${aiConfig.provider === 'gemini' ? 'bg-teal-600 text-white shadow' : 'bg-white border border-stone-300 text-stone-600'}`}>Gemini</button>
                      <button onClick={() => setAiConfig({...aiConfig, provider: 'custom', model: 'gpt-4o'})} className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${aiConfig.provider === 'custom' ? 'bg-teal-600 text-white shadow' : 'bg-white border border-stone-300 text-stone-600'}`}>OpenAI / Custom</button>
                   </div>
                   
                   {/* Gemini Settings */}
                   {aiConfig.provider === 'gemini' && (
                     <div className="mb-3">
                        <label className="block text-xs font-bold text-stone-500 mb-1">Model</label>
                        <select 
                           value={aiConfig.model} 
                           onChange={e => setAiConfig({...aiConfig, model: e.target.value})}
                           className="w-full text-xs p-2 rounded border border-stone-300 bg-white"
                        >
                           <option value="gemini-2.5-flash">Gemini 2.5 Flash (速度快)</option>
                           <option value="gemini-3-pro-preview">Gemini 3 Pro (智商高)</option>
                        </select>
                     </div>
                   )}

                   {/* Custom OpenAI Settings */}
                   {aiConfig.provider === 'custom' && (
                     <div className="space-y-2 mb-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-500 mb-1">Base URL</label>
                          <input 
                             placeholder="e.g. https://api.openai.com/v1" 
                             className="w-full text-xs p-2 rounded border border-stone-300 bg-white" 
                             value={aiConfig.baseUrl || ''} 
                             onChange={e => setAiConfig({...aiConfig, baseUrl: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-500 mb-1">API Key</label>
                          <input 
                             placeholder="sk-..." 
                             type="password"
                             className="w-full text-xs p-2 rounded border border-stone-300 bg-white" 
                             value={aiConfig.apiKey || ''} 
                             onChange={e => setAiConfig({...aiConfig, apiKey: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-500 mb-1">Model Name</label>
                          <input 
                             placeholder="e.g. gpt-4o, deepseek-chat" 
                             className="w-full text-xs p-2 rounded border border-stone-300 bg-white" 
                             value={aiConfig.model} 
                             onChange={e => setAiConfig({...aiConfig, model: e.target.value})}
                          />
                        </div>
                     </div>
                   )}
                   
                   {/* Common Settings */}
                   <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">System Prompt (角色设定)</label>
                      <textarea
                        value={aiConfig.systemInstruction || ''}
                        onChange={(e) => setAiConfig({...aiConfig, systemInstruction: e.target.value})}
                        className="w-full text-xs p-2 rounded border border-stone-300 h-16 resize-none focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                        placeholder="例如：你是一个爆款短视频文案专家..."
                      />
                   </div>
                </div>
              )}

              <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-stone-600 mb-1">视频标题</label>
                   <input 
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     className="w-full p-2 border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                     placeholder="一个吸引人的标题..."
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-stone-600 mb-1">简介 / 描述</label>
                   <textarea 
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     className="w-full p-2 border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 h-24 resize-none bg-white"
                     placeholder="视频内容介绍..."
                   />
                 </div>
                 <button 
                   onClick={handleAiOptimize}
                   disabled={isOptimizing}
                   className="w-full bg-indigo-50 text-indigo-700 py-2 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-2"
                 >
                    {isOptimizing ? <Loader2 className="animate-spin h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                    AI 一键润色 (标题+简介)
                 </button>
              </div>
           </div>
        </div>

        {/* RIGHT: AGENT CONTROL */}
        <div className="space-y-6">
           
           {/* Platform Selector */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-800">选择发布平台</h3>
                <button 
                  onClick={() => setShowAddPlatform(true)}
                  className="text-xs bg-stone-800 text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-stone-700 transition-colors"
                >
                  <Plus className="h-3 w-3" /> 自定义平台
                </button>
              </div>

              {/* Add Platform Form */}
              {showAddPlatform && (
                <div className="bg-stone-100 p-4 rounded-xl mb-4 border border-stone-200 animate-in fade-in">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-stone-700">添加自定义接口</h4>
                    <button onClick={() => setShowAddPlatform(false)} className="text-stone-400 hover:text-stone-600"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-3">
                    <input 
                      value={newPlatformName}
                      onChange={(e) => setNewPlatformName(e.target.value)}
                      placeholder="平台名称 (e.g. 视频号助手)"
                      className="w-full p-2 text-sm border border-stone-300 rounded bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-stone-500" />
                      <div className="flex gap-2">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c.value}
                            onClick={() => setNewPlatformColor(c.value)}
                            className={`w-6 h-6 rounded-full ${c.bg} ${newPlatformColor === c.value ? 'ring-2 ring-offset-1 ring-stone-400' : ''}`}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={handleAddPlatform}
                      className="w-full bg-teal-600 text-white text-sm py-2 rounded font-bold hover:bg-teal-700"
                    >
                      确认添加
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                 {getAllPlatforms().map(platform => {
                   const isTrained = trainedStatus[platform.id];
                   const isSelected = selectedPlatforms.includes(platform.id);
                   return (
                     <div 
                       key={platform.id}
                       onClick={() => togglePlatform(platform.id)}
                       className={`
                         cursor-pointer border rounded-xl p-3 flex flex-col gap-2 transition-all select-none
                         ${isSelected ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500' : 'hover:bg-stone-50 border-stone-200'}
                       `}
                     >
                        <div className="flex items-center justify-between">
                            <span className={`font-medium truncate pr-1 ${platform.color}`}>{platform.name}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-stone-400'}`}>
                                {isSelected && <CheckCircle className="text-white w-3 h-3" />}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-1">
                          {isTrained ? (
                             <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200 flex items-center gap-1">
                               <CheckCircle className="h-3 w-3" /> 已配置
                             </span>
                          ) : (
                             <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1 animate-pulse">
                               <CircleDashed className="h-3 w-3" /> 未配置 (需录制)
                             </span>
                          )}
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>

           {/* Agent Control Panel */}
           <div className="bg-stone-900 text-green-400 p-6 rounded-2xl shadow-lg border border-stone-700 font-mono min-h-[300px] flex flex-col">
              <div className="flex justify-between items-center border-b border-stone-700 pb-3 mb-3">
                 <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    <span className="font-bold">Agent Console v1.0</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isRunning || isRecording ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-stone-500">{isRunning ? 'RUNNING' : isRecording ? 'RECORDING' : 'IDLE'}</span>
                 </div>
              </div>

              {/* Logs Area */}
              <div 
                ref={logContainerRef}
                className="flex-grow overflow-y-auto space-y-1 text-sm max-h-[250px] mb-4 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent pr-2"
              >
                 {logs.length === 0 && (
                   <div className="text-stone-600 italic space-y-1">
                     <p>// 系统就绪。</p>
                     <p>// 首次使用平台前，请先点击【训练模式】</p>
                     <p>// 人工操作一次上传流程，供 AI 学习。</p>
                   </div>
                 )}
                 {logs.map((log, idx) => (
                    <div key={idx} className="break-words">
                       <span className="text-stone-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                       {log}
                    </div>
                 ))}
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                 <button 
                   onClick={startTraining}
                   disabled={isRunning || isRecording}
                   className={`
                     py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors
                     ${isRecording ? 'bg-amber-600 text-white animate-pulse' : 'bg-stone-800 text-amber-500 hover:bg-stone-700'}
                     ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
                   `}
                 >
                   <MousePointer2 className="h-4 w-4" />
                   {isRecording ? "正在学习操作..." : "训练模式 (录制)"}
                 </button>
                 
                 <button 
                   onClick={startPublishing}
                   disabled={isRunning || isRecording}
                   className={`
                     py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors
                     ${isRunning ? 'bg-stone-700 text-stone-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-500'}
                     ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}
                   `}
                 >
                   <Play className="h-4 w-4" />
                   开始分发
                 </button>
              </div>
           </div>

           {/* Disclaimer */}
           <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                 <p className="font-bold mb-1">安全提示</p>
                 <p>本模块使用本地浏览器模拟技术（Local Browser Simulation），不调用平台 API，最大程度模拟人工操作以降低封号风险。每个平台首次使用时，请务必使用“训练模式”进行人工示范。</p>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

export default VideoPublisher;