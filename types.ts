
export enum AssetCategory {
  DEEPFAKES = 'DEEPFAKES',
  VOICE_CLONES = 'VOICE_CLONES',
  ORIGINAL_VIDEOS = 'ORIGINAL_VIDEOS',
  TIKTOK = 'TIKTOK',
  MUSIC = 'MUSIC',
  SFX = 'SFX',
  VEO3 = 'VEO3',
  SOCIAL_PROOF = 'SOCIAL_PROOF',
  UGC_TESTIMONIALS = 'UGC_TESTIMONIALS'
}

export interface Deepfake {
  id: string;
  created_at: string;
  personagem: string;
  imagem_descritiva?: string;
  duracao?: string;
  versao?: string;
  video_link: string;
  tags: string[];
}

export interface VoiceClone {
  id: string;
  created_at: string;
  voz_nome: string;
  duracao?: string;
  link_minimax: string;
  tags: string[];
}

export interface OriginalVideo {
  id: string;
  created_at: string;
  nome_video: string;
  link_video_original: string;
  tags: string[];
}

export interface TikTokAsset {
  id: string;
  created_at: string;
  nicho?: string;
  tipo?: string;
  genero?: string;
  link_video: string;
  tags: string[];
}

export interface Music {
  id: string;
  created_at: string;
  nome?: string;
  momento_vsl?: string;
  emocao?: string;
  link_audio: string;
  tags: string[];
}

export interface SFX {
  id: string;
  created_at: string;
  nome?: string;
  momento_vsl?: string;
  emocao?: string;
  link_audio: string;
  tags: string[];
}

export interface VeoAsset {
  id: string;
  created_at: string;
  produto_insert: string;
  dimensao?: string;
  duracao?: string;
  link_video: string;
  tags: string[];
}

export interface SocialProof {
  id: string;
  created_at: string;
  nicho?: string;
  genero?: string;
  link_imagem: string;
  tags: string[];
}

export interface UgcTestimonial {
  id: string;
  created_at: string;
  genero?: string;
  duracao?: string;
  idade?: string;
  link_video: string;
  tags: string[];
}

export type TableAsset = 
  | Deepfake 
  | VoiceClone 
  | OriginalVideo 
  | TikTokAsset 
  | Music 
  | SFX 
  | VeoAsset 
  | SocialProof 
  | UgcTestimonial;

export interface UnifiedAsset {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  duration?: string;
  category: AssetCategory;
  assetType: 'video' | 'audio' | 'image' | 'voice' | 'other';
  tags: string[];
  raw: TableAsset;
}

export interface Folder {
  id: string;
  created_at: string;
  category: string;   // matches table name e.g. 'deepfakes', 'veo_assets'
  name: string;
  parent_id?: string | null;
}

export interface AIResponse {
  recommended_tags: string[];
  explanation: string;
  suggested_category?: AssetCategory;
}
