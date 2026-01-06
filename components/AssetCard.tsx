
import React from 'react';
import { ExternalLink, Clock, Pencil, Trash2, Video, Mic, Music, Image as ImageIcon, Link2, Clapperboard } from 'lucide-react';
import { UnifiedAsset, AssetCategory } from '../types';

interface AssetCardProps {
  asset: UnifiedAsset;
  onEdit: (asset: UnifiedAsset) => void;
  onDelete: (asset: UnifiedAsset) => void;
  onViewRelated?: (targetCategory: AssetCategory, searchTerm: string) => void;
  hasRelatedVoice?: boolean;
  hasRelatedOriginal?: boolean;
}

const resolveDriveImage = (url: string | undefined | null) => {
  if (!url) return null;
  if (url.startsWith('http') && (url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || url.includes('base64'))) {
    return url;
  }
  const driveRegex = /(?:\/d\/|id=|\/file\/d\/)([\w-]{25,})/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return url;
};

const AssetCard: React.FC<AssetCardProps> = ({ asset, onEdit, onDelete, onViewRelated, hasRelatedVoice, hasRelatedOriginal }) => {
  const isVoiceClone = asset.category === AssetCategory.VOICE_CLONES;
  const isMusic = asset.category === AssetCategory.MUSIC;
  const isSFX = asset.category === AssetCategory.SFX;
  const isAudioPlaceholder = isVoiceClone || isMusic || isSFX;
  
  const thumbnail = isAudioPlaceholder 
    ? null 
    : (resolveDriveImage(asset.imageUrl) || resolveDriveImage(asset.link));

  const getIcon = () => {
    switch(asset.assetType) {
      case 'voice': return <Mic size={48} strokeWidth={1} className="text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />;
      case 'audio': return <Music size={48} strokeWidth={1} className={isMusic ? "text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" : ""} />;
      case 'video': return <Video size={48} strokeWidth={1} />;
      case 'image': return <ImageIcon size={48} strokeWidth={1} />;
      default: return <Video size={48} strokeWidth={1} />;
    }
  };

  const handleRelatedVoiceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewRelated) {
      onViewRelated(AssetCategory.VOICE_CLONES, asset.title);
    }
  };

  const handleRelatedOriginalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewRelated) {
      onViewRelated(AssetCategory.ORIGINAL_VIDEOS, asset.title);
    }
  };

  return (
    <div className="group relative bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FFD700] hover:-translate-y-1">
      {/* Quick Actions */}
      <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(asset)} className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:text-[#FFD700] border border-white/10 transition-all"><Pencil size={14} /></button>
        <button onClick={() => onDelete(asset)} className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:text-red-500 border border-white/10 transition-all"><Trash2 size={14} /></button>
      </div>

      {/* Thumbnail Area */}
      <div className={`relative aspect-video w-full overflow-hidden ${isAudioPlaceholder ? 'bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]' : 'bg-black'}`}>
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={asset.title} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement?.classList.add('bg-[#050505]');
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-[#050505]">
            <div className={`p-6 rounded-full transition-all duration-300 ${(isVoiceClone || isMusic) ? 'bg-[#FFD700]/5 border border-[#FFD700]/10 group-hover:bg-[#FFD700]/10' : ''}`}>
              {getIcon()}
            </div>
            {isAudioPlaceholder && (
              <span className="mt-2 text-[8px] font-black text-[#FFD700]/30 tracking-[0.2em] uppercase">
                {isVoiceClone ? 'Voice Sample' : isMusic ? 'Music Track' : 'SFX Asset'}
              </span>
            )}
          </div>
        )}
        
        {/* Indicators for Linked Content */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5">
          {asset.category === AssetCategory.DEEPFAKES && hasRelatedVoice && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#FFD700] text-black text-[9px] font-black rounded shadow-lg animate-pulse">
              <Mic size={10} /> VOZ VINCULADA
            </div>
          )}
          {asset.category === AssetCategory.DEEPFAKES && hasRelatedOriginal && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white text-black text-[9px] font-black rounded shadow-lg border border-[#FFD700]">
              <Clapperboard size={10} /> VÍDEO ORIGINAL
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center text-black shadow-xl"><ExternalLink size={20} /></div>
        </div>

        {asset.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded border border-white/10 flex items-center gap-1">
            <Clock size={10} /> {asset.duration}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#FFD700] transition-colors">{asset.title}</h3>
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[8px] uppercase font-black tracking-wider bg-white/5 text-gray-500 border border-white/10">
            {asset.category.replace('_', ' ')}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 mb-4 line-clamp-1 italic">{asset.subtitle}</p>
        
        <div className="flex flex-col gap-2">
          <a 
            href={asset.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block w-full py-2 bg-[#1a1a1a] hover:bg-[#FFD700] hover:text-black text-[#FFD700]/70 text-center text-[10px] font-black rounded-lg transition-all"
          >
            DOWNLOAD DRIVE
          </a>

          {asset.category === AssetCategory.DEEPFAKES && hasRelatedVoice && (
            <button 
              onClick={handleRelatedVoiceClick}
              className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black rounded-lg border border-white/5 transition-all uppercase"
            >
              <Link2 size={12} className="text-[#FFD700]" /> Ver Voz Correspondente
            </button>
          )}

          {asset.category === AssetCategory.DEEPFAKES && hasRelatedOriginal && (
            <button 
              onClick={handleRelatedOriginalClick}
              className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black rounded-lg border border-white/5 transition-all uppercase"
            >
              <Clapperboard size={12} className="text-[#FFD700]" /> Ver Vídeo Original
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
