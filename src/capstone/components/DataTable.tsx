/**
 * ============================================
 * E7 — Compound DataTable Component
 * ============================================
 * 
 * WHAT: <DataTable> + <DataTable.Column> pattern
 * 
 * WHY: Configurable table cho nhiều dạng dữ liệu khác nhau
 * 
 * HOW:
 * 1. DataTable cung cấp context rows
 * 2. Column đăng ký field + header
 * 3. DataTable map rows → map columns
 */

import React, { 
  createContext, 
  useContext, 
  useMemo, 
  useCallback,
  memo,
  ReactNode 
} from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ColumnConfig<T> {
  key: string;
  header: string;
  render?: (value: any, row: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
}

interface DataTableContextType<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  registerColumn: (column: ColumnConfig<T>) => void;
}

// ============================================
// CONTEXT
// ============================================

const DataTableContext = createContext<DataTableContextType<any> | null>(null);

const useDataTableContext = () => {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error('DataTable compound components must be used within <DataTable>');
  }
  return context;
};

// ============================================
// DATATABLE ROOT COMPONENT
// ============================================

interface DataTableProps<T> {
  data: T[];
  children: ReactNode;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
}

function DataTableRoot<T extends { id: string | number }>({
  data,
  children,
  className,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  const [columns, setColumns] = React.useState<ColumnConfig<T>[]>([]);

  const registerColumn = useCallback((column: ColumnConfig<T>) => {
    setColumns((prev) => {
      // Avoid duplicates
      const exists = prev.some((c) => c.key === column.key);
      if (exists) return prev;
      return [...prev, column];
    });
  }, []);

  const contextValue = useMemo(
    () => ({ data, columns, registerColumn }),
    [data, columns, registerColumn]
  );

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className={`data-table-wrapper ${className || ''}`}>
        {/* Render children (Column components) to register columns */}
        <div style={{ display: 'none' }}>{children}</div>
        
        {/* Render actual table */}
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="loading-spinner"></div>
                  <p style={{ marginTop: '10px' }}>Loading...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <DataTableRow
                  key={row.id}
                  row={row}
                  rowIndex={rowIndex}
                  columns={columns}
                  onClick={onRowClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </DataTableContext.Provider>
  );
}

// ============================================
// E5: MEMOIZED ROW COMPONENT
// ============================================

interface DataTableRowProps<T> {
  row: T;
  rowIndex: number;
  columns: ColumnConfig<T>[];
  onClick?: (row: T, index: number) => void;
}

const DataTableRow = memo(function DataTableRow<T extends Record<string, any>>({
  row,
  rowIndex,
  columns,
  onClick,
}: DataTableRowProps<T>) {
  const handleClick = useCallback(() => {
    onClick?.(row, rowIndex);
  }, [onClick, row, rowIndex]);

  return (
    <tr 
      onClick={onClick ? handleClick : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {columns.map((col) => (
        <td key={col.key}>
          {col.render
            ? col.render(row[col.key], row, rowIndex)
            : String(row[col.key] ?? '')}
        </td>
      ))}
    </tr>
  );
}) as <T extends Record<string, any>>(props: DataTableRowProps<T>) => React.ReactElement;

// ============================================
// COLUMN COMPONENT
// ============================================

interface ColumnProps<T> {
  field: string;
  header: string;
  render?: (value: any, row: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
}

function Column<T>({ field, header, render, sortable, width }: ColumnProps<T>) {
  const { registerColumn } = useDataTableContext();

  React.useEffect(() => {
    registerColumn({
      key: field,
      header,
      render,
      sortable,
      width,
    });
  }, [field, header, render, sortable, width, registerColumn]);

  return null;
}

// ============================================
// HEADER COMPONENT
// ============================================

interface HeaderProps {
  children: ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  return (
    <div className={`data-table-header ${className || ''}`} style={{ marginBottom: '15px' }}>
      {children}
    </div>
  );
};

// ============================================
// FOOTER COMPONENT
// ============================================

interface FooterProps {
  children: ReactNode;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ children, className }) => {
  return (
    <div className={`data-table-footer ${className || ''}`} style={{ marginTop: '15px' }}>
      {children}
    </div>
  );
};

// ============================================
// PAGINATION COMPONENT
// ============================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const pages = useMemo(() => {
    const result: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      result.push(1);
      if (currentPage > 3) result.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      
      if (currentPage < totalPages - 2) result.push('...');
      result.push(totalPages);
    }

    return result;
  }, [currentPage, totalPages]);

  return (
    <div className={`pagination ${className || ''}`} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ padding: '5px 10px' }}
      >
        ←
      </button>
      
      {pages.map((page, index) => (
        typeof page === 'number' ? (
          <button
            key={index}
            className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onPageChange(page)}
            style={{ padding: '5px 10px', minWidth: '35px' }}
          >
            {page}
          </button>
        ) : (
          <span key={index} style={{ padding: '5px' }}>...</span>
        )
      ))}
      
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ padding: '5px 10px' }}
      >
        →
      </button>
    </div>
  );
};

// ============================================
// COMPOUND COMPONENT ASSEMBLY
// ============================================

export const DataTable = Object.assign(DataTableRoot, {
  Column,
  Header,
  Footer,
  Pagination,
});

export default DataTable;
