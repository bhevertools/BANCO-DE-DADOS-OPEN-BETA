
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Loader2, RefreshCw, LayoutGrid, Zap, Clock, Filter, ListMusic, BrainCircuit, Smile, X, ArrowRight, ArrowLeft, UserCircle, Target, Layers, Box, Maximize, Tag, Baby } from 'lucide-react';
import Sidebar from './components/Sidebar';
import AssetCard from './components/AssetCard';
import AddAssetForm from './components/AddAssetForm';
import AuthGate from './components/AuthGate';
import LogoutButton from './components/LogoutButton';
import FolderCard from './components/FolderCard';
import Breadcrumb from './components/Breadcrumb';
import CreateFolderModal from './components/CreateFolderModal';
import { CATEGORIES_CONFIG } from './constants';
import { AssetCategory, UnifiedAsset, Folder } from './types';
import { supabase } from './lib/supabase';
import { saveAsset, deleteAsset } from './actions';

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="relative">
        {/* Glowing Central Dot */}
        <div className="w-1 h-1 bg-[#FFD700] rounded-full animate-[ping_1.5s_infinite] shadow-[0_0_15px_#FFD700]" />
        
        {/* Loading Bar */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/5 overflow-hidden">
          <div className="h-full bg-[#FFD700] animate-[load_2s_ease-in-out_forwards] shadow-[0_0_8px_#FFD700]" />
        </div>

        {/* Branding Reveal */}
        <div className="mt-16 text-center animate-[fade-up_1s_ease-out_0.5s_both]">
          <span className="text-3xl font-black text-white tracking-tighter">
            BH<span className="text-[#FFD700]">•</span>EVER
          </span>
          <div className="text-[8px] font-black text-gray-500 tracking-[0.5em] uppercase mt-2">
            Database Initialization
          </div>
        </div>
      </div>

      <style>{`
        @keyframes load {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 60%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </div>
  );
};

interface StatCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, count, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="group flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-[#050505] hover:bg-white/5 hover:border-[#FFD700]/20 transition-all cursor-pointer text-center"
  >
    <div className="text-[#FFD700] mb-2 transition-transform group-hover:scale-110">
      {icon}
    </div>
    <div className="text-2xl font-black text-[#FFD700] mb-0.5 tracking-tighter">
      {count}
    </div>
    <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] group-hover:text-gray-300 transition-colors">
      {label}
    </div>
  </div>
);

const MainApp: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'ALL'>('ALL');
  const [dbData, setDbData] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<{ asset: any, category: AssetCategory } | null>(null);

  // Folders (Google Drive style)
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);
  const [folderViewMode, setFolderViewMode] = useState<'ROOT' | 'FOLDER'>('ROOT');
  type ActiveFolder = { type: 'ROOT' } | { type: 'FOLDER'; id: string | 'RAW' };
  const [activeFolder, setActiveFolder] = useState<ActiveFolder>({ type: 'ROOT' });
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);

  // Audio Filters State
  const [vslMomentFilter, setVslMomentFilter] = useState('');
  const [emotionFilter, setEmotionFilter] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState('');

  // TikTok Filters State
  const [tiktokNichoFilter, setTiktokNichoFilter] = useState('');
  const [tiktokGeneroFilter, setTiktokGeneroFilter] = useState('');
  const [tiktokTipoFilter, setTiktokTipoFilter] = useState('');

  // VEO 3 Filters State
  const [veoProdutoFilter, setVeoProdutoFilter] = useState('');
  const [veoDimensaoFilter, setVeoDimensaoFilter] = useState('');
  const [veoTagFilter, setVeoTagFilter] = useState('');

  // Social Proof Filters State
  const [socialProofNichoFilter, setSocialProofNichoFilter] = useState('');
  const [socialProofGeneroFilter, setSocialProofGeneroFilter] = useState('');

  // UGC Filters State
  const [ugcGeneroFilter, setUgcGeneroFilter] = useState('');
  const [ugcFaixaEtariaFilter, setUgcFaixaEtariaFilter] = useState('');

  // Deepfakes Filters State
  const [deepfakesPersonagemFilter, setDeepfakesPersonagemFilter] = useState('');
  const [deepfakesVersaoFilter, setDeepfakesVersaoFilter] = useState('');
  const [deepfakesTagFilter, setDeepfakesTagFilter] = useState('');
  const [deepfakesOnlyWithVoice, setDeepfakesOnlyWithVoice] = useState(false);
  const [deepfakesOnlyWithOriginal, setDeepfakesOnlyWithOriginal] = useState(false);

  // Voice Clones Filters State
  const [voiceCloneTagFilter, setVoiceCloneTagFilter] = useState('');
  const [voiceCloneDurationFilter, setVoiceCloneDurationFilter] = useState('');

  type ViewState = {
    activeCategory: AssetCategory | 'ALL';
    searchQuery: string;
    folderViewMode: 'ROOT' | 'FOLDER';
    activeFolder: ActiveFolder;
    filters: {
      vslMomentFilter: string;
      emotionFilter: string;
      activeTagFilter: string;
      tiktokNichoFilter: string;
      tiktokGeneroFilter: string;
      tiktokTipoFilter: string;
      veoProdutoFilter: string;
      veoDimensaoFilter: string;
      veoTagFilter: string;
      socialProofNichoFilter: string;
      socialProofGeneroFilter: string;
      ugcGeneroFilter: string;
      ugcFaixaEtariaFilter: string;
      deepfakesPersonagemFilter: string;
      deepfakesVersaoFilter: string;
      deepfakesTagFilter: string;
      deepfakesOnlyWithVoice: boolean;
      deepfakesOnlyWithOriginal: boolean;
      voiceCloneTagFilter: string;
      voiceCloneDurationFilter: string;
    };
  };

  const [navStack, setNavStack] = useState<ViewState[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const results: any = {};
      for (const cat of CATEGORIES_CONFIG) {
        const { data, error } = await supabase.from(cat.table).select('*').order('created_at', { ascending: false });
        if (error) {
          console.error(`Erro ao carregar tabela ${cat.table}:`, error);
          results[cat.id] = [];
        } else {
          results[cat.id] = data || [];
        }
      }
      setDbData(results);
    } catch (err) {
      console.error('Erro fatal no fetch:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFolders = useCallback(async () => {
    setIsFoldersLoading(true);
    try {
      const { data, error } = await supabase.from('folders').select('*').order('name', { ascending: true });
      if (error) {
        console.error('Erro ao carregar pastas:', error);
        setFolders([]);
      } else {
        setFolders((data || []) as Folder[]);
      }
    } catch (err) {
      console.error('Erro fatal no fetchFolders:', err);
      setFolders([]);
    } finally {
      setIsFoldersLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); fetchFolders(); }, [fetchData, fetchFolders]);

  const resetAllFilters = useCallback(() => {
    setVslMomentFilter('');
    setEmotionFilter('');
    setActiveTagFilter('');
    setTiktokNichoFilter('');
    setTiktokGeneroFilter('');
    setTiktokTipoFilter('');
    setVeoProdutoFilter('');
    setVeoDimensaoFilter('');
    setVeoTagFilter('');
    setSocialProofNichoFilter('');
    setSocialProofGeneroFilter('');
    setUgcGeneroFilter('');
    setUgcFaixaEtariaFilter('');
    setDeepfakesPersonagemFilter('');
    setDeepfakesVersaoFilter('');
    setDeepfakesTagFilter('');
    setDeepfakesOnlyWithVoice(false);
    setDeepfakesOnlyWithOriginal(false);
    setVoiceCloneTagFilter('');
    setVoiceCloneDurationFilter('');
  }, []);

  const mapToUnified = (item: any, catId: AssetCategory): UnifiedAsset => {
    switch(catId) {
      case AssetCategory.DEEPFAKES: 
        const dfTitle = item.versao ? `${item.personagem} ${item.versao}` : item.personagem;
        return { id: item.id, title: dfTitle, subtitle: item.versao || 'Final', imageUrl: item.imagem_descritiva, link: item.video_link, duration: item.duracao, category: catId, assetType: 'video', tags: item.tags || [], raw: item };
      case AssetCategory.VOICE_CLONES: return { id: item.id, title: item.voz_nome, subtitle: 'Voice Clone', imageUrl: '', link: item.link_minimax, duration: item.duracao, category: catId, assetType: 'voice', tags: item.tags || [], raw: item };
      case AssetCategory.ORIGINAL_VIDEOS: return { id: item.id, title: item.nome_video, subtitle: 'Vídeo Bruto', imageUrl: '', link: item.link_video_original, category: catId, assetType: 'video', tags: item.tags || [], raw: item };
      case AssetCategory.TIKTOK: return { id: item.id, title: item.nicho || 'TikTok', subtitle: item.tipo, imageUrl: '', link: item.link_video, category: catId, assetType: 'video', tags: item.tags || [], raw: item };
      case AssetCategory.MUSIC:
      case AssetCategory.SFX: 
        return { 
          id: item.id, 
          title: item.nome || item.momento_vsl || 'Asset de Áudio', 
          subtitle: `${item.emocao || 'Vibe Neutra'} • ${item.momento_vsl || 'Geral'}`, 
          imageUrl: '', 
          link: item.link_audio, 
          category: catId, 
          assetType: 'audio', 
          tags: item.tags || [], 
          raw: item 
        };
      case AssetCategory.VEO3: return { id: item.id, title: item.produto_insert, subtitle: item.dimensao, imageUrl: '', link: item.link_video, duration: item.duracao, category: catId, assetType: 'video', tags: item.tags || [], raw: item };
      case AssetCategory.SOCIAL_PROOF: return { id: item.id, title: item.nicho || 'Social Proof', subtitle: item.genero, imageUrl: item.link_imagem, link: item.link_imagem, category: catId, assetType: 'image', tags: item.tags || [], raw: item };
      case AssetCategory.UGC_TESTIMONIALS: return { id: item.id, title: `UGC: ${item.genero}`, subtitle: item.idade, imageUrl: '', link: item.link_video, duration: item.duracao, category: catId, assetType: 'video', tags: item.tags || [], raw: item };
      default: return { id: item.id, title: 'Asset', subtitle: '', imageUrl: '', link: '', category: catId, assetType: 'other', tags: [], raw: item };
    }
  };

  const activeTableName = useMemo(() => {
    const cfg = CATEGORIES_CONFIG.find(c => c.id === activeCategory);
    return cfg?.table || null;
  }, [activeCategory]);

  const foldersForActiveCategory = useMemo(() => {
    if (!activeTableName) return [];
    return folders.filter(f => f.category === activeTableName && !f.parent_id);
  }, [folders, activeTableName]);

  const handleCreateFolder = async (name: string) => {
    if (!activeTableName) return;
    if (!name || !name.trim()) return;
    const { error } = await supabase.from('folders').insert([{ category: activeTableName, name: name.trim(), parent_id: null }]);
    if (error) {
      alert(`Erro ao criar pasta: ${error.message}`);
      return;
    }
    setShowCreateFolderModal(false);
    await fetchFolders();
  };

  const handleRenameFolder = async (folderId: string) => {
    const f = folders.find(x => x.id === folderId);
    const next = window.prompt('Novo nome da pasta:', f?.name || '');
    if (!next || !next.trim()) return;
    const { error } = await supabase.from('folders').update({ name: next.trim() }).eq('id', folderId);
    if (error) {
      alert(`Erro ao renomear: ${error.message}`);
      return;
    }
    await fetchFolders();
  };

  const handleDeleteFolder = async (folderId: string) => {
    const f = folders.find(x => x.id === folderId);
    const ok = window.confirm(`Deletar a pasta "${f?.name}"?\n\nOs itens dentro ficarão como "Sem pasta".`);
    if (!ok) return;
    const { error } = await supabase.from('folders').delete().eq('id', folderId);
    if (error) {
      alert(`Erro ao deletar: ${error.message}`);
      return;
    }
    if (activeFolder.type === 'FOLDER' && activeFolder.id === folderId) {
      setActiveFolder({ type: 'ROOT' });
      setFolderViewMode('ROOT');
    }
    await fetchFolders();
  };

  const allAssets = useMemo(() => {
    const list: UnifiedAsset[] = [];
    (Object.entries(dbData) as [string, any[]][]).forEach(([catId, items]) => {
      items.forEach(item => list.push(mapToUnified(item, catId as AssetCategory)));
    });
    return list.sort((a, b) => new Date((b.raw as any).created_at).getTime() - new Date((a.raw as any).created_at).getTime());
  }, [dbData]);

  // Voice Map para Link de Voz
  const voiceMap = useMemo(() => {
    const map = new Set<string>();
    allAssets.filter(a => a.category === AssetCategory.VOICE_CLONES).forEach(v => map.add(v.title.toLowerCase()));
    return map;
  }, [allAssets]);

  // Original Video Map para Link de Vídeo Bruto (Busca por título ou tag)
  const originalVideoMap = useMemo(() => {
    const map = new Set<string>();
    allAssets.filter(a => a.category === AssetCategory.ORIGINAL_VIDEOS).forEach(v => {
      map.add(v.title.toLowerCase());
      v.tags.forEach(tag => map.add(tag.toLowerCase()));
    });
    return map;
  }, [allAssets]);

  const assetMatchesFilters = useCallback((
    asset: UnifiedAsset,
    search: string
  ) => {
    const text = (
      asset.title +
      ' ' +
      asset.tags.join(' ')
    ).toLowerCase();

    if (search && !text.includes(search.toLowerCase())) {
      return false;
    }

    const matchesCategory = activeCategory === 'ALL' || asset.category === activeCategory;

    let matchesAudioFilters = true;
    if (activeCategory === AssetCategory.MUSIC || activeCategory === AssetCategory.SFX) {
      const raw = asset.raw as any;
      if (vslMomentFilter && raw.momento_vsl !== vslMomentFilter) matchesAudioFilters = false;
      if (emotionFilter && raw.emocao !== emotionFilter) matchesAudioFilters = false;
      if (activeTagFilter && !asset.tags.includes(activeTagFilter)) matchesAudioFilters = false;
    }

    let matchesTikTokFilters = true;
    if (activeCategory === AssetCategory.TIKTOK) {
      const raw = asset.raw as any;
      if (tiktokNichoFilter && raw.nicho !== tiktokNichoFilter) matchesTikTokFilters = false;
      if (tiktokGeneroFilter && raw.genero !== tiktokGeneroFilter) matchesTikTokFilters = false;
      if (tiktokTipoFilter && raw.tipo !== tiktokTipoFilter) matchesTikTokFilters = false;
    }

    let matchesVeoFilters = true;
    if (activeCategory === AssetCategory.VEO3) {
      const raw = asset.raw as any;
      if (veoProdutoFilter && raw.produto_insert !== veoProdutoFilter) matchesVeoFilters = false;
      if (veoDimensaoFilter && raw.dimensao !== veoDimensaoFilter) matchesVeoFilters = false;
      if (veoTagFilter && !asset.tags.includes(veoTagFilter)) matchesVeoFilters = false;
    }

    let matchesSocialProofFilters = true;
    if (activeCategory === AssetCategory.SOCIAL_PROOF) {
      const raw = asset.raw as any;
      if (socialProofNichoFilter && raw.nicho !== socialProofNichoFilter) matchesSocialProofFilters = false;
      if (socialProofGeneroFilter && raw.genero !== socialProofGeneroFilter) matchesSocialProofFilters = false;
    }

    let matchesUgcFilters = true;
    if (activeCategory === AssetCategory.UGC_TESTIMONIALS) {
      const raw = asset.raw as any;
      if (ugcGeneroFilter && raw.genero !== ugcGeneroFilter) matchesUgcFilters = false;
      if (ugcFaixaEtariaFilter && raw.idade !== ugcFaixaEtariaFilter) matchesUgcFilters = false;
    }

    let matchesDeepfakesFilters = true;
    if (activeCategory === AssetCategory.DEEPFAKES) {
      const raw = asset.raw as any;
      if (deepfakesPersonagemFilter && raw.personagem !== deepfakesPersonagemFilter) matchesDeepfakesFilters = false;
      if (deepfakesVersaoFilter && raw.versao !== deepfakesVersaoFilter) matchesDeepfakesFilters = false;
      if (deepfakesTagFilter && !asset.tags.includes(deepfakesTagFilter)) matchesDeepfakesFilters = false;
      if (deepfakesOnlyWithVoice && !voiceMap.has(asset.title.toLowerCase())) matchesDeepfakesFilters = false;
      if (deepfakesOnlyWithOriginal && !originalVideoMap.has(asset.title.toLowerCase())) matchesDeepfakesFilters = false;
    }

    let matchesVoiceCloneFilters = true;
    if (activeCategory === AssetCategory.VOICE_CLONES) {
      const raw = asset.raw as any;
      if (voiceCloneDurationFilter && raw.duracao !== voiceCloneDurationFilter) matchesVoiceCloneFilters = false;
      if (voiceCloneTagFilter && !asset.tags.includes(voiceCloneTagFilter)) matchesVoiceCloneFilters = false;
    }

    // reaproveita TODOS os filtros já existentes
    return matchesCategory && matchesAudioFilters && matchesTikTokFilters && matchesVeoFilters && matchesSocialProofFilters && matchesUgcFilters && matchesDeepfakesFilters && matchesVoiceCloneFilters;
  }, [
    activeCategory,
    activeTagFilter,
    deepfakesOnlyWithOriginal,
    deepfakesOnlyWithVoice,
    deepfakesPersonagemFilter,
    deepfakesTagFilter,
    deepfakesVersaoFilter,
    emotionFilter,
    originalVideoMap,
    socialProofGeneroFilter,
    socialProofNichoFilter,
    tiktokGeneroFilter,
    tiktokNichoFilter,
    tiktokTipoFilter,
    ugcFaixaEtariaFilter,
    ugcGeneroFilter,
    veoDimensaoFilter,
    veoProdutoFilter,
    veoTagFilter,
    voiceCloneDurationFilter,
    voiceCloneTagFilter,
    voiceMap,
    vslMomentFilter,
  ]);

  const countAssetsInFolder = useCallback((folderId: string | 'RAW') => {
    return allAssets.filter(a => {
      const raw: any = a.raw;

      const matchesFolder =
        folderId === 'RAW'
          ? raw.folder_id === null
          : raw.folder_id === folderId;

      if (!matchesFolder) return false;

      return assetMatchesFilters(a, searchQuery);
    }).length;
  }, [allAssets, assetMatchesFilters, searchQuery]);

  const getCurrentViewState = useCallback((): ViewState => {
    return {
      activeCategory,
      searchQuery,
      folderViewMode,
      activeFolder,
      filters: {
        vslMomentFilter,
        emotionFilter,
        activeTagFilter,
        tiktokNichoFilter,
        tiktokGeneroFilter,
        tiktokTipoFilter,
        veoProdutoFilter,
        veoDimensaoFilter,
        veoTagFilter,
        socialProofNichoFilter,
        socialProofGeneroFilter,
        ugcGeneroFilter,
        ugcFaixaEtariaFilter,
        deepfakesPersonagemFilter,
        deepfakesVersaoFilter,
        deepfakesTagFilter,
        deepfakesOnlyWithVoice,
        deepfakesOnlyWithOriginal,
        voiceCloneTagFilter,
        voiceCloneDurationFilter,
      },
    };
  }, [
    activeCategory,
    searchQuery,
    folderViewMode,
    activeFolder,
    vslMomentFilter,
    emotionFilter,
    activeTagFilter,
    tiktokNichoFilter,
    tiktokGeneroFilter,
    tiktokTipoFilter,
    veoProdutoFilter,
    veoDimensaoFilter,
    veoTagFilter,
    socialProofNichoFilter,
    socialProofGeneroFilter,
    ugcGeneroFilter,
    ugcFaixaEtariaFilter,
    deepfakesPersonagemFilter,
    deepfakesVersaoFilter,
    deepfakesTagFilter,
    deepfakesOnlyWithVoice,
    deepfakesOnlyWithOriginal,
    voiceCloneTagFilter,
    voiceCloneDurationFilter,
  ]);

  const restoreViewState = useCallback((state: ViewState) => {
    setActiveCategory(state.activeCategory);
    setSearchQuery(state.searchQuery);
    setFolderViewMode(state.folderViewMode);
    setActiveFolder(state.activeFolder);

    setVslMomentFilter(state.filters.vslMomentFilter);
    setEmotionFilter(state.filters.emotionFilter);
    setActiveTagFilter(state.filters.activeTagFilter);
    setTiktokNichoFilter(state.filters.tiktokNichoFilter);
    setTiktokGeneroFilter(state.filters.tiktokGeneroFilter);
    setTiktokTipoFilter(state.filters.tiktokTipoFilter);
    setVeoProdutoFilter(state.filters.veoProdutoFilter);
    setVeoDimensaoFilter(state.filters.veoDimensaoFilter);
    setVeoTagFilter(state.filters.veoTagFilter);
    setSocialProofNichoFilter(state.filters.socialProofNichoFilter);
    setSocialProofGeneroFilter(state.filters.socialProofGeneroFilter);
    setUgcGeneroFilter(state.filters.ugcGeneroFilter);
    setUgcFaixaEtariaFilter(state.filters.ugcFaixaEtariaFilter);

    setDeepfakesPersonagemFilter(state.filters.deepfakesPersonagemFilter);
    setDeepfakesVersaoFilter(state.filters.deepfakesVersaoFilter);
    setDeepfakesTagFilter(state.filters.deepfakesTagFilter);
    setDeepfakesOnlyWithVoice(state.filters.deepfakesOnlyWithVoice);
    setDeepfakesOnlyWithOriginal(state.filters.deepfakesOnlyWithOriginal);

    setVoiceCloneTagFilter(state.filters.voiceCloneTagFilter);
    setVoiceCloneDurationFilter(state.filters.voiceCloneDurationFilter);
  }, []);

  const handleViewRelated = (cat: AssetCategory, searchTerm: string) => {
    setNavStack(prev => [...prev, getCurrentViewState()]);
    // ao navegar por "related", limpamos filtros atuais e aplicamos apenas a busca
    resetAllFilters();
    setActiveCategory(cat);
    setSearchQuery(searchTerm);
    setFolderViewMode('FOLDER');
    setActiveFolder({ type: 'ROOT' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPrevious = () => {
    setNavStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      // restaura a view anterior
      restoreViewState(last);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return prev.slice(0, -1);
    });
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (Object.entries(dbData) as [string, any[]][]).forEach(([id, items]) => {
      counts[id] = items.length;
    });
    return counts;
  }, [dbData]);

  const totalAssetsCount = useMemo(() => {
    return Object.values(categoryCounts).reduce((a: number, b: number) => a + b, 0);
  }, [categoryCounts]);

  const musicSfxOptions = useMemo(() => {
    if (activeCategory !== AssetCategory.MUSIC && activeCategory !== AssetCategory.SFX) return null;
    const currentTableData = dbData[activeCategory] || [];
    return {
      moments: Array.from(new Set(currentTableData.map(i => i.momento_vsl).filter(Boolean))),
      emotions: Array.from(new Set(currentTableData.map(i => i.emocao).filter(Boolean))),
      tags: Array.from(new Set(currentTableData.flatMap(i => i.tags || []).filter(Boolean)))
    };
  }, [dbData, activeCategory]);

  const tiktokOptions = useMemo(() => {
    if (activeCategory !== AssetCategory.TIKTOK) return null;
    const currentTableData = dbData[activeCategory] || [];
    return {
      nichos: Array.from(new Set(currentTableData.map(i => i.nicho).filter(Boolean))),
      generos: Array.from(new Set(currentTableData.map(i => i.genero).filter(Boolean))),
      tipos: Array.from(new Set(currentTableData.map(i => i.tipo).filter(Boolean)))
    };
  }, [dbData, activeCategory]);

  const veoOptions = useMemo(() => {
    if (activeCategory !== AssetCategory.VEO3) return null;
    const currentTableData = dbData[activeCategory] || [];
    return {
      produtos: Array.from(new Set(currentTableData.map(i => i.produto_insert).filter(Boolean))),
      dimensoes: Array.from(new Set(currentTableData.map(i => i.dimensao).filter(Boolean))),
      tags: Array.from(new Set(currentTableData.flatMap(i => i.tags || []).filter(Boolean)))
    };
  }, [dbData, activeCategory]);

  const socialProofOptions = useMemo(() => {
    if (activeCategory !== AssetCategory.SOCIAL_PROOF) return null;
    const currentTableData = dbData[activeCategory] || [];
    return {
      nichos: Array.from(new Set(currentTableData.map(i => i.nicho).filter(Boolean))),
      generos: Array.from(new Set(currentTableData.map(i => i.genero).filter(Boolean)))
    };
  }, [dbData, activeCategory]);

  const ugcOptions = useMemo(() => {
    if (activeCategory !== AssetCategory.UGC_TESTIMONIALS) return null;
    const currentTableData = dbData[activeCategory] || [];
    return {
      generos: Array.from(new Set(currentTableData.map(i => i.genero).filter(Boolean))),
      faixasEtarias: Array.from(new Set(currentTableData.map(i => i.idade).filter(Boolean)))
    };
  }, [dbData, activeCategory]);

  const deepfakesOptions = useMemo(() => {
    if (activeCategory !== AssetCategory.DEEPFAKES) return null;
    const currentTableData = dbData[activeCategory] || [];
    return {
      personagens: Array.from(new Set(currentTableData.map(i => i.personagem).filter(Boolean))),
      versoes: Array.from(new Set(currentTableData.map(i => i.versao).filter(Boolean))),
      tags: Array.from(new Set(currentTableData.flatMap((i: any) => i.tags || []).filter(Boolean))),
    };
  }, [dbData, activeCategory]);

  const voiceClonesOptions = useMemo(() => {
    if (activeCategory !== AssetCategory.VOICE_CLONES) return null;
    const currentTableData = dbData[activeCategory] || [];
    return {
      tags: Array.from(new Set(currentTableData.flatMap((i: any) => i.tags || []).filter(Boolean))),
      duracoes: Array.from(new Set(currentTableData.map((i: any) => i.duracao).filter(Boolean))),
    };
  }, [dbData, activeCategory]);

  const filtered = allAssets.filter(a => {
    let matchesFolder = true;
    if (activeFolder.type === 'FOLDER') {
      const raw: any = a.raw;
      matchesFolder =
        activeFolder.id === 'RAW'
          ? raw.folder_id === null
          : raw.folder_id === activeFolder.id;
    }

    return matchesFolder && assetMatchesFilters(a, searchQuery);
  });

  const handleSave = async (cat: AssetCategory, data: any, id?: string) => {
    try {
      await saveAsset(cat, data, id);
      await fetchData();
      setIsAddFormOpen(false);
      setEditingAsset(null);
    } catch (err: any) {
      console.error('[BH•EVER] Erro ao salvar:', err);
      alert(`FALHA AO SALVAR:\n\n${err.message || JSON.stringify(err)}`);
    }
  };

  const handleDelete = async (asset: UnifiedAsset) => {
    if (!confirm('Deseja excluir permanentemente este ativo?')) return;
    try {
      await deleteAsset(asset.category, asset.id);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const visibleFolders = useMemo(() => {
    return foldersForActiveCategory.filter(folder =>
      countAssetsInFolder(folder.id) > 0
    );
  }, [foldersForActiveCategory, countAssetsInFolder]);
  const rawAssetsCount = countAssetsInFolder('RAW');

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  const isHome = activeCategory === 'ALL' && !searchQuery;

  return (
    <div className="flex h-screen bg-black overflow-hidden font-['Inter'] text-white animate-[fade-in_1s_ease-out]">
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setNavStack([]);
          resetAllFilters();
          setActiveCategory(cat);
          setSearchQuery('');
          setFolderViewMode('ROOT');
          setActiveFolder({ type: 'ROOT' });
        }}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center px-8 justify-between bg-black/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {navStack.length > 0 && (
              <button
                onClick={handleBackToPrevious}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all"
                title="Voltar para onde você estava"
              >
                <ArrowLeft size={14} className="text-[#FFD700]" />
                Voltar
              </button>
            )}

            <div className="relative w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Buscar em toda a biblioteca..." 
                className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-[#FFD700] outline-none transition-all text-white" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData} 
              className={`p-2.5 rounded-xl border border-white/5 bg-white/5 text-gray-400 hover:text-white transition-all ${isLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => { setEditingAsset(null); setIsAddFormOpen(true); }} 
              className="px-6 py-2.5 bg-[#FFD700] text-black rounded-xl text-xs font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#FFD700]/20 active:scale-95"
            >
              <Plus size={18} /> NOVO ATIVO
            </button>
            <div className="w-[1px] h-8 bg-white/10 mx-2" />
            <LogoutButton />
          </div>
        </header>

        {/* Specialized filters content remains the same... */}
        {(activeCategory === AssetCategory.MUSIC || activeCategory === AssetCategory.SFX) && musicSfxOptions && (
          <div className="bg-[#050505] border-b border-white/5 px-8 py-3 flex items-center gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 text-[#FFD700] text-[10px] font-black uppercase tracking-widest border-r border-white/10 pr-6 shrink-0">
              <Filter size={14} /> Filtros Áudio
            </div>

            <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <ListMusic size={12} className="text-gray-600" />
                <select 
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={vslMomentFilter}
                  onChange={e => setVslMomentFilter(e.target.value)}
                >
                  <option value="">MOMENTOS DA VSL</option>
                  {musicSfxOptions.moments.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Smile size={12} className="text-gray-600" />
                <select 
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={emotionFilter}
                  onChange={e => setEmotionFilter(e.target.value)}
                >
                  <option value="">TODAS AS EMOÇÕES</option>
                  {musicSfxOptions.emotions.map(e => <option key={e} value={e}>{e.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <BrainCircuit size={12} className="text-gray-600" />
                <select 
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={activeTagFilter}
                  onChange={e => setActiveTagFilter(e.target.value)}
                >
                  <option value="">TODAS AS TAGS</option>
                  {musicSfxOptions.tags.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {(vslMomentFilter || emotionFilter || activeTagFilter) && (
              <button 
                onClick={() => { setVslMomentFilter(''); setEmotionFilter(''); setActiveTagFilter(''); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black hover:bg-red-500/20 transition-all shrink-0"
              >
                <X size={12} /> LIMPAR FILTROS
              </button>
            )}
          </div>
        )}

        {/* ... Rest of existing filter UI code ... */}
        {activeCategory === AssetCategory.TIKTOK && tiktokOptions && (
          <div className="bg-[#050505] border-b border-white/5 px-8 py-3 flex items-center gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 text-[#FFD700] text-[10px] font-black uppercase tracking-widest border-r border-white/10 pr-6 shrink-0">
              <Filter size={14} /> Filtros TikTok
            </div>

            <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <Target size={12} className="text-gray-600" />
                <select 
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={tiktokNichoFilter}
                  onChange={e => setTiktokNichoFilter(e.target.value)}
                >
                  <option value="">TODOS OS NICHOS</option>
                  {tiktokOptions.nichos.map(n => <option key={n} value={n}>{n.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <UserCircle size={12} className="text-gray-600" />
                <select 
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={tiktokGeneroFilter}
                  onChange={e => setTiktokGeneroFilter(e.target.value)}
                >
                  <option value="">TODOS OS GÊNEROS</option>
                  {tiktokOptions.generos.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Layers size={12} className="text-gray-600" />
                <select 
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={tiktokTipoFilter}
                  onChange={e => setTiktokTipoFilter(e.target.value)}
                >
                  <option value="">TODOS OS TIPOS</option>
                  {tiktokOptions.tipos.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {(tiktokNichoFilter || tiktokGeneroFilter || tiktokTipoFilter) && (
              <button 
                onClick={() => { setTiktokNichoFilter(''); setTiktokGeneroFilter(''); setTiktokTipoFilter(''); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black hover:bg-red-500/20 transition-all shrink-0"
              >
                <X size={12} /> LIMPAR FILTROS
              </button>
            )}
          </div>
        )}

        {/* VEO 3 Filters */}
        {activeCategory === AssetCategory.VEO3 && veoOptions && (
          <div className="bg-[#050505] border-b border-white/5 px-8 py-3 flex items-center gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 text-[#FFD700] text-[10px] font-black uppercase tracking-widest border-r border-white/10 pr-6 shrink-0">
              <Filter size={14} /> Filtros VEO 3
            </div>

            <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <Box size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={veoProdutoFilter}
                  onChange={e => setVeoProdutoFilter(e.target.value)}
                >
                  <option value="">TODOS OS PRODUTOS</option>
                  {veoOptions.produtos.map(p => <option key={p} value={p}>{String(p).toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Maximize size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={veoDimensaoFilter}
                  onChange={e => setVeoDimensaoFilter(e.target.value)}
                >
                  <option value="">TODAS AS DIMENSÕES</option>
                  {veoOptions.dimensoes.map(d => <option key={d} value={d}>{String(d).toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Tag size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={veoTagFilter}
                  onChange={e => setVeoTagFilter(e.target.value)}
                >
                  <option value="">TODAS AS TAGS</option>
                  {veoOptions.tags.map(t => <option key={t} value={t}>{String(t).toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {(veoProdutoFilter || veoDimensaoFilter || veoTagFilter) && (
              <button
                onClick={() => { setVeoProdutoFilter(''); setVeoDimensaoFilter(''); setVeoTagFilter(''); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black hover:bg-red-500/20 transition-all shrink-0"
              >
                <X size={12} /> LIMPAR FILTROS
              </button>
            )}
          </div>
        )}

        {/* Social Proof Filters */}
        {activeCategory === AssetCategory.SOCIAL_PROOF && socialProofOptions && (
          <div className="bg-[#050505] border-b border-white/5 px-8 py-3 flex items-center gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 text-[#FFD700] text-[10px] font-black uppercase tracking-widest border-r border-white/10 pr-6 shrink-0">
              <Filter size={14} /> Filtros Provas Sociais
            </div>

            <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <Target size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={socialProofNichoFilter}
                  onChange={e => setSocialProofNichoFilter(e.target.value)}
                >
                  <option value="">TODOS OS NICHOS</option>
                  {socialProofOptions.nichos.map(n => <option key={n} value={n}>{String(n).toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <UserCircle size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={socialProofGeneroFilter}
                  onChange={e => setSocialProofGeneroFilter(e.target.value)}
                >
                  <option value="">TODOS OS GÊNEROS</option>
                  {socialProofOptions.generos.map(g => <option key={g} value={g}>{String(g).toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {(socialProofNichoFilter || socialProofGeneroFilter) && (
              <button
                onClick={() => { setSocialProofNichoFilter(''); setSocialProofGeneroFilter(''); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black hover:bg-red-500/20 transition-all shrink-0"
              >
                <X size={12} /> LIMPAR FILTROS
              </button>
            )}
          </div>
        )}

        {/* UGC Filters */}
        {activeCategory === AssetCategory.UGC_TESTIMONIALS && ugcOptions && (
          <div className="bg-[#050505] border-b border-white/5 px-8 py-3 flex items-center gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 text-[#FFD700] text-[10px] font-black uppercase tracking-widest border-r border-white/10 pr-6 shrink-0">
              <Filter size={14} /> Filtros Depoimentos UGC
            </div>

            <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <UserCircle size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={ugcGeneroFilter}
                  onChange={e => setUgcGeneroFilter(e.target.value)}
                >
                  <option value="">TODOS OS GÊNEROS</option>
                  {ugcOptions.generos.map(g => <option key={g} value={g}>{String(g).toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Baby size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={ugcFaixaEtariaFilter}
                  onChange={e => setUgcFaixaEtariaFilter(e.target.value)}
                >
                  <option value="">TODAS AS IDADES</option>
                  {ugcOptions.faixasEtarias.map(f => <option key={f} value={f}>{String(f).toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {(ugcGeneroFilter || ugcFaixaEtariaFilter) && (
              <button
                onClick={() => { setUgcGeneroFilter(''); setUgcFaixaEtariaFilter(''); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black hover:bg-red-500/20 transition-all shrink-0"
              >
                <X size={12} /> LIMPAR FILTROS
              </button>
            )}
          </div>
        )}

        {/* Deepfakes Filters */}
        {activeCategory === AssetCategory.DEEPFAKES && deepfakesOptions && (
          <div className="bg-[#050505] border-b border-white/5 px-8 py-3 flex items-center gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 text-[#FFD700] text-[10px] font-black uppercase tracking-widest border-r border-white/10 pr-6 shrink-0">
              <Filter size={14} /> Filtros Deepfakes
            </div>

            <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <UserCircle size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={deepfakesPersonagemFilter}
                  onChange={e => setDeepfakesPersonagemFilter(e.target.value)}
                >
                  <option value="">TODOS OS PERSONAGENS</option>
                  {deepfakesOptions.personagens.map(p => <option key={p} value={p}>{String(p).toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Layers size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={deepfakesVersaoFilter}
                  onChange={e => setDeepfakesVersaoFilter(e.target.value)}
                >
                  <option value="">TODAS AS VERSÕES</option>
                  {deepfakesOptions.versoes.map(v => <option key={v} value={v}>{String(v).toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Tag size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={deepfakesTagFilter}
                  onChange={e => setDeepfakesTagFilter(e.target.value)}
                >
                  <option value="">TODAS AS TAGS</option>
                  {deepfakesOptions.tags.map(t => <option key={t} value={t}>{String(t).toUpperCase()}</option>)}
                </select>
              </div>

              <button
                onClick={() => setDeepfakesOnlyWithVoice(v => !v)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                  deepfakesOnlyWithVoice ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-black text-gray-400 border-white/10 hover:text-white'
                }`}
                title="Mostrar apenas deepfakes que têm voz vinculada"
              >
                Voz vinculada
              </button>

              <button
                onClick={() => setDeepfakesOnlyWithOriginal(v => !v)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                  deepfakesOnlyWithOriginal ? 'bg-white text-black border-white' : 'bg-black text-gray-400 border-white/10 hover:text-white'
                }`}
                title="Mostrar apenas deepfakes que têm vídeo original"
              >
                Vídeo original
              </button>
            </div>

            {(deepfakesPersonagemFilter || deepfakesVersaoFilter || deepfakesTagFilter || deepfakesOnlyWithVoice || deepfakesOnlyWithOriginal) && (
              <button
                onClick={() => {
                  setDeepfakesPersonagemFilter('');
                  setDeepfakesVersaoFilter('');
                  setDeepfakesTagFilter('');
                  setDeepfakesOnlyWithVoice(false);
                  setDeepfakesOnlyWithOriginal(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black hover:bg-red-500/20 transition-all shrink-0"
              >
                <X size={12} /> LIMPAR FILTROS
              </button>
            )}
          </div>
        )}

        {/* Voice Clones Filters */}
        {activeCategory === AssetCategory.VOICE_CLONES && voiceClonesOptions && (
          <div className="bg-[#050505] border-b border-white/5 px-8 py-3 flex items-center gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 text-[#FFD700] text-[10px] font-black uppercase tracking-widest border-r border-white/10 pr-6 shrink-0">
              <Filter size={14} /> Filtros Voz pra Clonar
            </div>

            <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <Tag size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={voiceCloneTagFilter}
                  onChange={e => setVoiceCloneTagFilter(e.target.value)}
                >
                  <option value="">TODAS AS TAGS</option>
                  {voiceClonesOptions.tags.map(t => <option key={t} value={t}>{String(t).toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Clock size={12} className="text-gray-600" />
                <select
                  className="bg-black border border-white/10 rounded-lg text-[10px] py-1.5 px-3 text-gray-400 focus:text-white outline-none cursor-pointer"
                  value={voiceCloneDurationFilter}
                  onChange={e => setVoiceCloneDurationFilter(e.target.value)}
                >
                  <option value="">TODAS AS DURAÇÕES</option>
                  {voiceClonesOptions.duracoes.map(d => <option key={d} value={d}>{String(d).toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {(voiceCloneTagFilter || voiceCloneDurationFilter) && (
              <button
                onClick={() => { setVoiceCloneTagFilter(''); setVoiceCloneDurationFilter(''); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black hover:bg-red-500/20 transition-all shrink-0"
              >
                <X size={12} /> LIMPAR FILTROS
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading && <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#FFD700]" size={48} /></div>}
          
          {!isLoading && isHome ? (
            <div className="space-y-12 animate-in fade-in duration-700">
              <section className="relative overflow-hidden rounded-3xl bg-[#080808] border border-white/5 p-12 flex flex-col items-center text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 to-transparent opacity-50" />
                <div className="relative z-10 max-w-3xl">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] text-xs font-black tracking-widest uppercase mb-8">
                    HUB OFICIAL
                  </span>
                  <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#FFD700]">
                      BH•HUB
                    </h1>

                    <h2 className="text-xl md:text-2xl font-medium text-white/90">
                      Central de Inteligência de VSL
                    </h2>
                  </div>
                  <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto italic">
                    Acervo centralizado de ativos de alta performance. Encontre Deepfakes, UGCs, e áudios exclusivos selecionados para elevar o nível das suas edições.
                  </p>
                </div>
              </section>

              {/* Stats Grid */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-[#FFD700] pl-4">
                  <h2 className="text-xs font-black text-gray-500 tracking-[0.3em] uppercase">Visão Geral do Acervo</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {CATEGORIES_CONFIG.map(cat => (
                    <StatCard 
                      key={cat.id}
                      label={cat.label}
                      count={categoryCounts[cat.id] || 0}
                      icon={cat.icon}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setFolderViewMode('ROOT');
                        setActiveFolder({ type: 'ROOT' });
                      }}
                    />
                  ))}
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/10 opacity-60">
                    <div className="text-2xl font-black text-[#FFD700] tracking-tighter">
                      {totalAssetsCount}
                    </div>
                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Ativos Totais</div>
                  </div>
                </div>
              </section>

              <section className="space-y-6 pb-12">
                <div className="flex items-center justify-between border-l-4 border-[#FFD700] pl-4">
                  <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-widest uppercase">
                    <Clock className="text-[#FFD700]" size={20} /> ÚLTIMOS ADICIONADOS
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {allAssets.slice(0, 5).map(asset => (
                    <AssetCard 
                      key={asset.id} 
                      asset={asset} 
                      onEdit={a => { setEditingAsset({asset: a.raw, category: a.category}); setIsAddFormOpen(true); }} 
                      onDelete={handleDelete}
                      onViewRelated={handleViewRelated}
                      hasRelatedVoice={voiceMap.has(asset.title.toLowerCase())}
                      hasRelatedOriginal={originalVideoMap.has(asset.title.toLowerCase())}
                    />
                  ))}
                </div>
              </section>
            </div>
          ) : !isLoading && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-white uppercase tracking-wider">
                  {searchQuery ? `RESULTADOS PARA: "${searchQuery.toUpperCase()}"` : CATEGORIES_CONFIG.find(c => c.id === activeCategory)?.label.toUpperCase()}
                  <span className="ml-3 text-sm text-gray-600 font-bold tracking-normal">({filtered.length} ATIVOS)</span>
                </h1>
                <div className="flex items-center gap-3">
                  {activeCategory !== 'ALL' && (
                    <button
                      onClick={() => setShowCreateFolderModal(true)}
                      className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      <Plus size={14} /> Nova pasta
                    </button>
                  )}
                  {activeCategory !== 'ALL' && (
                    <button 
                      onClick={() => {
                        setNavStack([]);
                        resetAllFilters();
                        setActiveCategory('ALL');
                        setFolderViewMode('ROOT');
                        setActiveFolder({ type: 'ROOT' });
                      }}
                      className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      <X size={14} /> Fechar Filtro
                    </button>
                  )}
                </div>
              </div>

              {activeCategory !== 'ALL' && folderViewMode === 'ROOT' && (
                <div className="space-y-6">
                  {isFoldersLoading && (
                    <div className="text-sm text-gray-500">Carregando pastas…</div>
                  )}
                  <div className="grid grid-cols-5 gap-6">
                    {rawAssetsCount > 0 && (
                      <FolderCard
                        folder={{
                          id: 'RAW',
                          name: 'Raw Assets',
                          category: '',
                          created_at: ''
                        }}
                        count={rawAssetsCount}
                        onOpen={() => {
                          setActiveFolder({ type: 'FOLDER', id: 'RAW' });
                          setFolderViewMode('FOLDER');
                        }}
                        locked
                      />
                    )}

                    {visibleFolders.map(f => (
                      <FolderCard
                        key={f.id}
                        folder={f}
                        count={countAssetsInFolder(f.id)}
                        onOpen={() => {
                          setActiveFolder({ type: 'FOLDER', id: f.id });
                          setFolderViewMode('FOLDER');
                        }}
                        onRename={() => handleRenameFolder(f.id)}
                        onDelete={() => handleDeleteFolder(f.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(activeCategory === 'ALL' || folderViewMode === 'FOLDER') && (
                <>
                  {activeCategory !== 'ALL' && (
                    <Breadcrumb
                      categoryLabel={activeCategory}
                      folderName={
                        activeFolder.type === 'FOLDER'
                          ? activeFolder.id === 'RAW'
                            ? 'Raw Assets'
                            : folders.find(f => f.id === activeFolder.id)?.name
                          : undefined
                      }
                      onBack={() => {
                        setFolderViewMode('ROOT');
                        setActiveFolder({ type: 'ROOT' });
                      }}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {filtered.map(asset => (
                      <AssetCard 
                        key={asset.id} 
                        asset={asset} 
                        onEdit={a => { setEditingAsset({asset: a.raw, category: a.category}); setIsAddFormOpen(true); }} 
                        onDelete={handleDelete}
                        onViewRelated={handleViewRelated}
                        hasRelatedVoice={voiceMap.has(asset.title.toLowerCase())}
                        hasRelatedOriginal={originalVideoMap.has(asset.title.toLowerCase())}
                      />
                    ))}
                  </div>

                  {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-600">
                      <LayoutGrid size={64} strokeWidth={1} className="mb-4 opacity-10" />
                      <p className="font-bold uppercase tracking-widest text-[10px]">Nenhum ativo encontrado</p>
                    </div>
                  )}
                </>
              )}

            </div>
          )}
        </div>
      </main>
      
      {isAddFormOpen && (
        <AddAssetForm 
          onClose={() => { setIsAddFormOpen(false); setEditingAsset(null); }} 
          onSave={handleSave} 
          initialData={editingAsset?.asset} 
          initialCategory={editingAsset?.category || (activeCategory !== 'ALL' ? activeCategory : undefined)} 
          folders={activeTableName ? folders.filter(f => f.category === activeTableName && !f.parent_id) : []}
        />
      )}

      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthGate>
      <MainApp />
    </AuthGate>
  );
}

export default App;
