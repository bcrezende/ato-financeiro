import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, Sparkles, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface DreamItem {
  id: string;
  base64: string;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'wide' | 'tall';
}

const STORAGE_KEY = 'ato-financeiro-dream-board';

const SIZE_CYCLE: DreamItem['size'][] = ['wide', 'sm', 'tall', 'sm', 'md', 'lg', 'wide', 'sm', 'sm', 'tall', 'md', 'sm'];

const sizeClasses: Record<DreamItem['size'], string> = {
  sm:   'col-span-1 row-span-1',
  md:   'col-span-1 row-span-2',
  lg:   'col-span-2 row-span-2',
  wide: 'col-span-2 row-span-1',
  tall: 'col-span-1 row-span-2',
};

function load(): DreamItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
}
function save(items: DreamItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const DreamBoardPage = () => {
  const [items, setItems] = useState<DreamItem[]>(load);
  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  const addItem = () => {
    if (!preview) return;
    const newItem: DreamItem = {
      id: crypto.randomUUID(),
      base64: preview,
      title: title.trim(),
      size: SIZE_CYCLE[items.length % SIZE_CYCLE.length],
    };
    const updated = [...items, newItem];
    setItems(updated);
    save(updated);
    setPreview(null);
    setTitle('');
    setModalOpen(false);
  };

  const removeItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    save(updated);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPreview(null);
    setTitle('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header — gradient hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-white/20">
              <Sparkles className="w-3 h-3" />
              Inspiração diária
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">Quadro dos Sonhos</h1>
            <p className="text-sm text-amber-50/90">
              Visualize seus objetivos e mantenha a motivação no dia a dia
            </p>
          </div>
          <Button
            onClick={() => fileRef.current?.click()}
            className="!bg-white !text-amber-700 hover:!bg-amber-50 shadow-xl whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Adicionar Sonho
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ''; }}
        />
      </div>

      {items.length === 0 ? (
        /* Empty state — drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`
            relative overflow-hidden flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed cursor-pointer
            transition-all duration-300 min-h-[420px] p-6
            ${dragging
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 scale-[1.01]'
              : 'border-gray-300 dark:border-gray-700 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
            }
          `}
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-200/50 dark:shadow-amber-900/40 animate-float">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -inset-3 bg-amber-300/30 rounded-3xl blur-xl -z-10" />
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-gray-700 dark:text-gray-200">Seu quadro está vazio</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Adicione fotos dos seus objetivos — uma viagem, uma casa, um carro — e mantenha-os visíveis todos os dias
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-xl">
            <Upload className="w-4 h-4" />
            Arrastar ou clicar para carregar
          </div>
        </div>
      ) : (
        /* Mosaic grid */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-3 rounded-2xl transition-all
            ${dragging ? 'ring-2 ring-amber-400 ring-offset-2' : ''}
          `}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={`${sizeClasses[item.size]} relative group rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-sm hover:shadow-lg transition-shadow`}
            >
              <img
                src={item.base64}
                alt={item.title || 'Sonho'}
                className="w-full h-full object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
              {/* Delete button */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {/* Title */}
              {item.title && (
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium truncate">{item.title}</p>
                </div>
              )}
            </div>
          ))}

          {/* Always-visible add tile */}
          <div
            onClick={() => fileRef.current?.click()}
            className="col-span-1 row-span-1 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
          >
            <Plus className="w-7 h-7 text-gray-400 group-hover:text-amber-500" />
            <span className="text-xs text-gray-400">Adicionar</span>
          </div>
        </div>
      )}

      {/* Add image modal */}
      <Modal open={modalOpen} onClose={closeModal} title="Adicionar ao Quadro">
        <div className="space-y-4">
          {preview && (
            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video">
              <img src={preview} alt="preview" className="w-full h-full object-contain" />
              <button
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!preview && (
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-10 cursor-pointer hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-500">Clique para escolher uma imagem</p>
            </div>
          )}

          <Input
            label="Título (opcional)"
            placeholder="Ex: Viagem para Paris, Casa própria..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancelar</Button>
            <Button onClick={addItem} disabled={!preview}>
              Adicionar ao Quadro
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
