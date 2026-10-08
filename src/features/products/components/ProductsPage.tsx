import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createCategory, createProduct, deleteProduct, updateProduct } from '@/services/backendApi';
import { getAdminPassword, setAdminPassword, clearAdminPassword } from '@/services/apiClient';
import type { Product } from '@/types';
import { motion } from 'framer-motion';
import { PackageX, LockKeyhole, Trash2, Pencil, Plus, LogOut, Camera, ImagePlus, X, Upload } from 'lucide-react';
import { TopBar } from '@/components/layouts/TopBar';
import { PageTransition } from '@/components/shared/PageTransition';
import { useProducts, useCategories } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { CategoryChips } from './CategoryChips';
import { ProductSearchBar } from './ProductSearchBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

const MAX_IMAGE_DIMENSION = 1400;
const IMAGE_QUALITY = 0.78;

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.onload = () => {
      const source = String(reader.result);
      const image = new Image();
      image.onerror = () => reject(new Error('Could not process the image.'));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(source);
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(() => Boolean(getAdminPassword()));
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [draggingImage, setDraggingImage] = useState(false);
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  function unlock() {
    if (!password.trim()) return;
    setAdminPassword(password.trim());
    setAdminUnlocked(true);
    setPassword('');
    setError('');
  }

  function lock() {
    clearAdminPassword();
    setAdminUnlocked(false);
  }

  function edit(p: Product) {
    setEditing(p);
    setName(p.name);
    setCategoryId(p.categoryId);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setImageUrl(p.imageUrl || '');
    setImageError('');
    setCostPrice(String(p.costPrice ?? 0));
    setError('');
    setShowForm(true);
  }

  function newProduct() {
    setEditing(null);
    setName('');
    setCategoryId(categories?.[0]?.id ?? '');
    setPrice('');
    setStock('0');
    setImageUrl('');
    setImageError('');
    setCostPrice('0');
    setError('');
    setShowForm(true);
  }

  async function handleImageFile(file?: File) {
    if (!file) return;
    setImageError('');
    try {
      const compressed = await readImageFile(file);
      setImageUrl(compressed);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Could not use that image.');
    }
  }

  function handleImageDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDraggingImage(false);
    void handleImageFile(event.dataTransfer.files?.[0]);
  }

  function handleImagePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const imageFile = Array.from(event.clipboardData.files).find((file) => file.type.startsWith('image/'));
    if (imageFile) {
      event.preventDefault();
      void handleImageFile(imageFile);
    }
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!adminUnlocked) return;
    setError('');
    setBusy(true);
    try {
      const data = {
        name: name.trim(),
        categoryId,
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(stock),
        imageUrl: imageUrl.trim(),
      };
      if (editing) await updateProduct(editing.id, data);
      else await createProduct(data);
      await queryClient.invalidateQueries();
      setShowForm(false);
      setEditing(null);
      setName('');
      setPrice('');
      setStock('0');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save product.');
    } finally {
      setBusy(false);
    }
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!adminUnlocked || !categoryName.trim()) return;
    setBusy(true);
    setError('');
    try {
      const c = await createCategory({ name: categoryName.trim(), icon: 'package' });
      setCategoryId(c.id);
      setCategoryName('');
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add category.');
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(product: Product) {
    if (!adminUnlocked) return;
    if (!window.confirm(`Delete “${product.name}”? It will be hidden from sales but historical orders will remain.`)) return;
    setBusy(true);
    setError('');
    try {
      await deleteProduct(product.id);
      await queryClient.invalidateQueries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete product.');
    } finally {
      setBusy(false);
    }
  }

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  return (
    <PageTransition>
      <TopBar title="Products" subtitle="Manage the expo catalogue" />
      <div className="space-y-4 px-4 pb-28 sm:px-6 md:pb-8">
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Product management</p>
              <p className="text-xs text-[var(--color-muted)]">Admin access is required to add, edit or delete products.</p>
            </div>
            {adminUnlocked ? (
              <button className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold" onClick={lock}>
                <LogOut className="h-4 w-4" /> Lock admin
              </button>
            ) : (
              <div className="flex gap-2">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && unlock()} placeholder="Admin password" className="w-40 rounded-xl border p-2 text-sm" />
                <button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white" onClick={unlock}>
                  <LockKeyhole className="h-4 w-4" /> Unlock
                </button>
              </div>
            )}
          </div>
          {adminUnlocked && (
            <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-semibold text-white" onClick={newProduct}>
              <Plus className="h-4 w-4" /> Add product
            </button>
          )}
        </section>

        {showForm && adminUnlocked && (
          <section className="space-y-3 rounded-2xl border p-4">
            <h2 className="font-semibold">{editing ? 'Edit / restock product' : 'New product'}</h2>
            {!editing && (
              <form onSubmit={addCategory} className="flex gap-2">
                <input className="flex-1 rounded border p-2" placeholder="New category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                <button disabled={busy} className="rounded bg-slate-800 px-3 text-white">Add category</button>
              </form>
            )}
            <form onSubmit={saveProduct} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input required className="rounded border p-2" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
              <select required className="rounded border p-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input required min="0" step="0.01" type="number" className="rounded border p-2" placeholder="Sale price" value={price} onChange={(e) => setPrice(e.target.value)} />
              <input min="0" step="0.01" type="number" className="rounded border p-2" placeholder="Cost price" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
              <input required min="0" step="1" type="number" className="rounded border p-2" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
              <div className="space-y-3 sm:col-span-2">
                <div
                  tabIndex={0}
                  onDragEnter={(e) => { e.preventDefault(); setDraggingImage(true); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    if (e.currentTarget === e.target) setDraggingImage(false);
                  }}
                  onDrop={handleImageDrop}
                  onPaste={handleImagePaste}
                  className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${draggingImage ? 'border-orange-500 bg-orange-50' : 'border-[var(--color-border)] bg-[var(--color-card)]'}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {imageUrl ? (
                      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border bg-white">
                        <img src={imageUrl} alt="Product preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          aria-label="Remove product image"
                          onClick={() => setImageUrl('')}
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-muted)]">
                        <ImagePlus className="h-8 w-8" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Product image</p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Paste an image, drag & drop one, choose from your device, or take a photo directly on your phone.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          ref={imagePickerRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { void handleImageFile(e.target.files?.[0]); e.currentTarget.value = ''; }}
                        />
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => { void handleImageFile(e.target.files?.[0]); e.currentTarget.value = ''; }}
                        />
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"
                          onClick={() => imagePickerRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" /> Choose image
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white"
                          onClick={() => cameraInputRef.current?.click()}
                        >
                          <Camera className="h-4 w-4" /> Take photo
                        </button>
                      </div>
                    </div>
                  </div>
                  {imageError && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{imageError}</p>}
                </div>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <button disabled={busy} className="rounded bg-orange-500 px-4 py-2 text-white">{busy ? 'Saving…' : 'Save product'}</button>
                <button type="button" className="rounded border px-4 py-2" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
            {error && <p role="alert" className="text-red-600">{error}</p>}
          </section>
        )}

        {!isLoading && products?.length === 0 && !error && (
          <EmptyState icon={<PackageX className="h-10 w-10" />} title="No products yet" description={adminUnlocked ? 'Add your first category and product to start selling.' : 'Unlock admin access to add your first product.'} />
        )}

        <ProductSearchBar value={search} onChange={setSearch} />
        {categories && categories.length > 0 && <CategoryChips categories={categories} active={activeCategory} onSelect={setActiveCategory} />}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
          </div>
        ) : filtered.length === 0 && (products?.length ?? 0) > 0 ? (
          <EmptyState icon={<PackageX className="h-10 w-10" />} title="No products found" description="Try a different search term or category." />
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product, i) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} index={i} />
                {adminUnlocked && (
                  <div className="mt-2 flex gap-2">
                    <button disabled={busy} className="inline-flex flex-1 items-center justify-center gap-1 rounded border px-2 py-1.5 text-xs font-semibold" onClick={() => edit(product)}><Pencil className="h-3.5 w-3.5" /> Edit</button>
                    <button disabled={busy} className="inline-flex items-center justify-center gap-1 rounded border border-red-300 px-2 py-1.5 text-xs font-semibold text-red-600" onClick={() => removeProduct(product)}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
        {error && !showForm && <p role="alert" className="text-red-600">{error}</p>}
      </div>
    </PageTransition>
  );
}
