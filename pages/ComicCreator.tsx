import React, { useState, useRef } from 'react';
import { 
  generateComicScript, 
  generatePanelImage, 
  generateSpeech,
  Attachment, 
  TextConfig,
  ImageConfig,
  AudioConfig
} from '../services/gemini';
import { ComicScript } from '../types';
import { Wand2, Image as ImageIcon, Loader2, Download, Settings, Paperclip, X, FileText, FileImage, Play, Volume2 } from 'lucide-react';

// Audio Context Helper
const playBase64Audio = async (base64: string) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (e) {
    console.error("Audio playback error", e);
  }
};

const ComicCreator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  
  // --- CONFIGURATION STATE ---
  const [showConfig, setShowConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'audio'>('text');

  const [textConfig, setTextConfig] = useState<TextConfig>({
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    systemInstruction: 'You are a helpful assistant.'
  });

  const [imageConfig, setImageConfig] = useState<ImageConfig>({
    provider: 'gemini',
    model: 'gemini-3-pro-image-preview', // Good default for images
    style: 'Classic American Comic Book'
  });

  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    provider: 'gemini',
    model: 'gemini-2.5-flash-preview-tts',
    voice: 'Kore'
  });

  // Attachments
  const [attachments, setAttachments] = useState<{name: string, file: Attachment}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workflow State
  const [isEditing, setIsEditing] = useState(false);
  const [script, setScript] = useState<ComicScript | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [audioUrls, setAudioUrls] = useState<(string | null)[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newAttachments: {name: string, file: Attachment}[] = [];

      for (const file of files) {
        const base64 = await fileToBase64(file);
        const data = base64.split(',')[1];
        newAttachments.push({
          name: file.name,
          file: { mimeType: file.type, data: data }
        });
      }
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // --- ACTIONS ---

  const handleGenerateScript = async () => {
    if (!topic.trim() && attachments.length === 0) return;
    setIsLoading(true);
    setScript(null);
    setImages([]);
    setAudioUrls([]);
    
    try {
      setStatus('正在构思剧本 (Storytelling)...');
      const atts = attachments.map(a => a.file);
      const generatedScript = await generateComicScript(topic, atts, textConfig);
      setScript(generatedScript);
      setIsEditing(true); 
      setStatus('');
    } catch (error) {
      setStatus('生成失败，请检查配置。');
      alert("Error: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePanel = (index: number, field: 'dialogue' | 'description', value: string) => {
    if (!script) return;
    const newPanels = [...script.panels];
    newPanels[index] = { ...newPanels[index], [field]: value };
    setScript({ ...script, panels: newPanels });
  };

  const handleGenerateMedia = async () => {
    if (!script) return;
    setIsEditing(false);
    setIsLoading(true);
    
    try {
      const newImages: string[] = [];
      const newAudios: (string | null)[] = [];

      for (let i = 0; i < script.panels.length; i++) {
        const panel = script.panels[i];
        
        // Image
        setStatus(`正在绘制第 ${i + 1} 格 (Drawing)...`);
        const imgUrl = await generatePanelImage(panel.description, imageConfig);
        newImages.push(imgUrl);
        setImages([...newImages]); // Progressive update

        // Audio
        setStatus(`正在生成第 ${i + 1} 格语音 (Voice)...`);
        const audioUrl = await generateSpeech(panel.dialogue, audioConfig);
        newAudios.push(audioUrl);
        setAudioUrls([...newAudios]);
      }
      setStatus('全部完成!');
    } catch (error) {
      setStatus('生成媒体时出错。');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (index: number) => {
    const url = audioUrls[index];
    if (!url) return;
    if (url.startsWith('base64:')) {
      playBase64Audio(url.replace('base64:', ''));
    } else {
      new Audio(url).play();
    }
  };

  // --- RENDER HELPERS ---

  const renderConfigInputs = (
    config: any, 
    setConfig: (c: any) => void, 
    type: 'text' | 'image' | 'audio'
  ) => {
    return (
      <div className="space-y-4 animate-in fade-in">
        {/* Provider Switch */}
        <div className="flex gap-2">
           <button 
             onClick={() => setConfig({...config, provider: 'gemini'})}
             className={`flex-1 py-2 rounded text-sm font-bold border ${config.provider === 'gemini' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-stone-300 text-stone-500'}`}
           >
             Google Gemini
           </button>
           <button 
             onClick={() => setConfig({...config, provider: 'custom'})}
             className={`flex-1 py-2 rounded text-sm font-bold border ${config.provider === 'custom' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-stone-300 text-stone-500'}`}
           >
             Custom (OpenAI)
           </button>
        </div>

        {/* Custom Fields */}
        {config.provider === 'custom' && (
           <div className="space-y-3 bg-stone-100 p-3 rounded-lg">
             <input 
               type="text" 
               placeholder="API Base URL (e.g., https://api.openai.com/v1)"
               value={config.baseUrl || ''}
               onChange={(e) => setConfig({...config, baseUrl: e.target.value})}
               className="w-full p-2 rounded border border-stone-300 bg-white text-sm"
             />
             <input 
               type="password" 
               placeholder="API Key (sk-...)"
               value={config.apiKey || ''}
               onChange={(e) => setConfig({...config, apiKey: e.target.value})}
               className="w-full p-2 rounded border border-stone-300 bg-white text-sm"
             />
             <input 
               type="text" 
               placeholder={type === 'text' ? "Model (e.g. gpt-4o)" : type === 'image' ? "Model (e.g. dall-e-3)" : "Model (e.g. tts-1)"}
               value={config.model}
               onChange={(e) => setConfig({...config, model: e.target.value})}
               className="w-full p-2 rounded border border-stone-300 bg-white text-sm"
             />
           </div>
        )}

        {/* Gemini Fields */}
        {config.provider === 'gemini' && (
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Model Name</label>
            <select 
              value={config.model} 
              onChange={(e) => setConfig({...config, model: e.target.value})}
              className="w-full p-2 border border-stone-300 rounded text-sm bg-white"
            >
              {type === 'text' && (
                <>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                  <option value="gemini-3-pro-preview">Gemini 3 Pro (Smart)</option>
                </>
              )}
              {type === 'image' && (
                <>
                  <option value="gemini-2.5-flash-image">Gemini Flash Image (Fast)</option>
                  <option value="gemini-3-pro-image-preview">Gemini Pro Image (Quality)</option>
                </>
              )}
              {type === 'audio' && (
                <>
                   <option value="gemini-2.5-flash-preview-tts">Gemini Flash TTS</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Type Specific Fields */}
        {type === 'text' && (
          <div>
             <label className="block text-xs font-bold text-stone-500 uppercase mb-1">System Instruction</label>
             <textarea 
               value={config.systemInstruction || ''}
               onChange={(e) => setConfig({...config, systemInstruction: e.target.value})}
               className="w-full p-2 border border-stone-300 rounded text-sm bg-white h-20"
             />
             <div className="mt-2">
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Temperature ({config.temperature})</label>
                <input 
                  type="range" min="0" max="2" step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                  className="w-full accent-teal-600 bg-white"
                />
             </div>
          </div>
        )}

        {type === 'image' && (
           <div>
             <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Art Style</label>
             <select 
                value={config.style} 
                onChange={(e) => setConfig({...config, style: e.target.value})}
                className="w-full p-2 border border-stone-300 rounded text-sm bg-white"
              >
                <option value="Classic American Comic Book">美式经典漫画</option>
                <option value="Japanese Manga, black and white">日式黑白漫画</option>
                <option value="Watercolor illustration">水彩插画</option>
                <option value="Pixar 3D animation style">3D 动画风格</option>
                <option value="Traditional Chinese Ink Painting">中国水墨画</option>
              </select>
           </div>
        )}

        {type === 'audio' && (
          <div>
             <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Voice</label>
             {config.provider === 'gemini' ? (
               <select 
                 value={config.voice} 
                 onChange={(e) => setConfig({...config, voice: e.target.value})}
                 className="w-full p-2 border border-stone-300 rounded text-sm bg-white"
               >
                 <option value="Puck">Puck (Male)</option>
                 <option value="Charon">Charon (Male)</option>
                 <option value="Kore">Kore (Female)</option>
                 <option value="Fenrir">Fenrir (Male)</option>
                 <option value="Zephyr">Zephyr (Female)</option>
               </select>
             ) : (
                <input 
                  type="text" 
                  value={config.voice} 
                  onChange={(e) => setConfig({...config, voice: e.target.value})}
                  placeholder="e.g. alloy, echo"
                  className="w-full p-2 border border-stone-300 rounded text-sm bg-white"
                />
             )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-teal-800 mb-2 flex items-center justify-center gap-2">
          <Wand2 className="h-8 w-8 text-amber-500" />
          AI 多模态漫画工坊
        </h2>
        <p className="text-stone-600">
          配置文本、图像、语音三大模型，打造您的专属有声漫画。
        </p>
      </div>

      {/* Input Section */}
      {!script && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-stone-200 animate-in fade-in">
          
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
             <label className="block text-stone-700 font-bold text-lg">创作面板</label>
             <button 
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full transition-colors ${showConfig ? 'bg-teal-100 text-teal-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
             >
               <Settings className="h-4 w-4" /> 
               {showConfig ? '收起模型配置' : '配置 AI 模型'}
             </button>
          </div>
          
          {/* Configuration Tabs */}
          {showConfig && (
            <div className="mb-6 p-1 bg-stone-100 rounded-xl border border-stone-200 animate-in slide-in-from-top-2">
              <div className="flex border-b border-stone-200 mb-2">
                {(['text', 'image', 'audio'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-bold capitalize transition-colors border-b-2 ${
                      activeTab === tab 
                        ? 'border-teal-600 text-teal-800 bg-white rounded-t-lg' 
                        : 'border-transparent text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {tab === 'text' ? '剧本 (Text)' : tab === 'image' ? '绘画 (Image)' : '配音 (TTS)'}
                  </button>
                ))}
              </div>
              
              <div className="p-4 bg-white rounded-b-lg">
                {activeTab === 'text' && renderConfigInputs(textConfig, setTextConfig, 'text')}
                {activeTab === 'image' && renderConfigInputs(imageConfig, setImageConfig, 'image')}
                {activeTab === 'audio' && renderConfigInputs(audioConfig, setAudioConfig, 'audio')}
              </div>
            </div>
          )}

          {/* Main Input */}
          <div className="space-y-4">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="请输入故事内容、教材文本，或者在此描述您上传的文件..."
              className="w-full h-32 p-4 border border-stone-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none text-lg bg-white"
            />

            <div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.txt,.md"
                className="hidden"
              />
              <div className="flex flex-wrap gap-2 mb-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-300 transition-colors font-medium bg-white"
                >
                  <Paperclip className="h-4 w-4" /> 上传 PDF / 图片 / 文本
                </button>
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-stone-200 text-sm shadow-sm">
                      {att.file.mimeType.includes('image') ? <FileImage className="h-4 w-4 text-purple-500"/> : <FileText className="h-4 w-4 text-blue-500"/>}
                      <span className="truncate max-w-[150px]">{att.name}</span>
                      <button onClick={() => removeAttachment(idx)} className="text-stone-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleGenerateScript}
            disabled={isLoading || (!topic.trim() && attachments.length === 0)}
            className={`w-full mt-6 py-4 rounded-xl text-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all ${
              isLoading || (!topic.trim() && attachments.length === 0) ? 'bg-stone-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:scale-[1.01]'
            }`}
          >
            {isLoading ? <><Loader2 className="animate-spin" /> {status}</> : <><Wand2 /> 生成剧本</>}
          </button>
        </div>
      )}

      {/* Editing Phase */}
      {script && isEditing && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
           <div className="flex flex-col md:flex-row justify-between items-center bg-amber-50 p-4 rounded-xl border border-amber-200 gap-4">
              <div>
                <h3 className="text-xl font-bold text-amber-800">确认剧本内容</h3>
                <p className="text-sm text-amber-700">您可以微调对话和画面描述，确认无误后开始生成多媒体。</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 <button 
                  onClick={() => { setScript(null); setImages([]); setAudioUrls([]); }}
                  className="flex-1 md:flex-none px-4 py-2 text-stone-500 hover:bg-stone-200 rounded-lg bg-white"
                 >
                   放弃
                 </button>
                 <button 
                   onClick={handleGenerateMedia}
                   className="flex-1 md:flex-none bg-teal-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-teal-700 flex items-center justify-center gap-2"
                 >
                   <ImageIcon className="h-5 w-5" /> 生成画面与语音
                 </button>
              </div>
           </div>

           <div className="grid gap-6">
             {script.panels.map((panel, index) => (
               <div key={index} className="bg-white p-4 rounded-xl shadow border border-stone-200 flex flex-col md:flex-row gap-4">
                  <div className="bg-stone-100 p-2 rounded-lg flex items-center justify-center md:w-16 md:h-16 font-bold text-stone-400">
                    #{index + 1}
                  </div>
                  <div className="flex-grow space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1">画面提示词 (Image Prompt)</label>
                      <textarea
                        value={panel.description}
                        onChange={(e) => handleUpdatePanel(index, 'description', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1">角色对话 (Dialogue)</label>
                      <input
                        type="text"
                        value={panel.dialogue}
                        onChange={(e) => handleUpdatePanel(index, 'dialogue', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                      />
                    </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Final View Phase */}
      {script && !isEditing && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b pb-4">
             <h3 className="text-2xl font-bold serif text-stone-800">{script.title}</h3>
             <button onClick={() => { setScript(null); setImages([]); setAudioUrls([]); setTopic(''); setAttachments([]); }} className="text-sm text-teal-600 underline">
               创建新漫画
             </button>
          </div>

          {isLoading && (
             <div className="bg-teal-50 p-4 rounded-lg flex items-center justify-center gap-3 text-teal-800">
                <Loader2 className="animate-spin" />
                <span>{status}</span>
             </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {script.panels.map((panel, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-md border-2 border-stone-800 break-inside-avoid">
                {/* Image Area */}
                <div className="aspect-square bg-stone-100 rounded border border-stone-200 overflow-hidden mb-3 relative flex items-center justify-center">
                  {images[index] ? (
                    <img 
                      src={images[index]} 
                      alt={`Panel ${index + 1}`} 
                      className="w-full h-full object-cover animate-in fade-in duration-500" 
                    />
                  ) : (
                     <div className="text-stone-400 flex flex-col items-center p-4 text-center">
                       <Loader2 className="h-8 w-8 animate-spin mb-2" />
                       <span className="text-xs">等待生成...</span>
                     </div>
                  )}
                  <div className="absolute top-0 left-0 bg-stone-800 text-white px-2 py-1 text-xs font-bold rounded-br">
                    {index + 1}
                  </div>
                </div>
                
                {/* Dialogue Bubble */}
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 relative min-h-[60px] flex items-center gap-2">
                   <div className="absolute -top-2 left-8 w-4 h-4 bg-amber-50 border-t border-l border-amber-200 transform rotate-45"></div>
                   
                   <p className="text-stone-800 font-medium font-comic text-sm md:text-base leading-relaxed w-full">
                     {panel.dialogue}
                   </p>
                   
                   {/* Audio Player Button */}
                   {audioUrls[index] && (
                     <button 
                       onClick={() => playAudio(index)}
                       className="p-2 bg-amber-200 text-amber-800 rounded-full hover:bg-amber-300 transition-colors flex-shrink-0"
                       title="朗读对话"
                     >
                       <Volume2 className="h-4 w-4" />
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>

          {!isLoading && images.length === script.panels.length && (
             <div className="text-center pb-8 pt-4">
               <button 
                onClick={() => window.print()} 
                className="bg-stone-700 text-white px-6 py-3 rounded-lg hover:bg-stone-800 flex items-center gap-2 mx-auto shadow-lg"
               >
                 <Download className="h-4 w-4" /> 打印 / 保存为 PDF
               </button>
             </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ComicCreator;