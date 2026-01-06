import { Folder } from '../types';
import { Folder as FolderIcon } from 'lucide-react';

interface Props {
  folder: Folder;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function FolderCard({ folder, onOpen, onRename, onDelete }: Props) {
  return (
    <div
      onClick={onOpen}
      className="group bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-[#FFD700] transition-all relative"
    >
      <div className="flex items-center justify-between mb-4">
        <FolderIcon size={32} className="text-[#FFD700]" />
        <div className="opacity-0 group-hover:opacity-100 transition">
          <button onClick={(e) => { e.stopPropagation(); onRename(); }}>
            ✎
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="ml-2 text-red-500">
            ✕
          </button>
        </div>
      </div>

      <div className="text-sm font-bold truncate">{folder.name}</div>
    </div>
  );
}
