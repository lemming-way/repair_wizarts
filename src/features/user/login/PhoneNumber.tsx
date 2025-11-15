import React from 'react';

interface PhoneNumberProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const correctPhoneNumber = (value: string) => {
  if (!value) {
    return "";
  }
  let correctValue = value.replace(/[^+\d]/g, "");
  if (correctValue[0] !== "+") {
    correctValue = "+" + correctValue;
  }
  if (correctValue.length > 2) {
    if (correctValue[0] === "+" && correctValue[1] === "7") {
      return `+7(${correctValue.slice(2, 5)}) ${correctValue.slice(5, 8)}-${correctValue.slice(8, 10)}-${correctValue.slice(10, 12)}`;
    }
  }
  return correctValue;
};

const PhoneNumber: React.FC<PhoneNumberProps> = ({ value, onChange, placeholder, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(correctPhoneNumber(e.target.value));
  };

  return (
    <input
      className={className}
      type="text"
      placeholder={placeholder}
      onChange={handleChange}
      value={value}
      required
    />
  );
};

export { PhoneNumber, correctPhoneNumber };
