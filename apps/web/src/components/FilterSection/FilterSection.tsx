import { useState } from 'react';

export type FilterField = {
  value: string;
  label: string;
};

export type FilterSectionProps = {
  title?: string;
  searchFields: FilterField[];
  selectedField: string;
  searchValue: string;
  onFieldChange: (field: string) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  additionalFilters?: React.ReactNode;
  defaultOpen?: boolean;
};

export function FilterSection({
  title = 'Bộ lọc tìm kiếm',
  searchFields,
  selectedField,
  searchValue,
  onFieldChange,
  onSearchChange,
  onClear,
  additionalFilters,
  defaultOpen = false,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="nb-card space-y-4">
      {/* Header with Toggle */}
      <div
        className="flex items-center justify-between cursor-pointer border-b-2 border-black pb-2 dark:border-nb-dark-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold text-lg select-none">{title}</h3>
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center border-2 border-black bg-white hover:bg-nb-lemon transition-colors shadow-neo-sm rounded dark:bg-nb-gold dark:text-black dark:border-nb-dark-border dark:hover:bg-nb-gold-hover"
          aria-label={isOpen ? 'Thu gọn bộ lọc' : 'Mở rộng bộ lọc'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Filter Content with Smooth Animation */}
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="space-y-4 pt-2">
          {/* Main Search: 1 Input + Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="nb-input sm:w-48"
              value={selectedField}
              onChange={(e) => onFieldChange(e.target.value)}
            >
              {searchFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
            <input
              className="nb-input flex-1"
              placeholder={`Tìm kiếm theo ${searchFields.find((f) => f.value === selectedField)?.label || ''}...`}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Additional Filters (Optional) */}
          {additionalFilters && (
            <div className="pt-2 border-t-2 border-black dark:border-nb-dark-border">
              {additionalFilters}
            </div>
          )}

          {/* Clear Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="nb-btn nb-btn--secondary"
              onClick={onClear}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
