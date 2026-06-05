/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { X, Star, ShoppingCart, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductSpecsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductSpecsModal({ product, onClose, onAddToCart }: ProductSpecsModalProps) {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const formatRWF = (amount: number) => {
    return amount.toLocaleString() + ' RWF';
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleAddToCartClick = () => {
    onAddToCart(product, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
      >
        {/* Floating Close Action Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-zinc-950/80 border border-zinc-800 hover:border-amber-500 rounded-full text-zinc-400 hover:text-white transition-colors"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Side */}
          <div className="h-64 md:h-full min-h-[250px] relative bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Out of Stock visual mask */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <ShieldAlert size={48} className="text-amber-500 animate-bounce" />
                <span className="text-md font-mono font-bold text-white tracking-widest uppercase">OUT OF STOCK</span>
                <span className="text-xs text-zinc-400 font-mono">Restocking Soon</span>
              </div>
            )}
          </div>

          {/* Details Side */}
          <div className="p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Brand and category */}
              <div className="flex items-center gap-2 justify-between">
                <span className="text-xs text-amber-500 font-mono font-bold uppercase tracking-widest">
                  {product.brand} • {product.category}
                </span>

                <div className="flex items-center gap-1.5" title={`${product.rating} stars rating`}>
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span className="text-sm font-semibold font-mono text-zinc-200">{product.rating}</span>
                  <span className="text-xs text-zinc-500 font-mono">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title heading */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-normal">
                {product.name}
              </h2>

              {/* Pricing section */}
              <div className="flex items-end gap-3 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/40 inline-flex">
                <div className="flex flex-col">
                  {hasDiscount && (
                    <span className="text-xs text-zinc-500 line-through font-mono font-semibold">
                      {formatRWF(product.originalPrice!)}
                    </span>
                  )}
                  <span className="text-lg sm:text-xl font-bold font-mono text-amber-500">
                    {formatRWF(product.price)}
                  </span>
                </div>
                {hasDiscount && (
                  <span className="bg-red-600/20 text-red-400 font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md border border-red-500/10 mb-0.5">
                    Save {((product.originalPrice! - product.price) / product.originalPrice! * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {/* Core Description block */}
              <p className="text-sm text-zinc-300 leading-relaxed">
                {product.description}
              </p>

              {/* Key Specifications Table */}
              {product.specs && (
                <div className="border-t border-zinc-800/80 pt-4 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-bold">Key Specifications</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="border-b border-zinc-850 pb-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
                        <span className="text-xs font-mono text-zinc-500 font-medium">{key}:</span>
                        <span className="text-xs text-zinc-200 font-mono text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Specs Full Array List */}
              {product.fullSpecs && product.fullSpecs.length > 0 && (
                <div className="border-t border-zinc-800/80 pt-4 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-bold">Details & Requirements</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {product.fullSpecs.map((spec, i) => (
                      <li key={i} className="text-xs text-zinc-350 leading-relaxed font-mono">
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Addition to shopping bag controller */}
            {product.inStock ? (
              <div className="pt-4 border-t border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-400 font-bold uppercase">Qty:</span>
                  <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3 py-1 bg-zinc-900 border-r border-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-colors font-mono font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 text-sm font-mono font-bold text-white">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-3 py-1 bg-zinc-900 border-l border-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-colors font-mono font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCartClick}
                  className="w-full py-3 px-5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-zinc-950 font-bold uppercase tracking-wider text-xs sm:text-sm rounded-xl cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-colors font-mono"
                >
                  <ShoppingCart size={18} />
                  <span>ADD {qty} TO SHOPPING BAG • {formatRWF(product.price * qty)}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800/60 text-zinc-400">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <span className="text-xs font-mono">Contact Kigali Store at +250 788 456 789 for waiting-list queues & orders.</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
