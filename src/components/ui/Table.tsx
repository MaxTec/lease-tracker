"use client";

import { useState, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaTimes } from "react-icons/fa";
import Input from "./Input";
import EmptyState from "./EmptyState";
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: string[];
  pageSize?: number;
}

type NestedObject = {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | NestedObject
    | NestedObject[];
};

type NestedValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | NestedObject
  | NestedObject[];

export default function Table<T extends { id: number | string }>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  pageSize = 10,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get nested object values
  function getNestedValue(obj: NestedObject, path: string): NestedValue {
    return path.split(".").reduce<NestedValue>((acc, part) => {
      if (acc && typeof acc === "object" && !Array.isArray(acc)) {
        return (acc as NestedObject)[part];
      }
      return undefined;
    }, obj as NestedObject);
  }

  // Helper function to compare values for sorting
  function compareValues(a: NestedValue, b: NestedValue): number {
    // Handle null/undefined values
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
    if (a === b) return 0;

    // Convert to strings for comparison if different types
    const aString = String(a);
    const bString = String(b);

    return aString < bString ? -1 : 1;
  }

  // Sorting function
  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = getNestedValue(
          a as unknown as NestedObject,
          sortConfig.key
        );
        const bValue = getNestedValue(
          b as unknown as NestedObject,
          sortConfig.key
        );
        return sortConfig.direction === "asc"
          ? compareValues(aValue, bValue)
          : compareValues(bValue, aValue);
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  // Search function
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;

    return sortedData.filter((item) => {
      return searchKeys.some((key) => {
        const value = getNestedValue(item as unknown as NestedObject, key);
        return value
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
    });
  }, [sortedData, searchTerm, searchKeys]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize]);

  // Sort handler
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort className="inline ml-1" />;
    }
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="inline ml-1" />
    ) : (
      <FaSortDown className="inline ml-1" />
    );
  };

  return (
    <div className="w-full">
      {searchable && (
        <div className="mb-4 max-w-xs">
          <div className="relative">
            <Input
              type="text"
              label="Search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10"
            />
            <FaSearch className="absolute left-3 top-[56%] text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-[56%] text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {searchTerm && filteredData.length === 0 ? (
          <EmptyState
            title="No results found"
            description="No results found for your search. Please try again."
          />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? "cursor-pointer select-none" : ""
                    }`}
                    onClick={() => column.sortable && requestSort(column.key)}
                  >
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {column.render
                        ? column.render(item)
                        : String(
                            getNestedValue(
                              item as unknown as NestedObject,
                              column.key
                            ) ?? ""
                          )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
