const fs = require('fs');

const htmlPath = './index.html';
const html = fs.readFileSync(htmlPath, 'utf-8');

const themes = [
  'glassmorphism',
  'ios',
  'neumorphism',
  'claymorphism',
  'auroramorphism',
  'neo-brutalism',
  'bento-grid',
  'skeuomorphism',
  'y2k',
  'dopamine',
  'opencode'
];

let addedCSS = '\n      /* --- AUTOMATED THEME FIXES --- */\n';

for (const theme of themes) {
  // Light mode settings
  let tabBg = 'transparent';
  let tabBorder = '1px solid rgba(0,0,0,0.1)';
  let tabShadow = 'none';
  let activeTabBg = 'rgba(0,0,0,0.05)';
  let activeTabBorder = '1px solid rgba(0,0,0,0.2)';
  let activeTabText = 'inherit';
  
  let topicBg = 'transparent';
  let topicBorder = '1px solid rgba(0,0,0,0.1)';
  let optionsBg = 'transparent';
  let optionsBorder = '1px solid rgba(0,0,0,0.1)';
  let selectBg = 'transparent';
  let selectBorder = '1px solid rgba(0,0,0,0.1)';
  let headerBtnBg = 'transparent';
  let headerBtnColor = 'inherit';

  // Dark mode settings
  let d_tabBg = 'transparent';
  let d_tabBorder = '1px solid rgba(255,255,255,0.1)';
  let d_tabShadow = 'none';
  let d_activeTabBg = 'rgba(255,255,255,0.1)';
  let d_activeTabBorder = '1px solid rgba(255,255,255,0.2)';
  let d_activeTabText = 'inherit';
  
  let d_topicBg = 'transparent';
  let d_topicBorder = '1px solid rgba(255,255,255,0.1)';
  let d_optionsBg = 'transparent';
  let d_optionsBorder = '1px solid rgba(255,255,255,0.1)';
  let d_selectBg = 'transparent';
  let d_selectBorder = '1px solid rgba(255,255,255,0.1)';
  let d_headerBtnBg = 'transparent';
  let d_headerBtnColor = 'inherit';

  // Overrides per theme
  if (theme === 'y2k') {
    tabBg = '#ff00ff';
    tabBorder = '2px solid #000';
    tabShadow = '2px 2px 0px #000';
    activeTabBg = '#00ffff';
    activeTabBorder = '2px solid #000';
    activeTabText = '#000 !important';
    topicBg = '#ffff00';
    topicBorder = '2px solid #000';
    optionsBg = '#ff00ff';
    optionsBorder = '2px solid #000';
    selectBg = '#ffffff';
    selectBorder = '2px solid #000';
    headerBtnBg = '#00ffff';
    headerBtnColor = '#000 !important';
    
    // Copy to dark
    d_tabBg = tabBg; d_tabBorder = tabBorder; d_tabShadow = tabShadow;
    d_activeTabBg = activeTabBg; d_activeTabBorder = activeTabBorder; d_activeTabText = activeTabText;
    d_topicBg = topicBg; d_topicBorder = topicBorder; d_optionsBg = optionsBg; d_optionsBorder = optionsBorder;
    d_selectBg = selectBg; d_selectBorder = selectBorder; d_headerBtnBg = headerBtnBg;
    d_headerBtnColor = headerBtnColor;
    
  } else if (theme === 'neo-brutalism' || theme === 'dopamine') {
    tabBg = '#ffffff';
    tabBorder = '2px solid #000';
    tabShadow = '3px 3px 0px #000';
    activeTabBg = '#ff90e8';
    activeTabBorder = '2px solid #000';
    activeTabText = '#000 !important';
    topicBg = '#ffc900';
    topicBorder = '2px solid #000';
    optionsBg = '#f4f4f4';
    optionsBorder = '2px solid #000';
    selectBg = '#fff';
    selectBorder = '2px solid #000';
    headerBtnBg = '#fff';
    headerBtnColor = '#000 !important';

    if (theme === 'dopamine') {
      activeTabBg = '#FF3B30';
      activeTabBorder = 'none';
      tabBorder = 'none';
      topicBorder = 'none';
      selectBorder = 'none';
      optionsBorder = 'none';
      tabShadow = 'none';
      d_tabShadow = 'none';
    }

    // Copy to dark
    d_tabBg = tabBg; d_tabBorder = tabBorder; d_tabShadow = tabShadow;
    d_activeTabBg = activeTabBg; d_activeTabBorder = activeTabBorder; d_activeTabText = activeTabText;
    d_topicBg = topicBg; d_topicBorder = topicBorder; d_optionsBg = optionsBg; d_optionsBorder = optionsBorder;
    d_selectBg = selectBg; d_selectBorder = selectBorder; d_headerBtnBg = headerBtnBg;
    d_headerBtnColor = headerBtnColor;

  } else if (theme === 'ios') {
    tabBg = 'rgba(255,255,255,0.7)';
    tabBorder = 'none';
    tabShadow = 'none';
    activeTabBg = '#ffffff';
    activeTabBorder = 'none';
    activeTabText = '#000 !important';
    topicBg = 'rgba(255,255,255,0.5)';
    topicBorder = 'none';
    optionsBg = 'rgba(255,255,255,0.5)';
    optionsBorder = 'none';
    selectBg = 'rgba(255,255,255,0.7)';
    selectBorder = 'none';
    headerBtnBg = 'rgba(255,255,255,0.8)';
    headerBtnColor = '#000 !important';

    // Dark
    d_tabBg = 'rgba(0,0,0,0.5)';
    d_tabBorder = 'none';
    d_tabShadow = 'none';
    d_activeTabBg = '#333333';
    d_activeTabBorder = 'none';
    d_activeTabText = '#ffffff !important';
    d_topicBg = 'rgba(0,0,0,0.4)';
    d_topicBorder = 'none';
    d_optionsBg = 'rgba(0,0,0,0.4)';
    d_optionsBorder = 'none';
    d_selectBg = 'rgba(255,255,255,0.1)';
    d_selectBorder = 'none';
    d_headerBtnBg = 'rgba(255,255,255,0.1)';
    d_headerBtnColor = '#fff !important';

  } else if (theme === 'opencode') {
    tabBg = '#1e1e1e !important';
    tabBorder = '1px solid #333';
    activeTabBg = '#2d2d2d';
    activeTabBorder = '1px solid #666';
    activeTabText = '#569CD6 !important';
    topicBg = '#1e1e1e';
    topicBorder = '1px dotted #555';
    optionsBg = '#1e1e1e';
    optionsBorder = '1px solid #333';
    selectBg = '#1e1e1e';
    selectBorder = '1px solid #555';
    headerBtnBg = '#1e1e1e';
    headerBtnColor = '#d4d4d4 !important';

    // Copy to dark
    d_tabBg = tabBg; d_tabBorder = tabBorder; d_tabShadow = tabShadow;
    d_activeTabBg = activeTabBg; d_activeTabBorder = activeTabBorder; d_activeTabText = activeTabText;
    d_topicBg = topicBg; d_topicBorder = topicBorder; d_optionsBg = optionsBg; d_optionsBorder = optionsBorder;
    d_selectBg = selectBg; d_selectBorder = selectBorder; d_headerBtnBg = headerBtnBg;
    d_headerBtnColor = headerBtnColor;

  } else {
    // Glassy / general defaults 
    tabBg = 'rgba(255,255,255,0.4)';
    tabBorder = '1px solid rgba(255,255,255,0.6)';
    activeTabBg = 'rgba(255,255,255,0.8)';
    activeTabBorder = '1px solid rgba(255,255,255,0.9)';
    topicBg = 'rgba(255,255,255,0.3)';
    topicBorder = '1px solid rgba(255,255,255,0.5)';
    optionsBg = 'rgba(255,255,255,0.3)';
    optionsBorder = '1px solid rgba(255,255,255,0.5)';
    selectBg = 'transparent';
    selectBorder = 'none';
    headerBtnBg = 'rgba(255,255,255,0.5)';
    headerBtnColor = 'inherit';

    // Dark
    d_tabBg = 'rgba(0,0,0,0.3)';
    d_tabBorder = '1px solid rgba(255,255,255,0.1)';
    d_activeTabBg = 'rgba(255,255,255,0.1)';
    d_activeTabBorder = '1px solid rgba(255,255,255,0.3)';
    d_topicBg = 'rgba(0,0,0,0.2)';
    d_topicBorder = '1px solid rgba(255,255,255,0.1)';
    d_optionsBg = 'rgba(0,0,0,0.2)';
    d_optionsBorder = '1px solid rgba(255,255,255,0.1)';
    d_selectBg = 'transparent';
    d_selectBorder = 'none';
    d_headerBtnBg = 'rgba(255,255,255,0.1)';
    d_headerBtnColor = 'inherit';
  }

  // Generate CSS Light
  addedCSS += `
      /* Theme: ${theme} fixes - LIGHT */
      body[data-theme="${theme}"] [class*="bg-gray-200/50"] {
        background: ${tabBg} !important;
        border: ${tabBorder} !important;
        box-shadow: ${tabShadow} !important;
      }
      body[data-theme="${theme}"] [class*="bg-gray-200/50"] button [layoutid="activeTab"],
      body[data-theme="${theme}"] [class*="bg-gray-200/50"] [class*="bg-white"] {
        background: ${activeTabBg} !important;
        border: ${activeTabBorder} !important;
        box-shadow: ${tabShadow} !important;
      }
      body[data-theme="${theme}"] [class*="bg-gray-200/50"] button {
        color: ${activeTabText === 'inherit' ? 'currentColor' : activeTabText} !important;
      }
      body[data-theme="${theme}"] [class*="bg-gray-200/50"] button:hover {
        opacity: 0.8 !important;
      }

      body[data-theme="${theme}"] [class*="bg-indigo-50/50"] {
        background: ${topicBg} !important;
        border: ${topicBorder} !important;
        box-shadow: ${tabShadow} !important;
      }

      body[data-theme="${theme}"] [class*="bg-gray-100/80"] {
        background: ${optionsBg} !important;
        border: ${optionsBorder} !important;
        box-shadow: ${tabShadow} !important;
      }

      body[data-theme="${theme}"] select {
        background-color: ${selectBg} !important;
        border: ${selectBorder} !important;
        box-shadow: ${tabShadow} !important;
        background-image: none !important;
      }
      body[data-theme="${theme}"] select:focus {
        outline: none !important;
      }

      body[data-theme="${theme}"] [class*="bg-white"][class*="border"]:has(select) {
        background: ${selectBg} !important;
        border: ${selectBorder} !important;
        box-shadow: ${tabShadow} !important;
      }

      body[data-theme="${theme}"] header button {
        background: ${headerBtnBg} !important;
        border: ${selectBorder} !important;
        box-shadow: ${tabShadow} !important;
        color: ${headerBtnColor} !important;
      }

      body[data-theme="${theme}"] .option-btn {
        background: ${optionsBg} !important;
        border: ${selectBorder} !important;
        box-shadow: ${tabShadow} !important;
        color: inherit !important;
      }
      body[data-theme="${theme}"] .option-btn.option-selected {
        background: ${activeTabBg} !important;
        border: ${activeTabBorder} !important;
        box-shadow: ${tabShadow} !important;
        color: ${activeTabText} !important;
      }
      
      /* Theme: ${theme} fixes - DARK */
      html.dark body[data-theme="${theme}"] [class*="dark:bg-zinc-900/80"] {
        background: ${d_tabBg} !important;
        border: ${d_tabBorder} !important;
        box-shadow: ${d_tabShadow} !important;
      }
      html.dark body[data-theme="${theme}"] [class*="bg-gray-200/50"] button [layoutid="activeTab"],
      html.dark body[data-theme="${theme}"] [class*="bg-gray-200/50"] [class*="dark:bg-zinc-700"] {
        background: ${d_activeTabBg} !important;
        border: ${d_activeTabBorder} !important;
        box-shadow: ${d_tabShadow} !important;
      }
      html.dark body[data-theme="${theme}"] [class*="bg-gray-200/50"] button {
        color: ${d_activeTabText === 'inherit' ? 'currentColor' : d_activeTabText} !important;
      }

      html.dark body[data-theme="${theme}"] [class*="dark:bg-indigo-900/10"] {
        background: ${d_topicBg} !important;
        border: ${d_topicBorder} !important;
        box-shadow: ${d_tabShadow} !important;
      }

      html.dark body[data-theme="${theme}"] [class*="dark:bg-zinc-900/80"] {
        background: ${d_optionsBg} !important;
        border: ${d_optionsBorder} !important;
        box-shadow: ${d_tabShadow} !important;
      }

      html.dark body[data-theme="${theme}"] select {
        background-color: ${d_selectBg} !important;
        border: ${d_selectBorder} !important;
        box-shadow: ${d_tabShadow} !important;
      }

      html.dark body[data-theme="${theme}"] [class*="dark:bg-zinc-800"]:has(select) {
        background: ${d_selectBg} !important;
        border: ${d_selectBorder} !important;
        box-shadow: ${d_tabShadow} !important;
      }

      html.dark body[data-theme="${theme}"] header button {
        background: ${d_headerBtnBg} !important;
        border: ${d_selectBorder} !important;
        box-shadow: ${d_tabShadow} !important;
        color: ${d_headerBtnColor} !important;
      }

      html.dark body[data-theme="${theme}"] .option-btn {
        background: ${d_optionsBg} !important;
        border: ${d_selectBorder} !important;
        box-shadow: ${d_tabShadow} !important;
        color: inherit !important;
      }
      html.dark body[data-theme="${theme}"] .option-btn.option-selected {
        background: ${d_activeTabBg} !important;
        border: ${d_activeTabBorder} !important;
        box-shadow: ${d_tabShadow} !important;
        color: ${d_activeTabText} !important;
      }
  `;
}

// Insert before closing style tag
const insertPos = html.lastIndexOf('</style>');
if (insertPos !== -1) {
  const newHtml = html.slice(0, insertPos) + addedCSS + html.slice(insertPos);
  fs.writeFileSync(htmlPath, newHtml, 'utf-8');
  console.log('Successfully injected CSS.');
} else {
  console.error('Could not find </style> tag.');
}
