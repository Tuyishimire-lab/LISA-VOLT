/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, ShieldCheck, Mail, Phone, Clock, ArrowRight, Zap, CheckCircle2, ShoppingCart, ArrowUpRight, ArrowRightCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryID, Product, CartItem } from './types';
import { PRODUCTS, REVIEWS } from './data';
import { auth } from './firebase';

// Subcomponents
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import ProductCard from './components/ProductCard';
import ProductSpecsModal from './components/ProductSpecsModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import Footer from './components/Footer';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryID | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Drawer toggles
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Status flags
  const [placedOrderCode, setPlacedOrderCode] = useState<string | null>(null);
  const [stripeSuccessCode, setStripeSuccessCode] = useState<string | null>(null);

  // Sync user credentials on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          emailVerified: user.emailVerified
        });
      } else {
        setCurrentUser(null);
      }
    });

    // Load cart items from localStorage
    try {
      const savedCart = localStorage.getItem('lisavolt_cart_kigali');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn('Could not read local storage cart', e);
    }

    // Check Stripe checkout redirect status query parameters
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const orderId = params.get('orderId');

    if (status === 'success' && orderId) {
      setStripeSuccessCode(orderId.replace('LV-', ''));
      // Clear cart locally since purchase was successfully authorized
      try {
        localStorage.removeItem('lisavolt_cart_kigali');
        setCart([]);
      } catch (e) {
        setCart([]);
      }
      // Clean query parameters from URL path
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => unsubscribe();
  }, []);

  // Save cart to local storage whenever it changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('lisavolt_cart_kigali', JSON.stringify(newCart));
    } catch (e) {
      console.warn('Could not persist cart to local storage', e);
    }
  };

  // Add Item to cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const updatedCart = [...cart];

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({ product, quantity });
    }

    saveCart(updatedCart);

    // Provide micro haptic feed or small notification trigger
    setIsCartOpen(true);
  };

  const handleAddToCartFromCard = (product: Product, e: any) => {
    e.stopPropagation(); // prevent triggering the specs modal opening
    handleAddToCart(product, 1);
  };

  // Manage Cart item Qty
  const handleUpdateQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCart(updatedCart);
  };

  // Remove individual Item
  const handleRemoveItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    saveCart(updatedCart);
  };

  // Logout trigger
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback
      setCurrentUser(null);
    }
  };

  // Checkout proceeding trigger
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (!currentUser) {
      // Trigger authentication login first to assign orders securely
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  // Placed Order success callback
  const handleOrderSuccess = (orderId: string) => {
    setPlacedOrderCode(orderId);
    saveCart([]); // wipe local cart
    setIsCheckoutOpen(false);
  };

  // Filter Catalog dynamically
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-150 flex flex-col font-sans select-none selection:bg-amber-500 selection:text-zinc-950">
      
      {/* Header component overlay */}
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={currentUser}
        onLogout={handleLogout}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Sliders (only if search is empty or showing all items to preserve screen focus on lists) */}
      {searchQuery === '' && (
        <HeroSlider onCategoryClick={setSelectedCategory} />
      )}

      {/* Main Body Layout content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Success Transact Banners (Placed orders / Stripe returns) */}
        <AnimatePresence>
          {(placedOrderCode || stripeSuccessCode) && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-zinc-900 border-2 border-emerald-500/30 rounded-2xl shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">
                    Murakoze Cyane! Payment Pre-Authorized Successfully
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5 leading-relaxed">
                    Order Reference ID: <strong className="text-amber-500">LV-{placedOrderCode || stripeSuccessCode}</strong>.
                    An expert technician in Kigali will contact you immediately via phone to schedule delivery and on-site hardware mounting.
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setPlacedOrderCode(null);
                    setStripeSuccessCode(null);
                  }}
                  className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
                >
                  DISMISS RECEIPT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section header coordinates */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white uppercase font-sans">
              {selectedCategory === 'all' ? 'All Products' : `${selectedCategory} catalog`}
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Showing {filteredProducts.length} certified high-quality item{filteredProducts.length === 1 ? '' : 's'} available in store
            </p>
          </div>

          {/* Quick Filters / badges indicator inside catalog */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-zinc-500 uppercase">Tags:</span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono px-2.5 py-1 rounded-full uppercase font-bold">
              Kigali Delivery
            </span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono px-2.5 py-1 rounded-full uppercase font-bold">
              Stripe PCI Secures
            </span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono px-2.5 py-1 rounded-full uppercase font-bold">
              Official Warranty
            </span>
          </div>
        </div>

        {/* Empty Search Fallback */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 border border-dashed border-zinc-800 text-center rounded-2xl bg-zinc-950">
            <h3 className="text-md font-mono font-bold text-zinc-400">No items match your specifications</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Try exploring alternative keywords or reset catalogs filters to view full wholesale details.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500 text-xs font-mono font-bold rounded-lg text-zinc-300 transition-colors"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          /* Products Grid Layout (Precise desktop responsive ratios) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCartFromCard}
                onViewDetails={(prod) => setViewingProduct(prod)}
              />
            ))}
          </div>
        )}

        {/* Real Customer Testimony Section in Kigali (Rwanda) */}
        {searchQuery === '' && selectedCategory === 'all' && (
          <section className="mt-20 border-t border-zinc-900 pt-16">
            <div className="space-y-2 mb-10 text-center">
              <span className="text-xs font-mono uppercase text-amber-500 font-bold tracking-widest block">TRUSTED IN RWANDA</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-none uppercase font-sans">
                KIGALI BUILDERS REVIEW US
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Read direct feedbacks from contractors, homeowners, and technicians who trust LISA VOLT LINK materials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="p-6 bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 rounded-xl space-y-4 flex flex-col justify-between transition-colors"
                >
                  <div className="space-y-2">
                    {/* Stars bar */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-350 leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3 mt-4 text-[11px] font-mono">
                    <span className="text-zinc-100 font-semibold">{review.name}</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                      ✓ Kigali Client
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Cart Slider Overlay Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleProceedToCheckout}
          />
        )}
      </AnimatePresence>

      {/* Specifications Card details view popup popup */}
      <AnimatePresence>
        {viewingProduct && (
          <ProductSpecsModal
            product={viewingProduct}
            onClose={() => setViewingProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* User Login/Register Modal Popup */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              setIsCheckoutOpen(true); // resume checkout progression directly once login completes!
            }}
          />
        )}
      </AnimatePresence>

      {/* Stripe secure checkout details popup */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cart}
            user={currentUser}
            onSuccess={handleOrderSuccess}
          />
        )}
      </AnimatePresence>

      {/* Footer layout */}
      <Footer onSelectCategory={(cat) => {
        setSelectedCategory(cat);
        // Scroll back smoothly to catalog focus
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }} />

    </div>
  );
}
