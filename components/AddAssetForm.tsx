
import React, { useState, useEffect } from 'react';
import { AssetCategory, Folder } from '../types';
import { CATEGORIES_CONFIG } from '../constants';
import { X, Save, Loader2, Info } from 'lucide-react';

interface AddAssetFormProps {
  onClose: () => void;
  onSave: (category: AssetCategory, data: any, id?: string) => void;
  initialData?: any;
  initialCategory?: AssetCategory;
  folders?: Folder[];
}

const AddAssetForm: React.FC<AddAssetFormProps> = ({ onClose, onSave, initialData, initialCategory, folders = [] }) => {
  const [category, setCategory] = useState<AssetCategory>(initialCategory || AssetCategory.DEEPFAKES);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;
  const showCategorySelector = !isEditing && !initialCategory;

  useEffect(() => {
    if (initialData) {
      const tags_string = Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '';
      setFormData({ ...initialData, tags_string });
    } else {
      setFormData({ folder_id: null });
    }
  }, [initialData]);

  const handleCategoryChange = (newCat: AssetCategory) => {
    if (!isEditing) {
      setCategory(newCat);
      setFormData({ folder_id: null });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(category, formData, initialData?.id);
    } catch (err) {
      console.error('Erro ao submeter formulário:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFolderSelect = () => (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Pasta</label>
      <select
        className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 px-3 text-sm focus:border-[#FFD700] outline-none transition-all text-white"
        value={formData.folder_id || ''}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, folder_id: e.target.value || null }))}
      >
        <option value="">Sem pasta</option>
        {folders.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>
    </div>
  );

  const renderFields = () => {
    switch (category) {
      case AssetCategory.DEEPFAKES:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderFolderSelect()}
            <Input label="Personagem" name="personagem" value={formData.personagem} placeholder="Ex: Adele" onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Duração" name="duracao" value={formData.duracao} placeholder="0:30" onChange={handleChange} />
              <Input label="Versão" name="versao" value={formData.versao} placeholder="V1, V2..." onChange={handleChange} />
            </div>
            <Input label="Link do Vídeo (Google Drive)" name="video_link" value={formData.video_link} placeholder="Chave: video_link" onChange={handleChange} required />
            <Input label="Capa do Ativo (URL Opcional)" name="imagem_descritiva" value={formData.imagem_descritiva} placeholder="Thumbnail personalizada" onChange={handleChange} />
          </div>
        );
      case AssetCategory.VOICE_CLONES:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderFolderSelect()}
            <Input label="Nome da Voz" name="voz_nome" value={formData.voz_nome} placeholder="Ex: Locutor Impactante" onChange={handleChange} required />
            <Input label="Duração do Sample" name="duracao" value={formData.duracao} placeholder="0:15" onChange={handleChange} />
            <Input label="Link Minimax / Download" name="link_minimax" value={formData.link_minimax} placeholder="Chave: link_minimax" onChange={handleChange} required />
          </div>
        );
      case AssetCategory.ORIGINAL_VIDEOS:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderFolderSelect()}
            <Input label="Nome do Vídeo Original" name="nome_video" value={formData.nome_video} placeholder="Ex: Entrevista Completa Adele" onChange={handleChange} required />
            <Input label="Link do Vídeo Bruto (Drive)" name="link_video_original" value={formData.link_video_original} placeholder="Chave: link_video_original" onChange={handleChange} required />
          </div>
        );
      case AssetCategory.TIKTOK:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderFolderSelect()}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nicho" name="nicho" value={formData.nicho} placeholder="Ex: Motivacional" onChange={handleChange} />
              <Input label="Gênero / Estilo" name="genero" value={formData.genero} placeholder="Ex: Masculino" onChange={handleChange} />
            </div>
            <Input label="Tipo de Asset" name="tipo" value={formData.tipo} placeholder="Ex: Viral, Hook, CTA" onChange={handleChange} />
            <Input label="Link do Vídeo" name="link_video" value={formData.link_video} placeholder="Chave: link_video" onChange={handleChange} required />
          </div>
        );
      case AssetCategory.MUSIC:
      case AssetCategory.SFX:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderFolderSelect()}
            <Input label="Nome da Trilha" name="nome" value={formData.nome} placeholder="Ex: Inspiração Épica 01" onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Momento da VSL" name="momento_vsl" value={formData.momento_vsl} placeholder="Ex: Abertura Dramática" onChange={handleChange} />
              <Input label="Emoção / Vibe" name="emocao" value={formData.emocao} placeholder="Ex: Urgência, Alívio" onChange={handleChange} />
            </div>
            <Input label="Link do Arquivo de Áudio" name="link_audio" value={formData.link_audio} placeholder="Chave: link_audio" onChange={handleChange} required />
          </div>
        );
      case AssetCategory.VEO3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderFolderSelect()}
            <Input label="Produto / Objeto do Insert" name="produto_insert" value={formData.produto_insert} placeholder="Ex: Pote de Suplemento" onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Dimensão" name="dimensao" value={formData.dimensao} placeholder="1080x1920" onChange={handleChange} />
              <Input label="Duração" name="duracao" value={formData.duracao} placeholder="0:05" onChange={handleChange} />
            </div>
            <Input label="Link do Vídeo Gerado" name="link_video" value={formData.link_video} placeholder="Chave: link_video" onChange={handleChange} required />
          </div>
        );
      case AssetCategory.SOCIAL_PROOF:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderFolderSelect()}
            <Input label="Nicho do Resultado" name="nicho" value={formData.nicho} placeholder="Ex: Emagrecimento" onChange={handleChange} />
            <Input label="Gênero do Cliente" name="genero" value={formData.genero} placeholder="Ex: HOMEM" onChange={handleChange} />
            <Input label="Link da Imagem (Print/Foto)" name="link_imagem" value={formData.link_imagem} placeholder="Chave: link_imagem" onChange={handleChange} required />
          </div>
        );
      case AssetCategory.UGC_TESTIMONIALS:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderFolderSelect()}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Gênero do Ator" name="genero" value={formData.genero} placeholder="Ex: MULHER" onChange={handleChange} />
              <Input label="Faixa Etária" name="idade" value={formData.idade} placeholder="Ex: ADULTO" onChange={handleChange} />
            </div>
            <Input label="Duração" name="duracao" value={formData.duracao} placeholder="1:00" onChange={handleChange} />
            <Input label="Link do Depoimento" name="link_video" value={formData.link_video} placeholder="Chave: link_video" onChange={handleChange} required />
          </div>
        );
      default:
        return <div className="p-10 text-center text-gray-500">Selecione uma categoria para ver os campos.</div>;
    }
  };

  const activeCategoryConfig = CATEGORIES_CONFIG.find(c => c.id === category);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-black to-[#050505]">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-[#FFD700]">BH•</span> 
              {isEditing ? 'EDITAR' : 'NOVO'} ASSET
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              {activeCategoryConfig?.label}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {showCategorySelector && (
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.1em] flex items-center gap-2">
                <Info size={12} className="text-[#FFD700]" />
                Onde deseja salvar este ativo?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES_CONFIG.map(cat => (
                  <button 
                    key={cat.id} 
                    type="button" 
                    onClick={() => handleCategoryChange(cat.id)} 
                    className={`py-2 px-1 rounded-lg text-[9px] font-bold border transition-all ${
                      category === cat.id 
                      ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-lg shadow-[#FFD700]/10' 
                      : 'bg-black border-white/10 text-gray-500 hover:border-white/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {renderFields()}
            
            <div className="pt-4 border-t border-white/5">
               <label className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Tags / Palavras-chave (Separadas por vírgula)</label>
               <input 
                 type="text" 
                 name="tags_string" 
                 value={formData.tags_string || ''}
                 onChange={handleChange}
                 placeholder="vsl, dramatico, adele"
                 className="w-full bg-black border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-[#FFD700] outline-none mt-2" 
               />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3.5 text-xs font-black text-gray-500 hover:bg-white/5 rounded-xl transition-all"
            >
              CANCELAR
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-[2] py-3.5 bg-[#FFD700] text-black rounded-xl text-xs font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#FFD700]/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> 
                  PROCESSANDO...
                </>
              ) : (
                <>
                  <Save size={16} /> 
                  {isEditing ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, name, value, onChange, placeholder, required }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type="text" 
      name={name} 
      value={value || ''} 
      onChange={onChange} 
      placeholder={placeholder} 
      required={required}
      className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-700 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]/20 outline-none transition-all" 
    />
  </div>
);

export default AddAssetForm;
