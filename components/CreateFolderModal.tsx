import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateFolderModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[#0B0B0B] border border-white/10 rounded-2xl p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Nova pasta</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome da pasta"
          className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 mb-4"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-400">Cancelar</button>
          <button
            onClick={() => onCreate(name)}
            className="bg-[#FFD700] text-black font-bold px-4 py-2 rounded-xl"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}
