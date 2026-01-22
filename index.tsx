import React, { useState, useEffect, useRef } from 'react';
import { 
  Clipboard, Image as ImageIcon, FileText, Trash2, Download, Copy, 
  X, UploadCloud, CheckCircle, Moon, Sun, Globe, Heart, 
  LayoutGrid, Type, Image as ImageIconBtn, QrCode, Maximize2, Menu,
  Github, Coffee, Sparkles, Share2, Edit2, Save, Pin, Palette
} from 'lucide-react';

// --- KAMUS BAHASA ---
const DICTIONARY = {
  id: {
    app_name: "Sanop",
    slogan: "Tempel Apa Saja",
    paste_instruction: "Tekan Ctrl + V di mana saja",
    sidebar: {
      all: "Semua Item",
      text: "Hanya Teks",
      image: "Hanya Gambar",
      pinned: "Disematkan",
      theme: "Tema",
      language: "Bahasa",
      support: "Dukungan",
      created_by: "Dibuat oleh Sanop Dev"
    },
    empty_state: {
      title: "Area Kosong",
      desc: "Tekan Ctrl + V atau tarik file ke sini.",
      drop_active: "Lepaskan di sini!"
    },
    actions: {
      copy: "Salin",
      download: "Unduh",
      delete: "Hapus",
      clear_all: "Hapus Semua",
      qr_view: "Lihat QR",
      preview: "Perbesar",
      share: "Bagikan",
      pin: "Sematkan",
      unpin: "Lepas Sematan",
      edit: "Edit",
      save: "Simpan"
    },
    toast: {
      copied: "Disalin ke clipboard!",
      image_saved: "Gambar berhasil disimpan!",
      deleted: "Item dihapus.",
      cleared: "Semua item dibersihkan.",
      welcome: "Selamat datang kembali!",
      storage_full: "Penyimpanan penuh! Hapus beberapa item.",
      shared: "Berhasil dibagikan!"
    },
    support_modal: {
      title: "Dukung Pengembangan",
      desc: "Jika aplikasi ini berguna, pertimbangkan untuk memberi dukungan agar kami bisa terus berkembang.",
      action: "Traktir Kopi"
    }
  },
  en: {
    app_name: "Sanop",
    slogan: "Paste Anything",
    paste_instruction: "Press Ctrl + V anywhere",
    sidebar: {
      all: "All Items",
      text: "Text Only",
      image: "Images Only",
      pinned: "Pinned",
      theme: "Theme",
      language: "Language",
      support: "Support",
      created_by: "Created by Sanop Dev"
    },
    empty_state: {
      title: "Empty Space",
      desc: "Press Ctrl + V or drag files here.",
      drop_active: "Drop it here!"
    },
    actions: {
      copy: "Copy",
      download: "Download",
      delete: "Delete",
      clear_all: "Clear All",
      qr_view: "View QR",
      preview: "Preview",
      share: "Share",
      pin: "Pin",
      unpin: "Unpin",
      edit: "Edit",
      save: "Save"
    },
    toast: {
      copied: "Copied to clipboard!",
      image_saved: "Image saved successfully!",
      deleted: "Item deleted.",
      cleared: "All items cleared.",
      welcome: "Welcome back!",
      storage_full: "Storage full! Please delete some items.",
      shared: "Shared successfully!"
    },
    support_modal: {
      title: "Support Development",
      desc: "If you find this useful, consider supporting us to keep the updates coming.",
      action: "Buy me a Coffee"
    }
  }
};

export default function App() {
  // --- STATE MANAGEMENT ---
  // Load initial items from localStorage
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sanop_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toast, setToast] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Preferences
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('id'); 
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'text', 'image', 'pinned'
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Modals & Editing
  const [previewImage, setPreviewImage] = useState(null);
  const [qrText, setQrText] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const t = DICTIONARY[lang];

  // --- PERSISTENCE & THEME ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('sanop_theme');
    if (savedTheme === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('sanop_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Save items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('sanop_items', JSON.stringify(items));
    } catch (e) {
      showToast(t.toast.storage_full);
    }
  }, [items, t.toast.storage_full]);

  // --- CORE FUNCTIONS ---

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const isColorCode = (text) => /^#([0-9A-F]{3}){1,2}$/i.test(text);

  const processItem = (dataTransfer) => {
    const itemsList = dataTransfer.items;
    if (!itemsList) return;

    for (let i = 0; i < itemsList.length; i++) {
      const item = itemsList[i];

      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setItems((prev) => [
            {
              id: generateId(),
              type: 'image',
              content: event.target.result,
              timestamp: new Date().toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US'),
              details: `${(blob.size / 1024).toFixed(1)} KB`,
              pinned: false
            },
            ...prev
          ]);
          showToast(t.toast.image_saved);
        };
        reader.readAsDataURL(blob);
      } 
      else if (item.type.indexOf('text/plain') !== -1) {
        item.getAsString((text) => {
          if (text.trim() === "") return;
          setItems((prev) => [
            {
              id: generateId(),
              type: 'text',
              content: text,
              timestamp: new Date().toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US'),
              details: `${text.length} chars`,
              pinned: false,
              isColor: isColorCode(text)
            },
            ...prev
          ]);
          showToast(t.toast.copied);
        });
      }
    }
  };

  // --- EVENT LISTENERS ---
  useEffect(() => {
    const handlePaste = (e) => {
      // Don't paste if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      processItem(e.clipboardData);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [lang]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processItem(e.dataTransfer);
  };

  // --- ACTIONS ---

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast(t.toast.deleted);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    showToast(t.toast.copied);
  };

  const downloadImage = (base64Data, id) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = `sanop-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    if (confirm(t.actions.clear_all + '?')) {
      setItems([]);
      showToast(t.toast.cleared);
    }
  };

  const togglePin = (id) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, pinned: !item.pinned } : item
    ));
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditText(item.content);
  };

  const saveEdit = (id) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        content: editText, 
        isColor: isColorCode(editText),
        details: `${editText.length} chars (edited)`
      } : item
    ));
    setEditingId(null);
  };

  const handleShare = async (item) => {
    if (navigator.share) {
      try {
        if (item.type === 'text') {
          await navigator.share({
            title: 'Sanop Share',
            text: item.content,
          });
        } else {
          // Sharing images requires converting base64 back to blob
          const res = await fetch(item.content);
          const blob = await res.blob();
          const file = new File([blob], `sanop-share.png`, { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: 'Sanop Image'
          });
        }
        showToast(t.toast.shared);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      showToast("Web Share API not supported on this browser.");
    }
  };

  // --- FILTERING ---
  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pinned') return item.pinned;
    return item.type === activeFilter;
  }).sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1)); // Always show pinned first

  // --- UI COMPONENTS ---

  const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
          ? (darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600') 
          : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700')
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'animate-pulse' : ''} />
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge && <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{badge}</span>}
    </button>
  );

  return (
    <div 
      className={`min-h-screen flex transition-colors duration-500 overflow-hidden relative ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'} font-sans`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Background Decorative Gradients */}
      <div className={`fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 pointer-events-none ${darkMode ? 'bg-blue-900' : 'bg-blue-200'}`} />
      <div className={`fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 pointer-events-none ${darkMode ? 'bg-purple-900' : 'bg-purple-200'}`} />

      {/* --- SIDEBAR --- */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20 xl:w-64'
        } ${darkMode ? 'bg-[#1e293b]/80 border-slate-700' : 'bg-white/80 border-slate-200'} backdrop-blur-xl border-r flex flex-col shadow-2xl lg:shadow-none`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-transparent">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-xl shadow-lg shadow-blue-500/30">
              <Clipboard size={24} />
            </div>
            <div className={`block lg:hidden xl:block`}>
              <h1 className="text-xl font-bold tracking-tight">Sanop<span className="text-blue-500">.</span></h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarItem 
            icon={LayoutGrid} 
            label={t.sidebar.all} 
            active={activeFilter === 'all'} 
            onClick={() => setActiveFilter('all')} 
            badge={items.length}
          />
          <SidebarItem 
            icon={Pin} 
            label={t.sidebar.pinned} 
            active={activeFilter === 'pinned'} 
            onClick={() => setActiveFilter('pinned')} 
            badge={items.filter(i => i.pinned).length || null}
          />
          <SidebarItem 
            icon={Type} 
            label={t.sidebar.text} 
            active={activeFilter === 'text'} 
            onClick={() => setActiveFilter('text')} 
          />
          <SidebarItem 
            icon={ImageIconBtn} 
            label={t.sidebar.image} 
            active={activeFilter === 'image'} 
            onClick={() => setActiveFilter('image')} 
          />
          
          <div className={`my-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`} />

          <SidebarItem 
            icon={darkMode ? Sun : Moon} 
            label={t.sidebar.theme} 
            onClick={() => setDarkMode(!darkMode)} 
          />
          <SidebarItem 
            icon={Globe} 
            label={`${t.sidebar.language} (${lang.toUpperCase()})`} 
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')} 
          />
          <SidebarItem 
            icon={Heart} 
            label={t.sidebar.support} 
            onClick={() => setShowSupport(true)} 
          />
        </nav>

        <div className={`p-4 text-xs text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'} lg:hidden xl:block`}>
          <p>© 2024 {t.sidebar.created_by}</p>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        
        {/* Header */}
        <header className={`h-20 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0 ${darkMode ? 'bg-[#0f172a]/80' : 'bg-[#f8fafc]/80'} backdrop-blur-md`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {activeFilter === 'all' ? t.sidebar.all : activeFilter === 'text' ? t.sidebar.text : activeFilter === 'image' ? t.sidebar.image : t.sidebar.pinned}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {items.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                  <Trash2 size={14} /> <span className="hidden sm:inline">{t.actions.clear_all}</span>
                </button>
             )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-20 custom-scrollbar">
          
          <div className="max-w-4xl mx-auto mt-4 mb-8">
            <div className={`rounded-2xl p-1 flex items-center justify-center gap-2 text-sm font-medium ${darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-white text-slate-500'} shadow-sm border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
               <Sparkles size={14} className="text-yellow-500" />
               {t.paste_instruction}
            </div>
          </div>

          {items.length === 0 && (
            <div className={`mt-10 max-w-lg mx-auto border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
              isDragging 
                ? 'border-blue-500 bg-blue-500/10 scale-105' 
                : (darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-white/50')
            }`}>
              <div className="flex justify-center mb-6">
                <div className={`p-6 rounded-full shadow-xl ${isDragging ? 'bg-blue-500 text-white animate-bounce' : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-400')}`}>
                  <UploadCloud size={48} />
                </div>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {isDragging ? t.empty_state.drop_active : t.empty_state.title}
              </h2>
              <p className={`${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {t.empty_state.desc}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className={`group relative rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 ${
                  darkMode ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-blue-200'
                } ${item.pinned ? (darkMode ? 'ring-2 ring-yellow-500/30' : 'ring-2 ring-yellow-400/50') : ''}`}
              >
                {/* Card Header */}
                <div className={`flex justify-between items-center p-3 border-b ${darkMode ? 'border-slate-700 bg-slate-800/80' : 'border-slate-100 bg-slate-50/80'}`}>
                  <div className="flex items-center gap-2">
                    {item.type === 'image' ? (
                      <ImageIcon size={14} className="text-purple-500" />
                    ) : (
                      <FileText size={14} className="text-blue-500" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{item.type}</span>
                    {item.isColor && (
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.content }}></div>
                        Color
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => togglePin(item.id)} 
                      className={`transition-colors ${item.pinned ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-400'}`}
                      title={item.pinned ? t.actions.unpin : t.actions.pin}
                    >
                      <Pin size={14} fill={item.pinned ? "currentColor" : "none"} />
                    </button>
                    <div className="text-[10px] opacity-50 font-mono">{item.timestamp}</div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-grow relative min-h-[160px] flex flex-col">
                  {item.type === 'image' ? (
                    <div className="relative group/img h-48 w-full rounded-lg overflow-hidden bg-slate-900/10 cursor-pointer" onClick={() => setPreviewImage(item.content)}>
                      <img src={item.content} alt="Pasted" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                         <Maximize2 className="text-white drop-shadow-md" size={24} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {editingId === item.id ? (
                        <textarea 
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className={`w-full h-48 p-3 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-slate-900 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        />
                      ) : (
                        <div className={`relative p-3 rounded-lg border text-sm font-mono break-words leading-relaxed h-48 overflow-y-auto custom-scrollbar ${darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          {item.content}
                          {item.isColor && (
                            <div 
                              className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: item.content }}
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Footer Meta */}
                  <div className="mt-3 flex justify-between items-center">
                     <span className="text-[10px] opacity-40">{item.details}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className={`p-2 grid grid-cols-4 gap-2 border-t transition-colors ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
                   
                   {/* Col 1: Primary Action */}
                   {editingId === item.id ? (
                      <button onClick={() => saveEdit(item.id)} className="card-btn col-span-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white" title={t.actions.save}>
                        <Save size={16} /> <span className="ml-1 text-xs">{t.actions.save}</span>
                      </button>
                   ) : (
                     <button onClick={() => copyText(item.content)} className="card-btn" title={t.actions.copy}>
                       <Copy size={16} />
                     </button>
                   )}

                   {/* Col 2 & 3 */}
                   {item.type === 'text' && editingId !== item.id && (
                     <>
                       <button onClick={() => startEditing(item)} className="card-btn" title={t.actions.edit}>
                         <Edit2 size={16} />
                       </button>
                       <button onClick={() => setQrText(item.content)} className="card-btn" title={t.actions.qr_view}>
                         <QrCode size={16} />
                       </button>
                     </>
                   )}

                   {item.type === 'image' && (
                     <>
                      <button onClick={() => downloadImage(item.content, item.id)} className="card-btn" title={t.actions.download}>
                        <Download size={16} />
                      </button>
                      <button onClick={() => setPreviewImage(item.content)} className="card-btn" title={t.actions.preview}>
                        <Maximize2 size={16} />
                      </button>
                     </>
                   )}

                   {/* Share Button (All types) */}
                    {editingId !== item.id && (
                       <button onClick={() => handleShare(item)} className="card-btn" title={t.actions.share}>
                         <Share2 size={16} />
                       </button>
                    )}

                   {/* Delete Button (Always last) */}
                   <button onClick={() => deleteItem(item.id)} className={`card-btn text-red-400 hover:bg-red-500 hover:text-white ${editingId === item.id ? 'col-span-2' : ''}`} title={t.actions.delete}>
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- OVERLAYS & MODALS --- */}

      {/* Drag Overlay */}
      {isDragging && items.length > 0 && (
        <div className="fixed inset-0 bg-blue-600/30 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce">
             <UploadCloud size={64} className="text-blue-600 mb-4" />
             <span className="text-2xl font-bold text-slate-800">{t.empty_state.drop_active}</span>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
            <X size={32} />
          </button>
          <img src={previewImage} alt="Full Preview" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      {/* QR Code Modal */}
      {qrText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`relative w-full max-w-sm p-6 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <button onClick={() => setQrText(null)} className="absolute top-4 right-4 opacity-50 hover:opacity-100">
              <X size={24} />
            </button>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><QrCode size={20}/> QR Code</h3>
            <div className="flex justify-center bg-white p-4 rounded-xl">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`} 
                alt="QR Code" 
                className="w-48 h-48"
              />
            </div>
            <p className="mt-4 text-center text-sm opacity-60 break-all line-clamp-2">
              {qrText}
            </p>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`relative w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <button onClick={() => setShowSupport(false)} className="absolute top-4 right-4 opacity-50 hover:opacity-100">
              <X size={24} />
            </button>
            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart fill="currentColor" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t.support_modal.title}</h3>
            <p className="text-sm opacity-70 mb-6 leading-relaxed">
              {t.support_modal.desc}
            </p>
            <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2">
              <Coffee size={20} /> {t.support_modal.action}
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl shadow-blue-900/20 flex items-center gap-3 animate-in slide-in-from-right-10 z-[60]">
          <CheckCircle size={20} className="text-green-400" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}

      {/* Styles Injection */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background-color: ${darkMode ? '#334155' : '#cbd5e1'}; 
          border-radius: 20px; 
        }
        .card-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 8px; border-radius: 8px; transition: all 0.2s;
          background: ${darkMode ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)'};
          color: ${darkMode ? '#94a3b8' : '#64748b'};
        }
        .card-btn:hover {
          background: ${darkMode ? '#3b82f6' : '#e2e8f0'};
          color: ${darkMode ? '#fff' : '#0f172a'};
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
