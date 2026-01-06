
import { supabase } from './lib/supabase';
import { AssetCategory } from './types';
import { CATEGORIES_CONFIG } from './constants';

const TABLE_SCHEMAS: Record<string, string[]> = {
  'deepfakes': ['personagem', 'imagem_descritiva', 'duracao', 'versao', 'video_link', 'tags'],
  'voice_clones': ['voz_nome', 'duracao', 'link_minimax', 'tags'],
  'original_videos': ['nome_video', 'link_video_original', 'tags'],
  'tiktok_assets': ['nicho', 'tipo', 'genero', 'link_video', 'tags'],
  'musicas': ['nome', 'momento_vsl', 'emocao', 'link_audio', 'tags'],
  'sfx': ['nome', 'momento_vsl', 'emocao', 'link_audio', 'tags'],
  'veo_assets': ['produto_insert', 'dimensao', 'duracao', 'link_video', 'tags'],
  'social_proof': ['nicho', 'genero', 'link_imagem', 'tags'],
  'ugc_testimonials': ['genero', 'duracao', 'idade', 'link_video', 'tags']
};

export const saveAsset = async (cat: AssetCategory, data: any, id?: string) => {
  const tableConfig = CATEGORIES_CONFIG.find(c => c.id === cat);
  if (!tableConfig) throw new Error(`Tabela não configurada para a categoria ${cat}`);
  
  const table = tableConfig.table;
  const allowedColumns = TABLE_SCHEMAS[table];
  
  if (!allowedColumns) throw new Error(`Schema não definido para a tabela ${table}`);

  // 1. Processar Tags: transformar 'tags_string' em array 'tags'
  let finalTags: string[] = [];
  if (data.tags_string !== undefined) {
    finalTags = data.tags_string.split(',').map((t: string) => t.trim()).filter(Boolean);
  } else if (Array.isArray(data.tags)) {
    finalTags = data.tags;
  }

  // 2. Mapeamento e Whitelisting estrito
  const cleanData: any = {};
  allowedColumns.forEach(col => {
    if (col === 'tags') {
      cleanData.tags = finalTags;
    } else if (data[col] !== undefined) {
      cleanData[col] = data[col];
    }
  });

  console.log(`[BH•EVER Actions] Salvando em ${table}:`, cleanData);

  if (id) {
    const { error } = await supabase.from(table).update(cleanData).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from(table).insert([cleanData]);
    if (error) throw error;
  }

  return true;
};

export const deleteAsset = async (cat: AssetCategory, id: string) => {
  const tableConfig = CATEGORIES_CONFIG.find(c => c.id === cat);
  if (!tableConfig) throw new Error(`Tabela não configurada para a categoria ${cat}`);
  
  const { error } = await supabase.from(tableConfig.table).delete().eq('id', id);
  if (error) throw error;
  
  return true;
};
