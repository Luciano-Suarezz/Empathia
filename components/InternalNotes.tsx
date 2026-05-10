import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Copy, Edit2, Trash2, Check, X, StickyNote, Save, Download, Upload, GripVertical, FolderPlus, Folder, Tag, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { InternalNote, Category } from '../types';
import yaml from 'js-yaml';
import { motion, AnimatePresence } from 'motion/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableNoteItemProps {
  note: InternalNote;
  copiedId: string | null;
  handleCopy: (note: InternalNote) => void;
  handleOpenEdit: (note: InternalNote) => void;
  handleDelete: (id: string) => void;
}

const SortableNoteItem: React.FC<SortableNoteItemProps> = ({ 
  note, 
  copiedId, 
  handleCopy, 
  handleOpenEdit, 
  handleDelete 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex flex-col glass rounded-2xl p-4 border border-gray-100/50 dark:border-zinc-800/50 shadow-sm hover:shadow-premium dark:hover:shadow-premium-dark transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-900/50 cursor-pointer overflow-hidden h-40
        ${isDragging ? 'ring-2 ring-indigo-500 shadow-2xl scale-105 z-50' : ''}
      `}
      onClick={() => handleCopy(note)}
    >
      {/* Header with Drag Handle & Actions */}
      <div className="flex items-start justify-between mb-2">
        <div 
          {...attributes}
          {...listeners}
          className="p-1.5 -ml-1 text-gray-300 dark:text-zinc-700 hover:text-indigo-400 dark:hover:text-indigo-500 cursor-grab active:cursor-grabbing transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(note);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-indigo-500 transition-colors"
            title="Editar nota"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(note.id);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            title="Eliminar nota"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-black text-gray-800 dark:text-zinc-100 text-base line-clamp-2 mb-1 select-none font-display uppercase tracking-tight">
          {note.title}
        </h3>
        <p className="text-xs text-gray-400 dark:text-zinc-500 line-clamp-3 select-none leading-relaxed">
          {note.content}
        </p>
      </div>

      {/* Copy Feedback Overlay */}
      <AnimatePresence>
        {copiedId === note.id && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center z-10"
          >
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-full shadow-premium dark:shadow-premium-dark border border-emerald-200 dark:border-emerald-900/50">
              <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const InternalNotes: React.FC = () => {
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingNote, setEditingNote] = useState<InternalNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteCategoryId, setNoteCategoryId] = useState<string>('');
  
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load data from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('empathia_internal_notes');
    const savedCategories = localStorage.getItem('empathia_internal_categories');
    
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Error loading notes", e);
      }
    }
    
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error("Error loading categories", e);
      }
    } else {
      const defaultCat: Category = { id: 'default', name: 'General' };
      setCategories([defaultCat]);
      localStorage.setItem('empathia_internal_categories', JSON.stringify([defaultCat]));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('empathia_internal_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('empathia_internal_categories', JSON.stringify(categories));
  }, [categories]);

  const filteredNotes = useMemo(() => {
    if (selectedCategoryId === 'all') return notes;
    return notes.filter(n => n.categoryId === selectedCategoryId || (!n.categoryId && selectedCategoryId === 'default'));
  }, [notes, selectedCategoryId]);

  const handleOpenAdd = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setNoteCategoryId(selectedCategoryId === 'all' ? (categories[0]?.id || 'default') : selectedCategoryId);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: InternalNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setNoteCategoryId(note.categoryId || 'default');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, title, content, categoryId: noteCategoryId } : n));
    } else {
      const newNote: InternalNote = {
        id: crypto.randomUUID(),
        title,
        content,
        categoryId: noteCategoryId,
        timestamp: Date.now()
      };
      setNotes(prev => [newNote, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleCopy = async (note: InternalNote) => {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopiedId(note.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) return;
    
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: categoryName } : c));
    } else {
      const newCat: Category = {
        id: crypto.randomUUID(),
        name: categoryName
      };
      setCategories(prev => [...prev, newCat]);
    }
    setCategoryName('');
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (id === 'default') {
      alert('No puedes eliminar la categoría por defecto.');
      return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría? Las notas en ella pasarán a "General".')) {
      setNotes(prev => prev.map(n => n.categoryId === id ? { ...n, categoryId: 'default' } : n));
      setCategories(prev => prev.filter(c => c.id !== id));
      if (selectedCategoryId === id) setSelectedCategoryId('all');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleExportYAML = () => {
    try {
      const data = { notes, categories };
      const yamlStr = yaml.dump(data);
      navigator.clipboard.writeText(yamlStr);
      alert('Datos exportados al portapapeles en formato YAML');
    } catch (e) {
      console.error("Error exporting YAML", e);
      alert('Error al exportar los datos');
    }
  };

  const handleImportYAML = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        alert('El portapapeles está vacío');
        return;
      }

      let data: any;
      try {
        // Try to load as YAML (YAML is a superset of JSON, so it handles both)
        data = yaml.load(text);
      } catch (e) {
        console.error("Error parsing YAML", e);
        alert('El contenido del portapapeles no es un formato válido (YAML/JSON)');
        return;
      }

      if (data && data.notes && data.categories) {
        if (confirm('¿Importar datos? Esto reemplazará todas tus notas y categorías actuales.')) {
          setNotes(data.notes);
          setCategories(data.categories);
          alert('Datos importados con éxito');
        }
      } else {
        alert('El formato de los datos no es válido. Debe contener notas y categorías.');
      }
    } catch (e) {
      console.error("Error importing data", e);
      alert('Error al importar los datos');
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-6xl mx-auto w-full pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-lg p-8 rounded-[2.5rem] shadow-premium dark:shadow-premium-dark border border-white/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-600/20 relative group">
            <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] scale-0 group-hover:scale-100 transition-transform duration-500"></div>
            <StickyNote className="w-7 h-7 text-white relative" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-display uppercase">Notas Internas</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">Gestiona tus plantillas y categorías.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportYAML}
            title="Exportar todo (YAML)"
            className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm hover:shadow-md"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleImportYAML}
            title="Importar todo (YAML)"
            className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm hover:shadow-md"
          >
            <Upload className="w-5 h-5" />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/30 transition-all font-black text-xs uppercase tracking-widest active:scale-95 ml-2 hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Nota</span>
          </button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 px-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`
            px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border
            ${selectedCategoryId === 'all' 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-800'}
          `}
        >
          Todas
        </button>
        {categories.map(cat => (
          <div key={cat.id} className="relative group flex-shrink-0">
            <button
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`
                px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border pr-12
                ${selectedCategoryId === cat.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-800'}
              `}
            >
              {cat.name}
            </button>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCategory(cat);
                  setCategoryName(cat.name);
                  setIsCategoryModalOpen(true);
                }}
                className={`p-1 rounded-md hover:bg-black/10 ${selectedCategoryId === cat.id ? 'text-white' : 'text-gray-400'}`}
              >
                <Edit2 className="w-3 h-3" />
              </button>
              {cat.id !== 'default' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.id);
                  }}
                  className={`p-1 rounded-md hover:bg-black/10 ${selectedCategoryId === cat.id ? 'text-white' : 'text-gray-400'}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryName('');
            setIsCategoryModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-gray-50/50 dark:bg-zinc-800/30 text-gray-400 dark:text-zinc-500 border border-dashed border-gray-300 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all whitespace-nowrap"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-20 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-zinc-800 mx-2"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-gray-300">
            <StickyNote className="w-10 h-10" />
          </div>
          <p className="text-gray-500 dark:text-zinc-400 font-black uppercase tracking-widest text-xs">No hay notas en esta categoría.</p>
          <button onClick={handleOpenAdd} className="mt-4 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-[10px] hover:underline">Crea una nota ahora</button>
        </motion.div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredNotes.map(n => n.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map(note => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SortableNoteItem 
                      note={note}
                      copiedId={copiedId}
                      handleCopy={handleCopy}
                      handleOpenEdit={handleOpenEdit}
                      handleDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Note Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/20 dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
                <h2 className="text-xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">
                  {editingNote ? 'Editar Nota' : 'Nueva Nota'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Categoría</label>
                  <select
                    value={noteCategoryId}
                    onChange={(e) => setNoteCategoryId(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none font-bold text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Título</label>
                  <input
                    autoFocus
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Saludo inicial"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Contenido</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe lo que se copiará..."
                    rows={5}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-medium leading-relaxed"
                  />
                </div>
              </div>
              <div className="px-8 py-6 bg-gray-50 dark:bg-zinc-950/30 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 dark:text-zinc-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !content.trim()}
                  className="flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/30 transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="w-5 h-5" />
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" 
              onClick={() => setIsCategoryModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl w-full max-w-sm border border-white/20 dark:border-zinc-800 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
                <h2 className="text-lg font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
              </div>
              <div className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Nombre</label>
                  <input
                    autoFocus
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Ej: Reembolsos"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCategory()}
                  />
                </div>
              </div>
              <div className="px-8 py-6 bg-gray-50 dark:bg-zinc-950/30 flex justify-end gap-3">
                <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Cancelar</button>
                <button
                  onClick={handleSaveCategory}
                  disabled={!categoryName.trim()}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
