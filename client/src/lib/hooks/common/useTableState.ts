import { useState, useMemo } from 'react';

/**
 * Common table state management hook
 * Provides standardized state for search, filters, pagination, and dialogs
 */
export interface TableStateConfig {
  initialSearchTerm?: string;
  initialPageSize?: number;
  initialFilters?: Record<string, string>;
}

export const useTableState = (config: TableStateConfig = {}) => {
  const {
    initialSearchTerm = '',
    initialPageSize = 10,
    initialFilters = {},
  } = config;

  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  // Selection state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || Object.values(filters).some(filter => filter !== 'all');
  }, [searchTerm, filters]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  const resetAll = () => {
    resetFilters();
    resetPagination();
  };

  // Dialog handlers
  const openAddDialog = () => setShowAddDialog(true);
  const closeAddDialog = () => {
    setShowAddDialog(false);
    setSelectedItem(null);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };
  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingItem(null);
  };

  const openDeleteDialog = (item: any) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const openViewDialog = (item: any) => {
    setSelectedItem(item);
    setShowViewDialog(true);
  };
  const closeViewDialog = () => {
    setShowViewDialog(false);
    setSelectedItem(null);
  };

  return {
    // Search and filters
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    hasActiveFilters,
    resetFilters,
    
    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    resetPagination,
    
    // Dialogs
    showAddDialog,
    showEditDialog,
    showDeleteDialog,
    showViewDialog,
    openAddDialog,
    closeAddDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openViewDialog,
    closeViewDialog,
    
    // Selection
    selectedItem,
    editingItem,
    itemToDelete,
    setSelectedItem,
    setEditingItem,
    setItemToDelete,
    
    // Utilities
    resetAll,
  };
};
