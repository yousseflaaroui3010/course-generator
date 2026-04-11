import { useState, useEffect } from 'react';
import { CreditCard, Download, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function Billing() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'users', user.uid, 'purchases'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const purchases = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
          course: doc.data().courseTitle || 'Unknown Course',
          amount: doc.data().amount || 0,
          status: doc.data().status || 'succeeded'
        }));
        setHistory(purchases);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        showToast('Failed to load purchase history', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [user]);

  const downloadReceipt = (invoice: any) => {
    try {
      const doc = new jsPDF();
      
      // Colors
      const primaryColor = '#4f46e5'; // Indigo 600
      const textColor = '#1e293b'; // Slate 800
      const lightText = '#64748b'; // Slate 500
      
      // Header Background
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(0, 0, 210, 40, 'F');
      
      // Logo / Brand
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(primaryColor);
      doc.text('Lumina', 20, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(lightText);
      doc.text('Receipt', 170, 25);
      
      // Invoice Details
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      doc.setFontSize(12);
      
      doc.text('Billed To:', 20, 60);
      doc.setFont('helvetica', 'bold');
      doc.text(user?.email || 'Customer', 20, 68);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Receipt Number:', 120, 60);
      doc.setFont('helvetica', 'bold');
      doc.text(invoice.id.slice(0, 8).toUpperCase(), 120, 68);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Date of Issue:', 120, 80);
      doc.setFont('helvetica', 'bold');
      doc.text(invoice.date, 120, 88);
      
      // Table Header
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.rect(20, 110, 170, 12, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(lightText);
      doc.text('DESCRIPTION', 25, 118);
      doc.text('AMOUNT', 170, 118);
      
      // Table Content
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      doc.setFontSize(11);
      doc.text(invoice.course, 25, 135);
      doc.text(`$${invoice.amount.toFixed(2)}`, 170, 135);
      
      // Line
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(20, 145, 190, 145);
      
      // Total
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total Paid', 120, 160);
      doc.setTextColor(primaryColor);
      doc.text(`$${invoice.amount.toFixed(2)}`, 170, 160);
      
      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(lightText);
      doc.text('Thank you for learning with Lumina.', 105, 280, { align: 'center' });
      
      doc.save(`Lumina-Receipt-${invoice.id.slice(0, 8).toUpperCase()}.pdf`);
      showToast('Receipt downloaded successfully', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate receipt', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Billing & Payment</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Manage your payment methods and view your purchase history.</p>
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-slate-500" />
            Payment Methods
          </h2>
          <button className="text-sm font-medium text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-slate-200 dark:border-slate-700">
            <Plus className="w-4 h-4 mr-1" /> Add New
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-9 bg-slate-800 rounded-md flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs italic tracking-wider">VISA</span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Visa ending in 4242</p>
                <p className="text-sm text-slate-500">Expires 12/28</p>
              </div>
            </div>
            <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full shadow-sm">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> Default
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">Purchase History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Course</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading purchase history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No purchases found.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{item.date}</td>
                    <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{item.course}</td>
                    <td className="p-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">${item.amount.toFixed(2)}</td>
                    <td className="p-4 text-sm whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-medium">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => downloadReceipt(item)}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
