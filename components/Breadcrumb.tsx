interface Props {
  categoryLabel: string;
  folderName?: string | null;
  onBack: () => void;
}

export default function Breadcrumb({ categoryLabel, folderName, onBack }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
      <button onClick={onBack} className="hover:text-[#FFD700]">
        {categoryLabel}
      </button>
      {folderName && (
        <>
          <span>/</span>
          <span className="text-white font-semibold">{folderName}</span>
        </>
      )}
    </div>
  );
}
