import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PackageX } from 'lucide-react';
import { TopBar } from '@/components/layouts/TopBar';
import { PageTransition } from '@/components/shared/PageTransition';
import { useProducts, useCategories } from '../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { CategoryChips } from './CategoryChips';
import { ProductSearchBar } from './ProductSearchBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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
      <TopBar title="Products" subtitle="Browse the expo catalogue" />
      <div className="space-y-4 px-4 pb-28 sm:px-6 md:pb-8">
        <ProductSearchBar value={search} onChange={setSearch} />
        {categories && (
          <CategoryChips categories={categories} active={activeCategory} onSelect={setActiveCategory} />
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackageX className="h-10 w-10" />}
            title="No products found"
            description="Try a different search term or category."
          />
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
