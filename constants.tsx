
import React from 'react';
import { 
  Users, 
  Mic, 
  Clapperboard, 
  Smartphone, 
  Music as MusicIcon, 
  Volume2, 
  Video, 
  Image as ImageIcon, 
  MessagesSquare 
} from 'lucide-react';
import { AssetCategory } from './types';

export const CATEGORIES_CONFIG = [
  { id: AssetCategory.DEEPFAKES, label: 'Deepfakes', icon: <Users size={20} />, table: 'deepfakes' },
  { id: AssetCategory.VOICE_CLONES, label: 'Voz para Clonar', icon: <Mic size={20} />, table: 'voice_clones' },
  { id: AssetCategory.ORIGINAL_VIDEOS, label: 'Vídeos Originais', icon: <Clapperboard size={20} />, table: 'original_videos' },
  { id: AssetCategory.TIKTOK, label: 'Tik Tok', icon: <Smartphone size={20} />, table: 'tiktok_assets' },
  { id: AssetCategory.MUSIC, label: 'Músicas', icon: <MusicIcon size={20} />, table: 'musicas' },
  { id: AssetCategory.SFX, label: 'SFX', icon: <Volume2 size={20} />, table: 'sfx' },
  { id: AssetCategory.VEO3, label: 'VEO 3', icon: <Video size={20} />, table: 'veo_assets' },
  { id: AssetCategory.SOCIAL_PROOF, label: 'Provas Sociais', icon: <ImageIcon size={20} />, table: 'social_proof' },
  { id: AssetCategory.UGC_TESTIMONIALS, label: 'Depoimentos UGC', icon: <MessagesSquare size={20} />, table: 'ugc_testimonials' },
];
