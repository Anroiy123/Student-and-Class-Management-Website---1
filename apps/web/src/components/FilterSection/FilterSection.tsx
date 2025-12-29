import { useState, useId } from 'react';

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
  customActions?: React.ReactNode;
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
  defaultOpen = true,
  customActions,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const filterContentId = useId();
  const searchInputId = useId();
  const selectId = useId();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div className="edu-card space-y-3 sm:space-y-4" role="search" aria-label={title}>
      {/* Header with Toggle */}
      <div
        className="flex items-center justify-between cursor-pointer border-b border-edu-border dark:border-edu-dark-border pb-3"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={filterContentId}
      >
        <h3 className="font-bold text-base sm:text-lg select-none">{title}</h3>
        <button
          type="button"
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-edu-border bg-edu-surface hover:bg-edu-muted transition-all rounded-lg dark:bg-edu-dark-surface dark:border-edu-dark-border dark:hover:bg-edu-dark-muted"
          aria-label={isOpen ? 'Thu gọn bộ lọc' : 'Mở rộng bộ lọc'}
          aria-expanded={isOpen}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Filter Content with Smooth Animation */}
      <div
        id={filterContentId}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="space-y-3 sm:space-y-4 pt-2">
          {/* Main Search: Stack on mobile, row on larger screens */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <div className="w-full sm:w-40 md:w-48">
              <label htmlFor={selectId} className="sr-only">
                Chọn trường tìm kiếm
              </label>
              <select
                id={selectId}
                className="edu-input text-sm"
                value={selectedField}
                onChange={(e) => onFieldChange(e.target.value)}
                aria-label="Chọn trường tìm kiếm"
              >
                {searchFields.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor={searchInputId} className="sr-only">
                {`Tìm kiếm theo ${searchFields.find((f) => f.value === selectedField)?.label || ''}`}
              </label>
              <input
                id={searchInputId}
                type="search"
                className="edu-input text-sm"
                placeholder={`Tìm kiếm theo ${searchFields.find((f) => f.value === selectedField)?.label || ''}...`}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-describedby={`${searchInputId}-hint`}
              />
              <span id={`${searchInputId}-hint`} className="sr-only">
                Nhập từ khóa để tìm kiếm
              </span>
            </div>
          </div>

          {/* Additional Filters (Optional) */}
          {additionalFilters && (
            <fieldset className="pt-3 border-t border-edu-border dark:border-edu-dark-border">
              <legend className="sr-only">Bộ lọc bổ sung</legend>
              {additionalFilters}
            </fieldset>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            {customActions || (
              <button
                type="button"
                className="edu-btn edu-btn--ghost text-sm w-full sm:w-auto"
                onClick={onClear}
                aria-label="Xóa tất cả bộ lọc và đặt lại tìm kiếm"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
