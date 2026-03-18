'use client';

import React, { useState, useEffect } from 'react';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

interface TableProps<T extends { id: string }> {
  title?: string;
  tabs: string[];
  columns: string[];
  fetchData: (activeTab: string) => T[];
  renderRow: (item: T) => React.ReactNode;
  actionTab?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchFilter: (item: T, query: string) => boolean;
  filterOptions?: { label: string; value: string }[];  
  onFilterChange?: (value: string) => void;    
  headerAction?: React.ReactNode;    
  onTabChange?: (tab: string) => void;     
}

function TableComponent<T extends { id: string }>({
  title = 'Table',
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
  filterOptions,      
  onFilterChange
}: TableProps<T>) {
  const [activeTab,    setActiveTab]    = useState(tabs[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [items,       setItems]       = useState<T[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

const handleTabChange = (tab: string) => {
  setActiveTab(tab);
  onTabChange?.(tab); 
};

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const data = fetchData(activeTab);
      setItems(data);
    } catch {
      setError('failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const displayed = items.filter((item) => searchFilter(item, searchQuery));
  const showActions = actionTab && activeTab === actionTab;
  const allColumns  = showActions ? [...columns, 'Actions'] : columns;

  return (
    <div className="flex-1 border border-(--outline) h-full bg-(--bg) rounded-2xl shadow-md p-4">
     {/* header */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-(--text-muted)">{title}</h2>
          <div className="flex space-x-2 p-2 bg-(--bg-dark) rounded-full">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeTab === tab
                    ? 'bg-(--title) text-(--text1) shadow-md'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >{tab}</button>
            ))}
          </div>
        </div>
        
        {/* filter and tabs */}
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          <div className="relative flex-1">
            <input placeholder="Search" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-700"
            />
            <AiOutlineSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <div className="relative">
            <button onClick={() => setFilterOpen((p) => !p)}
              className={`p-2.5 bg-gray-100 border border-gray-300 rounded-lg flex items-center ${filterOpen ? 'ring-2 ring-purple-700' : 'hover:bg-gray-200'}`}>
              <AiOutlineFilter size={20} className="text-gray-600" />
            </button>
          
        {filterOpen && filterOptions && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
            <p className="p-3 font-bold text-xs text-gray-700 uppercase border-b">Filter</p>
            {filterOptions.map((option) => (
              <button key={option.value}
                onClick={() => {
                  setActiveFilter(option.value);
                  onFilterChange?.(option.value);
                  setFilterOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  activeFilter === option.value ? 'font-semibold text-purple-700' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
                
        {headerAction}
        </div> 
      </div>

      {/* table */}
      {loading ? <p className="text-center py-8 text-gray-500">loading...</p>
       : error  ? <p className="text-center py-8 text-red-500">{error}</p>
       : (
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {allColumns.map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
           </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayed.length === 0
              ? <tr><td colSpan={allColumns.length} className="px-6 py-4 text-center text-gray-500 text-sm">no data found.</td></tr>
              : displayed.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {renderRow(item)}

                {/* actions column for tab with actions */}
                {showActions && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                              <AiOutlineEdit size={16} />
                            </button>
                          )}
                       {onDelete && (
                          <button onClick={() => onDelete(item)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                            <AiOutlineDelete size={16} />
                          </button>
                        )}
                      </div>
                  </td>
                 )}
                </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default TableComponent;