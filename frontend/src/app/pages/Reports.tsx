import { FileText, Download, Calendar, Filter, Eye } from 'lucide-react';

export function Reports() {
  const reports = [
    { title: 'Q1 2026 Market Analysis', date: '2026-02-20', size: '2.4 MB', type: 'PDF' },
    { title: 'Commodity Price Forecast', date: '2026-02-15', size: '1.8 MB', type: 'PDF' },
    { title: 'Sentiment Analysis Report', date: '2026-02-10', size: '3.1 MB', type: 'PDF' },
    { title: 'Risk Assessment Summary', date: '2026-02-05', size: '1.5 MB', type: 'PDF' },
    { title: 'Weekly Market Digest', date: '2026-02-01', size: '890 KB', type: 'PDF' },
  ];

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-8 h-8 text-gray-900 dark:text-gray-100" />
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Reports</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Downloadable market intelligence reports and insights
        </p>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Date Range</span>
          </button>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Export All</span>
        </button>
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <div className="text-xs text-gray-500 dark:text-gray-500">TOTAL</div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">47</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <div className="text-xs text-gray-500 dark:text-gray-500">THIS MONTH</div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">12</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">New Reports</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Download className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <div className="text-xs text-gray-500 dark:text-gray-500">DOWNLOADS</div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">234</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">This Quarter</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden mb-8">
        <div className="p-6 border-b-2 border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Available Reports
          </h3>
        </div>
        <div className="divide-y-2 divide-gray-300 dark:divide-gray-700">
          {reports.map((report, i) => (
            <div
              key={i}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {report.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{report.date}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">
                      {report.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                    <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                    <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export Options */}
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Data Export Options
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export your market data in various formats
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['CSV Export', 'Excel Export', 'JSON Export', 'API Access'].map((option, i) => (
            <button
              key={i}
              className="p-6 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-3"></div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{option}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
