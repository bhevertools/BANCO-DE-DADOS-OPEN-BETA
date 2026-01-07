
import React from 'react';
import { CATEGORIES_CONFIG } from '../constants';
import { AssetCategory } from '../types';
import { LayoutGrid, Database } from 'lucide-react';

interface SidebarProps {
  activeCategory: AssetCategory | 'ALL';
  onCategoryChange: (category: AssetCategory | 'ALL') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-[#050505] border-r border-[#1a1a1a] flex flex-col hidden lg:flex">
      <div className="p-8 flex flex-col h-full">
        {/* Branding Textual - Substituição do Logo Quebrado */}
        <div 
          onClick={() => onCategoryChange('ALL')}
          className="cursor-pointer group mb-12"
        >
          <div className="text-white font-black text-xl tracking-tight">
            BH•HUB
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 custom-scrollbar overflow-y-auto pr-2">
          <button
            onClick={() => onCategoryChange('ALL')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${
              activeCategory === 'ALL' 
              ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.2)]' 
              : 'text-gray-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Database size={18} />
            DASHBOARD
          </button>

          <div className="pt-8 pb-3 px-4">
            <p className="text-[10px] uppercase font-black text-gray-700 tracking-[0.2em]">Biblioteca</p>
          </div>

          {CATEGORIES_CONFIG.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id 
                ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.2)]' 
                : 'text-gray-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={activeCategory === cat.id ? 'text-black' : 'text-gray-600'}>
                {cat.icon}
              </span>
              {cat.label.toUpperCase()}
            </button>
          ))}
        </nav>

        {/* Footer info */}
        <div className="pt-6 border-t border-[#1a1a1a] mt-6">
          <div className="bg-[#111] p-4 rounded-2xl border border-white/5 mb-4">
            <p className="text-[9px] font-black text-gray-600 uppercase mb-2 tracking-widest">Acesso Sistema</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
              <span className="text-[10px] text-white font-bold uppercase">Online & Sincronizado</span>
            </div>
          </div>
          
          <div className="px-1">
            <p className="text-[8px] font-black text-gray-700 tracking-[0.15em] uppercase text-center group">
              Desenvolvido por <span className="text-gray-500 group-hover:text-[#FFD700] transition-colors duration-500">DARK KNIGHTS</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
