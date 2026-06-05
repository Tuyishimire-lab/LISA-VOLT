/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Trash2, ShoppingBag, Truck, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const formatRWF = (amount: number) => {
    return amount.toLocaleString() + ' RWF';
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="px-4 py-6 sm:px-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-amber-500" size={20} />
              <h2 className="text-lg font-bold text-white tracking-tight">Shopping Bag</h2>
              <span className="bg-zinc-850 text-zinc-400 font-mono text-xs px-2 py-0.5 rounded-full">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 border border-zinc-800 hover:border-amber-500 text-zinc-400 hover:text-white rounded-lg transition-colors"
              title="Close Drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Content Scroll Lists */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-full text-zinc-500">
                  <ShoppingBag size={48} />
                </div>
                <div>
                  <h3 className="text-md font-bold text-zinc-200">Your bag is empty</h3>
                  <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-1 leading-relaxed">
                    Explore our premium collections and add lighting, CCTV or wiring accessories to get started.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
                >
                  RESUME SHOPPING
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-4 flex gap-4">
                    {/* Img Thumbnail */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Details content inline */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-100 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-white shrink-0">
                            {formatRWF(item.product.price * item.quantity)}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-500 block -mt-0.5">
                          {item.product.brand}
                        </span>
                      </div>

                      {/* Management row (quantity and trash) */}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        {/* Qty controller widget */}
                        <div className="flex items-center border border-zinc-800 rounded bg-zinc-950">
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white transition-colors font-mono font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-mono text-white font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white transition-colors font-mono font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Trash wipe trigger */}
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors rounded hover:bg-zinc-950"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing calculations footer sticky */}
          {cartItems.length > 0 && (
            <div className="border-t border-zinc-800 px-4 py-6 sm:px-6 bg-zinc-950 space-y-6">
              <div className="space-y-4">
                {/* Lines summary */}
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Bag Subtotal</span>
                  <span className="font-mono text-zinc-200 font-semibold">{formatRWF(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Truck size={14} className="text-amber-500" />
                    <span>Kigali Delivery Courier</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded">
                    FREE Delivery
                  </span>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-end">
                  <span className="text-xs text-zinc-300 font-mono font-bold uppercase">Estimated Total Amount:</span>
                  <span className="text-lg font-bold font-mono text-amber-500">{formatRWF(subtotal)}</span>
                </div>
              </div>

              {/* Checkout Trigger scopes */}
              <div className="space-y-3">
                <button
                  onClick={onCheckout}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-zinc-950 font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors font-mono"
                >
                  <span>PROCEED TO SECURE CHECKOUT</span>
                  <ChevronRight size={16} />
                </button>
                <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-zinc-500">
                  <Lock size={10} className="text-emerald-500" />
                  <span>Stripe Gateway Secure Payment Enforced</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
