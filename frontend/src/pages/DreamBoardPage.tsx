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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Quadro dos Sonhos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Visualize seus objetivos todos os dias
          </p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => fileRef.current?.click()}
        >
          Adicionar Sonho
        </Button>
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
            flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer
            transition-colors min-h-[420px]
            ${dragging
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10'
            }
          `}
        >
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-amber-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Seu quadro está vazio</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Arraste imagens aqui ou clique para adicionar seus sonhos
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
            <Upload className="w-4 h-4" />
            Carregar imagem
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
