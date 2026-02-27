'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DataIngestion() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    const validExtensions = ['.csv', '.xlsx', '.json'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Invalid file format. Please upload CSV, XLSX, or JSON files only.');
      return;
    }

    setUploadedFile(file.name);
    setIsValidated(true);
    
    // Simulate file processing
    setTimeout(() => {
      setIsProcessing(true);
      simulateProgress();
    }, 1000);
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          router.push('/app');
        }, 1500);
      }
    }, 300);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setIsValidated(false);
    setIsProcessing(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Data Ingestion
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload your market data to begin AI analysis
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-gray-300 dark:border-gray-700 shadow-xl">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-3 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging
                ? 'border-[#00A8A8] bg-[#00A8A8]/5'
                : 'border-gray-300 dark:border-gray-700 hover:border-[#1F3C88] hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx,.json"
              onChange={handleFileSelect}
            />
            
            {!uploadedFile ? (
              <>
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Drag and drop your file here
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  or click to browse from your computer
                </p>
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] text-white rounded-lg font-semibold cursor-pointer hover:shadow-lg transition-all"
                >
                  Select File
                </label>
              </>
            ) : (
              <div className="space-y-6">
                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-[#1F3C88]" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{uploadedFile}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ready for processing</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Validation Status */}
                {isValidated && !isProcessing && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">File validated successfully</span>
                  </div>
                )}

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Processing data...
                      </span>
                      <span className="text-[#00A8A8] font-semibold">{progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1F3C88] to-[#00A8A8] rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {progress === 100 && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Processing complete! Redirecting to dashboard...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Supported File Formats
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                { format: 'CSV', description: 'Comma-separated values' },
                { format: 'XLSX', description: 'Excel spreadsheet' },
                { format: 'JSON', description: 'JavaScript Object Notation' },
              ].map((format, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
                >
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{format.format}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{format.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Requirements */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Data Requirements
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ensure your data includes columns for date, price, volume, and product/commodity identifier. 
                  The AI model works best with at least 6 months of historical data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Data Link */}
        <div className="text-center mt-6">
          <button className="text-[#1F3C88] dark:text-[#00A8A8] hover:underline font-medium">
            Download Sample Data Template
          </button>
        </div>
      </div>
    </div>
  );
}
