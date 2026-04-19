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

  /*
    // Дополнительная логика форматирования из RegistrationContractorPage (для будущей переработки)
    let formattedInput = value.replace(/\D/g, ''); // Удаляем все нецифровые символы

    if (formattedInput.startsWith('79') || formattedInput.startsWith('89')) {
      if (formattedInput.startsWith('89')) {
        formattedInput = '79' + formattedInput.substring(2);
      }
    } else if (formattedInput.startsWith('9')) {
      formattedInput = '79' + formattedInput.substring(1);
    } else {
      // Позволяем пользователю очищать или свободно набирать, если изначально не соответствует общим шаблонам
    }

    let new_text = '+';
    if (formattedInput.length > 0) new_text += formattedInput[0]; // Код страны (например, 7)
    if (formattedInput.length > 1)
      new_text += '(' + formattedInput.substring(1, 4);
    if (formattedInput.length >= 5)
      new_text += ')-' + formattedInput.substring(4, 7);
    if (formattedInput.length >= 8)
      new_text += '-' + formattedInput.substring(7, 9);
    if (formattedInput.length >= 10)
      new_text += '-' + formattedInput.substring(9, 11);

    // Логика установки состояния (setPhone, setError) не может быть напрямую перенесена в эту чистую функцию,
    // так как она не имеет доступа к хукам useState.
    // Если эта логика будет активирована, необходимо решить, как управлять состоянием в компоненте,
    // использующем эту функцию (например, возвращать отформатированное значение и обрабатывать его в onChange компонента).
    // return new_text;
  */

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
