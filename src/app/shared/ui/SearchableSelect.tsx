import React, { useRef } from 'react';
import { default as ReactSelect, components } from 'react-select';

export type SearchableSelectOption = {
  value: string | number;
  label: string;
  count?: number;
};

export type SearchableSelectProps = {
  options: SearchableSelectOption[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
};

const Option = (props: any) => (
  <components.Option {...props}>
    <span style={{ flex: 1 }}>{props.label}</span>
    {props.data.count !== undefined && (
      <span style={{ color: 'rgba(255,255,255,0.65)', marginLeft: '8px', fontSize: '13px' }}>
        {props.data.count}
      </span>
    )}
  </components.Option>
);

const Input = (props: any) => (
  <components.Input {...props}>
    {props.children}
  </components.Input>
);

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    minHeight: '40px',
    padding: '0 8px',
    '&:hover': {
      borderColor: 'transparent',
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: 0,
  }),
  singleValue: (base: any) => ({
    ...base,
    color: '#fff',
    fontSize: '15px',
    fontWeight: 500,
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'rgba(255,255,255,0.65)',
    fontSize: '15px',
  }),
  input: (base: any) => ({
    ...base,
    color: '#fff',
    padding: 0,
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: '#d9573b',
    border: 'none',
    borderRadius: '12px',
    marginTop: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    zIndex: 9999,
  }),
  menuList: (base: any) => ({
    ...base,
    padding: '8px 0',
    maxHeight: '300px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: '#fff',
    padding: '12px 16px',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&:active': {
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
  }),
  noOptionsMessage: (base: any) => ({
    ...base,
    color: 'rgba(255,255,255,0.65)',
    padding: '16px',
    fontSize: '15px',
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: '#fff',
    padding: '0 4px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
};

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Выбрать',
  searchPlaceholder = 'Поиск…',
  noOptionsMessage = 'Ничего не найдено',
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const selectRef = useRef<any>(null);

  const handleChange = (selected: SearchableSelectOption | null) => {
    onChange(selected ? selected.value : null);
    if (selectRef.current) {
      selectRef.current.blur();
    }
  };

  return (
    <ReactSelect
      ref={selectRef}
      options={options}
      value={value ? options.find((opt) => opt.value === value) || null : null}
      onChange={handleChange}
      placeholder={placeholder}
      noOptionsMessage={() => noOptionsMessage}
      filterOption={(option, inputValue) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      }
      styles={customStyles}
      components={{ Option, Input }}
      className={className}
      isDisabled={disabled}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
    />
  );
};