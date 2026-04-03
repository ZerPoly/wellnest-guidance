'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineEdit, AiOutlineDelete, AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { LuLoaderCircle } from 'react-icons/lu';

interface TableProps<T extends { id: string; status: string; year?: string | number }> {
  tabs: string[];
  columns: string[];
  fetchData: (activeTab: string, cursor?: string) => Promise<{ items: T[]; hasMore: boolean; nextCursor: string | null }>;
  renderRow: (item: T) => React.ReactNode;
  actionTab?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchFilter: (item: T, query: string) => boolean;
  // enhanced filter options
  statusFilterOptions?: { label: string; value: string }[];
  yearFilterOptions?: { label: string; value: string }[];
  headerAction?: React.ReactNode;
  onTabChange?: (tab: string) => void;
}

function TableComponent<T extends { id: string; status: string; year?: string | number }>({
  tabs,
  columns,
  fetchData,
  renderRow,
  actionTab,
  onEdit,
  onDelete,
  searchFilter,
  onTabChange,
  headerAction,
  statusFilterOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ],
  yearFilterOptions = [
    { label: 'All Years', value: 'All' },
    { label: '1st Year',  value: 'Year First Year' },
    { label: '2nd Year',  value: 'Year Second Year' },
    { label: '3rd Year',  value: 'Year Third Year' },
    { label: '4th Year',  value: 'Year Fourth Year' },
  ],
}: TableProps<T>) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filter states
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  // pagination state
  const [hasMore, setHasMore] = useState(false);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);

  const loadData = useCallback(async (tab: string, cursor: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(tab, cursor || undefined);
      setItems(result.items);
      setHasMore(result.hasMore);
      setCurrentCursor(result.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    setCursorHistory([]);
    loadData(activeTab, null);
  }, [activeTab, loadData]);

  // combined filtering logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = searchFilter(item, searchQuery);
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
      
      // normalize strings by trimming and removing extra internal spaces if necessary
      const itemYear = item.year?.toString().trim();
      const matchesYear = selectedYear === 'All' || itemYear === selectedYear;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [items, searchQuery, selectedStatus, selectedYear, searchFilter]);

  const handleNextPage = () => {
    if (!currentCursor || loading) return;
    setCursorHistory(prev => [...prev, currentCursor]); 
    loadData(activeTab, currentCursor);
  };

  const handlePrevPage = () => {
    if (cursorHistory.length === 0 || loading) return;
    const newHistory = [...cursorHistory];
    newHistory.pop();
    const prevCursor = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
    setCursorHistory(newHistory);
    loadData(activeTab, prevCursor);
  };

  const showActions = actionTab && activeTab === actionTab;
  const allColumns = showActions ? [...columns, 'Actions'] : columns;

  return (
    <div className="flex-1 border border-[var(--line)] flex flex-col h-full bg-[var(--card)] rounded-2xl shadow-md p-4">
      {/* header */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex space-x-2 p-1.5 bg-[var(--background-dark)] rounded-full border border-[var(--line)]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCursorHistory([]); onTabChange?.(tab); }}
              className={`px-6 py-2 text-sm font-bold rounded-full transition-all ${
                activeTab === tab ? 'bg-[var(--title)] text-white shadow-md' : 'text-[var(--foreground-muted)] hover:text-[var(--title)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <AiOutlineSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
            <input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-4 bg-[var(--background-dark)] border border-[var(--line)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--cyan)] outline-none text-[var(--foreground)]"
            />
          </div>

          {/* filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2.5 bg-[var(--background-dark)] border border-[var(--line)] rounded-xl flex items-center transition-all ${filterOpen ? 'border-[var(--cyan)] ring-2 ring-[var(--cyan)]/20' : ''}`}
            >
              <AiOutlineFilter size={20} className={filterOpen ? 'text-[var(--cyan)]' : 'text-[var(--foreground-muted)]'} />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-2xl z-[50] overflow-hidden p-2">
                <div className="p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-muted)] mb-3">Status</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {statusFilterOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedStatus(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedStatus === opt.value ? 'bg-[var(--cyan)] border-[var(--cyan)] text-white' : 'bg-[var(--background-dark)] border-[var(--line)] text-[var(--foreground-muted)]'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-muted)] mb-3">Year Level</p>
                  <div className="grid grid-cols-2 gap-2">
                    {yearFilterOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedYear(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedYear === opt.value ? 'bg-[var(--cyan)] border-[var(--cyan)] text-white' : 'bg-[var(--background-dark)] border-[var(--line)] text-[var(--foreground-muted)]'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {headerAction}
        </div>
      </div>

      {/* table content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--foreground-muted)]">
            <LuLoaderCircle size={32} className="animate-spin text-[var(--cyan)]" />
            <span className="text-sm font-bold">Syncing Records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--line)] no-scrollbar">
            <table className="min-w-full divide-y divide-[var(--line)]">
              <thead className="bg-[var(--background-dark)]">
                <tr>
                  {allColumns.map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-[var(--line)]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={allColumns.length} className="px-6 py-16 text-center text-[var(--foreground-muted)] text-sm italic font-medium">
                      No results found for current filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--background-dark)]/50 transition-colors">
                      {renderRow(item)}
                      {showActions && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => onEdit?.(item)} className="p-2 rounded-lg text-[var(--cyan)] bg-[var(--cyan)]/10 hover:bg-[var(--cyan)]/20 transition-colors">
                              <AiOutlineEdit size={18} />
                            </button>
                            <button onClick={() => onDelete?.(item)} className="p-2 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                              <AiOutlineDelete size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between mt-6 px-2">
        <p className="text-xs font-bold text-[var(--foreground-muted)]">
          Page {cursorHistory.length + 1}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevPage}
            disabled={cursorHistory.length === 0 || loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-black uppercase rounded-xl border border-[var(--line)] text-[var(--foreground-muted)] hover:bg-[var(--background-dark)] disabled:opacity-20 transition-all"
          >
            <AiOutlineLeft size={14} /> Prev
          </button>
          <button
            onClick={handleNextPage}
            disabled={!hasMore || loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-black uppercase rounded-xl bg-[var(--cyan)] text-white hover:bg-[var(--cyan-dark)] disabled:opacity-20 shadow-lg shadow-[var(--cyan)]/20 transition-all"
          >
            Next <AiOutlineRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TableComponent;