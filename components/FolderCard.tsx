import { Folder } from '../types';

interface Props {
  folder: Folder | { id: string; name: string };
  count: number;
  onOpen: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  locked?: boolean;
}

export default function FolderCard({
  folder,
  count,
  onOpen,
  onRename,
  onDelete,
  locked
}: Props) {
  return (
    <div
      onClick={onOpen}
      className="group bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-[#FFD700] transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#FFD700] text-2xl">📁</span>

        {!locked && (
          <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); onRename?.(); }}>
              ✎
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="font-bold text-sm truncate">{folder.name}</div>
      <div className="text-xs text-gray-400 mt-1">
        {count} {count === 1 ? 'item' : 'itens'}
      </div>
    </div>
  );
}
