import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingCart, CreditCard, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from './Toast';
import { useState } from 'react';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      showToast('Please sign in to checkout', 'warning');
      return;
    }

    setIsCheckingOut(true);
    try {
      const purchasesRef = collection(db, 'users', user.uid, 'purchases');
      
      // Process each item as a separate purchase record or a single order.
      // We will create individual purchase records for each course to match the schema.
      for (const item of items) {
        await addDoc(purchasesRef, {
          userId: user.uid,
          courseId: item.id,
          courseTitle: item.title,
          amount: item.price,
          currency: 'USD',
          status: 'succeeded',
          createdAt: serverTimestamp(),
        });
      }

      clearCart();
      setIsOpen(false);
      showToast('Checkout successful! Courses added to your account.', 'success');
    } catch (error: any) {
      console.error('Checkout error:', error);
      showToast(error.message || 'Checkout failed', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-display font-bold flex items-center text-slate-900 dark:text-white">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Your Cart ({items.length})
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Continue browsing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="w-16 h-12 bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden flex-shrink-0">
                        <img src={item.thumbnail || `https://picsum.photos/seed/${item.id}/100/100`} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</h4>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">${item.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Total</span>
                  <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm shadow-indigo-600/20 flex items-center justify-center transition-colors"
                >
                  {isCheckingOut ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CreditCard className="w-5 h-5 mr-2" />}
                  {isCheckingOut ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
