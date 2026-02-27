import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, FileSpreadsheet, FileJson, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { markUserAsReturning } from '../utils/userState';

export function OnboardingDataIngestion() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const navigate = useNavigate();

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
    // Reset states
    setValidationError('');
    setIsValidated(false);
    
    // Validate file extension
    const validExtensions = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setValidationError('Invalid file format. Please upload CSV, XLSX, or JSON files only.');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setValidationError('File size exceeds 50MB limit. Please upload a smaller file.');
      return;
    }

    setUploadedFile(file);
    
    // Simulate file validation
    setTimeout(() => {
      setIsValidated(true);
    }, 800);
  };

  const startProcessing = () => {
    setIsProcessing(true);
    simulateProgress();
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Mark user as returning and redirect to dashboard
        setTimeout(() => {
          markUserAsReturning();
          navigate('/app');
        }, 1500);
      }
      
      setProgress(Math.min(currentProgress, 100));
    }, 400);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setIsValidated(false);
    setIsProcessing(false);
    setProgress(0);
    setValidationError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Onboarding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-blue-700 dark:text-blue-300" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Welcome • First-time Setup
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Welcome to AI Market Pulse
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your historical market data to unlock AI-powered insights, forecasting, and analytics
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 border-2 border-gray-200 dark:border-gray-800 shadow-2xl">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-3 border-dashed rounded-2xl p-16 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 scale-[1.02]'
                : uploadedFile
                ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-850'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
            
            {!uploadedFile ? (
              <>
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform shadow-lg">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Drop your files here
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    or click to browse from your computer
                  </p>
                  <div className="mt-6 inline-flex items-center gap-6 text-sm text-gray-500 dark:text-gray-500">
                    <span className="font-semibold">Supported formats:</span>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-md font-medium">CSV</span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md font-medium">XLSX</span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-md font-medium">JSON</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>Max size: <strong className="text-gray-700 dark:text-gray-300">50MB</strong></span>
                  </div>
                </div>
                
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg cursor-pointer hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  <Upload className="w-6 h-6" />
                  Select File
                </label>

                {validationError && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{validationError}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                {/* File Info */}
                <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      {uploadedFile.name.endsWith('.json') ? (
                        <FileJson className="w-8 h-8 text-white" />
                      ) : (
                        <FileSpreadsheet className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-xl">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={removeFile}
                      className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Validation Status */}
                {isValidated && !isProcessing && (
                  <div className="flex items-center justify-center gap-3 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-7 h-7" />
                    <span className="font-bold text-xl">File validated successfully</span>
                  </div>
                )}

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 font-semibold text-xl">
                        {progress < 30 && '📤 Uploading data...'}
                        {progress >= 30 && progress < 60 && '🔍 Validating structure...'}
                        {progress >= 60 && progress < 90 && '🤖 Processing with AI...'}
                        {progress >= 90 && progress < 100 && '✨ Generating insights...'}
                        {progress === 100 && '✅ Complete!'}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full transition-all duration-500 shadow-lg animate-pulse"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {progress === 100 && (
                      <div className="flex items-center justify-center gap-3 text-green-600 dark:text-green-400 animate-bounce">
                        <CheckCircle className="w-7 h-7" />
                        <span className="font-bold text-xl">
                          Processing complete! Redirecting to dashboard...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Process Button */}
                {isValidated && !isProcessing && (
                  <button
                    onClick={startProcessing}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xl hover:shadow-2xl transition-all transform hover:scale-105"
                  >
                    Process Data & Continue to Dashboard →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Data Requirements */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex gap-4">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">
                  Data Requirements for Optimal AI Analysis
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1.5 list-disc list-inside">
                  <li>Include columns: <strong>date</strong>, <strong>price</strong>, <strong>volume</strong>, and <strong>product/commodity ID</strong></li>
                  <li>Minimum <strong>6 months of historical data</strong> recommended for accurate forecasting</li>
                  <li>Ensure dates are in consistent format (YYYY-MM-DD preferred)</li>
                  <li>Remove duplicate entries and handle missing values</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Data Link */}
        <div className="text-center mt-8">
          <button className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-2 mx-auto text-lg">
            <FileText className="w-5 h-5" />
            Download Sample Data Template
          </button>
        </div>
      </div>
    </div>
  );
}
