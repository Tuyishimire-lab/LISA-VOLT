/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, ShoppingCart, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (product: Product, e: any) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const formatRWF = (amount: number) => {
    return amount.toLocaleString() + ' RWF';
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
    >
      {/* Visual BADGES */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isHot && (
          <span className="bg-red-600 text-white font-mono font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-md uppercase shadow-sm">
            HOT
          </span>
        )}
        {product.isTrending && (
          <span className="bg-blue-600 text-white font-mono font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-md uppercase shadow-sm">
            TRENDING
          </span>
        )}
        {product.isNew && (
          <span className="bg-amber-500 text-zinc-950 font-mono font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-md uppercase shadow-sm">
            NEW ARRIVAL
          </span>
        )}
        {!product.inStock && (
          <span className="bg-zinc-800 text-zinc-400 font-mono font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-md uppercase">
            SOLD OUT
          </span>
        )}
      </div>

      {/* Discount Percentage Floating Badge */}
      {hasDiscount && product.inStock && (
        <div className="absolute top-3 right-3 z-10 bg-red-600 text-white font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md animate-pulse">
          -{discountPercent}%
        </div>
      )}

      {/* Image Block */}
      <div className="h-48 overflow-hidden bg-zinc-950 relative shrink-0">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
          <span className="bg-zinc-900/95 border border-zinc-700/80 text-zinc-200 text-xs py-1 px-2.5 rounded-lg font-mono flex items-center gap-1">
            <Info size={12} className="text-amber-500" /> Specs Details
          </span>
        </div>
      </div>

      {/* Card Content Bodys */}
      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
        
        {/* Brand & Stars Indicator Row */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] tracking-[0.15em] font-mono font-bold text-zinc-500 uppercase">
              {product.brand}
            </span>
            <div className="flex items-center gap-1" title={`${product.rating} stars rating`}>
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span className="text-xs font-mono font-bold text-zinc-300">{product.rating}</span>
              <span className="text-[10px] text-zinc-500 font-mono">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 className="text-sm font-semibold tracking-tight text-zinc-100 mt-1 line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing and Action trigger */}
        <div className="pt-2 border-t border-zinc-800/60 mt-auto">
          <div className="flex items-center justify-between gap-2">
            {/* Price block */}
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-xs text-zinc-500 line-through font-mono font-semibold">
                  {formatRWF(product.originalPrice!)}
                </span>
              )}
              <span className="text-sm font-bold font-mono text-white tracking-tight">
                {formatRWF(product.price)}
              </span>
            </div>

            {/* Quick Add To Cart Button */}
            {product.inStock ? (
              <button
                onClick={(e) => onAddToCart(product, e)}
                className="p-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-zinc-950 rounded-lg cursor-pointer transition-colors shadow-md"
                title="Add to Cart"
              >
                <ShoppingCart size={16} />
              </button>
            ) : (
              <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-800 px-2.5 py-1.5 rounded-lg uppercase">
                SOLD OUT
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
