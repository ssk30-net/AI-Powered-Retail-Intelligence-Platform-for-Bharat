'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  FileSpreadsheet,
  FileJson,
  Info,
  Sparkles,
  SkipForward,
  Lightbulb,
  Gamepad2,
} from 'lucide-react';
import { dataIngestAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const SUPPORTED_FORMATS = [
  { ext: 'CSV', desc: 'Comma-separated values', icon: FileText },
  { ext: 'XLSX', desc: 'Excel workbook', icon: FileSpreadsheet },
  { ext: 'JSON', desc: 'JSON array or { "data": [...] }', icon: FileJson },
];

const BUSINESS_TIPS = [
  'Track commodity prices weekly to spot seasonal trends.',
  'Compare your purchase prices with modal/min prices for better margins.',
  'Keep at least 6 months of history for more accurate AI forecasts.',
  'Include region or market column to analyze location-wise performance.',
  'Clean duplicate dates per commodity before upload for best results.',
  'Use consistent date format (YYYY-MM-DD) across your files.',
  'Upload smaller batches regularly instead of one large file yearly.',
  'Tag uploaded data with source (e.g. "mandi", "wholesale") if you have multiple.',
];

function EngagementPanel({ isProcessing }: { isProcessing: boolean }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [taps, setTaps] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const tapsRef = useRef(0);

  const startGame = useCallback(() => {
    setTaps(0);
    tapsRef.current = 0;
    setSecondsLeft(5);
  }, []);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null || s <= 1) {
          setBestScore((b) => Math.max(b, tapsRef.current));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const handleTap = useCallback(() => {
    if (secondsLeft !== null && secondsLeft > 0) {
      tapsRef.current += 1;
      setTaps(tapsRef.current);
    }
  }, [secondsLeft]);

  if (!isProcessing) return null;

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-gray-600" />
        <span className="font-semibold text-gray-900">While we process your data</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick business tip</p>
          <p className="text-sm text-gray-700">
            {BUSINESS_TIPS[tipIndex % BUSINESS_TIPS.length]}
          </p>
          <button
            type="button"
            onClick={() => setTipIndex((i) => i + 1)}
            className="mt-2 text-sm text-blue-600 hover:underline font-medium"
          >
            Next tip →
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Speed tap</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">Tap as many times as you can in 5 seconds!</p>
          {secondsLeft === null || secondsLeft === 0 ? (
            <button
              type="button"
              onClick={startGame}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTap}
              className="w-full py-6 rounded-xl bg-green-500 hover:bg-green-600 active:scale-[0.98] transition text-white font-bold text-2xl select-none touch-none"
            >
              {secondsLeft}s — Taps: {taps}
            </button>
          )}
          {bestScore > 0 && (
            <p className="mt-2 text-sm text-gray-600">Best: <strong>{bestScore}</strong> taps</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IngestPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const router = useRouter();

  const acceptedExtensions = ['.csv', '.xlsx', '.xls', '.json'];
  const maxSizeMB = 50;

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
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleFileSelect = (file: File) => {
    setValidationError('');
    setUploadedFile(null);
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!acceptedExtensions.includes(ext)) {
      setValidationError(`Unsupported format. Use: ${acceptedExtensions.join(', ')}`);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setValidationError(`File too large. Max size: ${maxSizeMB}MB`);
      return;
    }
    setUploadedFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setValidationError('');
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    try {
      const result = await dataIngestAPI.uploadFile(uploadedFile);
      const accepted = result?.rows_accepted ?? 0;
      const rejected = result?.rows_rejected ?? 0;
      if (accepted > 0) {
        toast.success(`Ingested ${accepted} rows. ${rejected > 0 ? `${rejected} rows skipped.` : ''}`);
        router.push('/dashboard');
        return;
      }
      toast.error(rejected > 0 ? 'No valid rows after validation.' : 'Upload failed.');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null;
      toast.error(msg || 'Upload failed. Check file format and required columns.');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchUser = useAuthStore((s) => s.fetchUser);

  const handleSkip = async () => {
    try {
      await dataIngestAPI.skipOnboarding();
      await fetchUser(); // refresh user so is_first_login is false and layout won't redirect back to ingest
      toast.success('You can upload data later from the dashboard.');
      router.push('/dashboard');
    } catch {
      toast.error('Could not skip. Try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-full">
      <div className="text-center mb-8 px-4 py-6 rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-blue-700" />
          <span className="text-sm font-medium text-blue-700">
            Data upload • First-time setup
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload your market data
        </h1>
        <p className="text-base text-gray-700 max-w-xl mx-auto font-medium">
          Add commodity prices to see insights and forecasts on your dashboard. You can skip and use sample data for now.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all bg-white ${
            isDragging
              ? 'border-blue-500 bg-gray-50'
              : uploadedFile
              ? 'border-green-500 bg-white'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={acceptedExtensions.join(',')}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            disabled={isUploading}
          />

          {!uploadedFile ? (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Drop your file here or click to browse
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Supported formats and max size are listed below.
                </p>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold cursor-pointer hover:bg-blue-700 disabled:opacity-50"
                >
                  <Upload className="w-5 h-5" />
                  Select file
                </label>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip for now
                  </button>
                </div>
              </div>
              {validationError && (
                <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {validationError}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                    {uploadedFile.name.toLowerCase().endsWith('.json') ? (
                      <FileJson className="w-6 h-6 text-blue-600" />
                    ) : (
                      <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(uploadedFile.size)}</p>
                  </div>
                </div>
                {!isUploading && (
                  <button type="button" onClick={removeFile} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Uploading & preparing…
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  <SkipForward className="w-5 h-5" />
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>

        <EngagementPanel isProcessing={isUploading} />

        <div className="mt-8 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex gap-3">
            <Info className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-900 mb-2">Supported formats & data</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                {SUPPORTED_FORMATS.map(({ ext, desc }) => (
                  <li key={ext}><strong className="text-gray-900">{ext}</strong> — {desc}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                <strong className="text-gray-900">What to upload:</strong> Commodity/product names, prices (e.g. modal price, min/max), and dates. Optional: region/market, volume. Required columns: <strong>commodity</strong> (or product/item), <strong>price</strong>, <strong>date</strong> (or recorded_at, arrival_date). Dates in YYYY-MM-DD work best. Max file size: <strong>{maxSizeMB}MB</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
