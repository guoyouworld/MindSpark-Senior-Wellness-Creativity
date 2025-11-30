export const releases = [
  {
    "version": "v2.3.0",
    "title": "AI Agent & Auto-Publishing Integration",
    "date": "2024-05-20",
    "isLatest": true,
    "isPreRelease": false,
    "author": "DevTeam",
    "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "commitHash": "8a2b3c",
    "description": "<div class='space-y-4 text-stone-800'><p>This release introduces a major new module: <strong>Video Publisher Agent</strong>. We've also upgraded the core AI engine to support Gemini 2.5 Flash for faster inference.</p><h4 class='font-bold text-lg mt-4 mb-2'>✨ New Features</h4><ul class='list-disc pl-5 space-y-1'><li><strong>Video Publisher Module</strong>: A localized MCP agent that simulates browser actions to upload videos to Bilibili, Douyin, and YouTube automatically.</li><li><strong>Training Mode</strong>: Users can now record their own click paths to 'teach' the agent how to operate on unsupported custom platforms.</li><li><strong>Metadata Optimization</strong>: One-click polish for video titles and descriptions using GenAI.</li></ul><h4 class='font-bold text-lg mt-4 mb-2'>🛠 Improvements</h4><ul class='list-disc pl-5 space-y-1'><li><strong>Comic Creator</strong>: Added support for PDF document parsing as input source.</li><li><strong>UI/UX</strong>: Improved mobile responsiveness for the I Ching module.</li><li><strong>Performance</strong>: Reduced bundle size by 15% by tree-shaking unused icons.</li></ul><h4 class='font-bold text-lg mt-4 mb-2'>🐛 Bug Fixes</h4><ul class='list-disc pl-5 space-y-1'><li>Fixed an issue where 'Nano Banana' model would timeout on slow connections.</li><li>Fixed a layout shift issue in the Focus Game on iPad screens.</li></ul></div>",
    "assets": [
      { "name": "Storyboard-Assistant-v2.3.0-mac-arm64.dmg", "size": "142 MB", "url": "#", "iconType": "apple" },
      { "name": "Storyboard-Assistant-v2.3.0-win-x64.exe", "size": "135 MB", "url": "#", "iconType": "monitor" },
      { "name": "Source code (zip)", "size": "Source", "url": "#", "iconType": "code" }
    ]
  },
  {
    "version": "v2.2.0-beta.1",
    "title": "Beta: Multi-modal Comic Generation",
    "date": "2024-04-15",
    "isLatest": false,
    "isPreRelease": true,
    "author": "CreativeLead",
    "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "commitHash": "e4f1a9",
    "description": "<div class='space-y-4 text-stone-800'><p>A preview release testing the new Multi-modal generation capabilities. <em>Not recommended for production use.</em></p><h4 class='font-bold text-lg mt-4 mb-2'>🚀 Experimental</h4><ul class='list-disc pl-5 space-y-1'><li><strong>Image Gen</strong>: Integrated 'Gemini Pro Vision' for consistent character generation across panels.</li><li><strong>TTS Engine</strong>: Added 'Kore' and 'Fenrir' voice options for audio dubbing.</li></ul></div>",
    "assets": [
      { "name": "Storyboard-Assistant-v2.2.0-beta.1.zip", "size": "120 MB", "url": "#", "iconType": "box" }
    ]
  },
  {
    "version": "v1.0.0",
    "title": "Initial Release",
    "date": "2024-01-01",
    "isLatest": false,
    "isPreRelease": false,
    "author": "Founder",
    "authorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Bear",
    "commitHash": "1a1a1a",
    "description": "<div class='space-y-4 text-stone-800'><p>First public release of <strong>MindSpark: Storyboard Assistant</strong>.</p><h4 class='font-bold text-lg mt-4 mb-2'>Features</h4><ul class='list-disc pl-5 space-y-1'><li>Basic memory training game (Card Flip).</li><li>Focus test (Stroop effect).</li><li>Traditional I Ching divination module.</li></ul></div>",
    "assets": [
      { "name": "Storyboard-Assistant-v1.0.0.zip", "size": "98 MB", "url": "#", "iconType": "box" }
    ]
  }
];