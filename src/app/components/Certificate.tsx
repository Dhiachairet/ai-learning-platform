'use client';

import { useEffect, useState } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  SparklesIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserIcon,
  TrophyIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';





interface CertificateProps {
  certificate: {
    _id: string;
    certificateId: string;
    studentName: string;
    courseName: string;
    instructorName: string;
    issueDate: string;
    completionDate: string;
    metadata?: {
      level?: string;
      category?: string;
      quizScore?: number;
    };
  };
  onClose?: () => void;
}

export default function CertificateViewer({ certificate, onClose }: CertificateProps) {
  const [downloading, setDownloading] = useState(false);
  const [shareText, setShareText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const text = `I'm proud to share that I've completed the "${certificate.courseName}" course! 🎓\n\nCertificate ID: ${certificate.certificateId}\nIssued by LearnAI Hub`;
    setShareText(text);
  }, [certificate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const showStatusMessage = (message: string, type: 'success' | 'error') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

const downloadPDF = () => {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4');

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    // Border
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(2);
    doc.rect(10, 10, pdfWidth - 20, pdfHeight - 20);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.text('Certificate of Completion', pdfWidth / 2, 50, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('This certifies that', pdfWidth / 2, 80, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(36);
    doc.text(certificate.studentName, pdfWidth / 2, 110, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.text('has successfully completed', pdfWidth / 2, 140, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(certificate.courseName, pdfWidth / 2, 160, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Instructor: ${certificate.instructorName}`, 30, 190);
    doc.text(
      `Completed: ${formatDate(certificate.completionDate)}`,
      pdfWidth - 30,
      190,
      { align: 'right' }
    );

    doc.setFontSize(10);
    doc.text(
      `Certificate ID: ${certificate.certificateId}`,
      pdfWidth / 2,
      pdfHeight - 20,
      { align: 'center' }
    );

    doc.save(`${certificate.certificateId}.pdf`);
  } catch (err) {
    console.error(err);
    showStatusMessage('PDF generation failed.', 'error');
  }
};

  
  const shareCertificate = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Certificate of Completion: ${certificate.courseName}`,
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        showStatusMessage('Certificate details copied to clipboard! You can now share them.', 'success');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareText);
        showStatusMessage('Certificate details copied to clipboard!', 'success');
      } catch (copyError) {
        console.error('Copy failed:', copyError);
        showStatusMessage('Copy failed. Please try again.', 'error');
      }
    }
  };

  const printCertificate = () => {
    const printContent = document.getElementById('certificate-content');
    if (printContent) {
      const buttons = printContent.querySelector('.certificate-actions');
      if (buttons) (buttons as HTMLElement).style.display = 'none';
      
      const originalContent = document.body.innerHTML;
      const printHtml = printContent.innerHTML;
      
      document.body.innerHTML = printHtml;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
      
      if (buttons) (buttons as HTMLElement).style.display = 'flex';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-50 border-b border-gray-200 p-5 flex justify-between items-center z-20">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Certificate of Completion</h2>
            <p className="text-sm text-gray-600 mt-1">ID: {certificate.certificateId}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              <span>Verified</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Certificate Content */}
        <div className="p-8">
          <div 
            id="certificate-content"
            className="relative bg-white shadow-2xl overflow-hidden"
            style={{ aspectRatio: '297/210' }}
          >
            {/* Elegant Border Frame - SIMPLIFIED FOR HTML2CANVAS */}
            <div className="absolute inset-0 border-[16px] border-double border-amber-600"></div>
            <div className="absolute inset-[12px] border-2 border-amber-500/30"></div>
            
            {/* Corner Ornaments */}
            <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-amber-500"></div>
            <div className="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 border-amber-500"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 border-amber-500"></div>
            <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-amber-500"></div>

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
              <AcademicCapIcon className="w-96 h-96 text-gray-400" />
            </div>

            {/* Main Content Container */}
            <div className="relative h-full flex flex-col justify-between p-12">
              
              {/* Header Section */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-amber-500">
                      <AcademicCapIcon className="h-9 w-9 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <SparklesIcon className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>
                </div>
                <h1 className="text-4xl font-serif font-bold text-gray-800 tracking-wide mb-2">
                  Certificate of Completion
                </h1>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                </div>
                <p className="text-sm text-gray-600 uppercase tracking-widest font-medium">This certifies that</p>
              </div>

              {/* Student Name & Course */}
              <div className="text-center space-y-4">
                <div>
                  <h2 className="text-5xl font-serif font-bold text-gray-900 mb-3">
                    {certificate.studentName}
                  </h2>
                  <div className="flex justify-center">
                    <div className="h-1 w-64 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                  </div>
                </div>
                
                <p className="text-base text-gray-600 font-medium">has successfully completed</p>
                
                <div className="py-3">
                  <h3 className="text-3xl font-serif font-bold text-gray-800 mb-3">
                    {certificate.courseName}
                  </h3>
                  {certificate.metadata?.level && (
                    <div className="flex items-center justify-center gap-3">
                      <span className="px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm font-semibold text-blue-700">
                        {certificate.metadata.level.toUpperCase()}
                      </span>
                      {certificate.metadata.category && (
                        <span className="px-4 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-sm font-semibold text-purple-700">
                          {certificate.metadata.category.toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section - Details Grid */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Instructor</p>
                  <p className="text-sm font-bold text-gray-800">{certificate.instructorName}</p>
                </div>

                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Completed</p>
                  <p className="text-sm font-bold text-gray-800">{formatDate(certificate.completionDate)}</p>
                </div>

                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Issued</p>
                  <p className="text-sm font-bold text-gray-800">{formatDate(certificate.issueDate)}</p>
                </div>
              </div>

              {/* Seal and Certificate ID */}
              <div className="flex items-end justify-between pt-4">
                <div className="text-left">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full border-4 border-amber-600 flex items-center justify-center shadow-lg bg-amber-50">
                      <div className="text-center">
                        <SparklesIcon className="h-6 w-6 text-amber-600 mx-auto mb-0.5" />
                        <p className="text-[8px] font-bold text-amber-700 uppercase leading-tight">Official<br/>Seal</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Certificate ID</p>
                  <p className="text-sm font-mono font-bold text-gray-800 tracking-wide">
                    {certificate.certificateId}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">LearnAI Hub</p>
                </div>

                <div className="w-20"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4 certificate-actions">
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="flex items-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-medium"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download PDF
                </>
              )}
            </button>
            
            <button
              onClick={printCertificate}
              className="flex items-center px-8 py-3.5 bg-gray-700 hover:bg-gray-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Print
            </button>
            
            <button
              onClick={shareCertificate}
              className="flex items-center px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <ShareIcon className="h-5 w-5 mr-2" />
              Share
            </button>
          </div>

          {statusMessage && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
              role="status"
            >
              {statusMessage.message}
            </div>
          )}

          {/* Verification Info */}
          <div className="mt-6 p-6 rounded-xl border border-blue-200 bg-blue-50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Digitally Verified Certificate</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This certificate is digitally signed and can be verified online using the Certificate ID above. 
                  All certificates issued by LearnAI Hub are recorded in our secure database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
  
}


