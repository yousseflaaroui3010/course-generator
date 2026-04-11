import React, { useRef, useState } from 'react';
import { Award, Download, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '../contexts/AuthContext';

interface CertificateModalProps {
  courseTitle: string;
  issueDate: string;
  onClose: () => void;
}

export default function CertificateModal({ courseTitle, issueDate, onClose }: CertificateModalProps) {
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificate_${courseTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <Award className="w-5 h-5 mr-2 text-indigo-600" />
            Your Certificate
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 overflow-auto flex-1 flex justify-center items-center bg-gray-100 dark:bg-gray-950">
          {/* Certificate Container (The part that gets captured) */}
          <div 
            ref={certificateRef}
            className="relative w-full max-w-[800px] aspect-[1.414/1] bg-white border-[16px] border-indigo-900 p-12 flex flex-col items-center justify-center text-center shadow-lg"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-500"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-500"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-500"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-500"></div>

            <div className="mb-6">
              <Award className="w-20 h-20 text-amber-500 mx-auto" />
            </div>
            
            <h1 className="text-5xl font-black text-indigo-900 mb-2 uppercase tracking-widest">Certificate</h1>
            <h2 className="text-2xl font-medium text-gray-600 tracking-widest uppercase mb-10">of Completion</h2>
            
            <p className="text-lg text-gray-500 italic mb-4">This is to certify that</p>
            
            <h3 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-gray-300 pb-2 px-12 inline-block">
              {user?.displayName || user?.email?.split('@')[0] || 'Student'}
            </h3>
            
            <p className="text-lg text-gray-500 italic mb-4">has successfully completed the course</p>
            
            <h4 className="text-3xl font-bold text-indigo-800 mb-12 max-w-2xl leading-tight">
              {courseTitle}
            </h4>
            
            <div className="flex justify-between w-full max-w-lg mt-auto px-8">
              <div className="text-center">
                <div className="border-b border-gray-400 pb-1 mb-1 px-4 text-gray-800 font-medium">
                  {new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <span className="text-sm text-gray-500 uppercase tracking-wider">Date</span>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 pb-1 mb-1 px-4 text-indigo-900 font-bold" style={{ fontFamily: 'cursive' }}>
                  LuminaLearn
                </div>
                <span className="text-sm text-gray-500 uppercase tracking-wider">Platform</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end bg-gray-50 dark:bg-gray-800/50">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center transition-all"
          >
            {isDownloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
