/**
 * Преобразует объект File в строку base64 (Data URL).
 * @param file Объект File для преобразования.
 * @returns Промис, который разрешается со строкой base64 или отклоняется с ошибкой.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export const IMAGE_TYPES = Object.freeze([ 'image/jpeg', 'image/png', 'image/gif', 'image/webp' ]);

export function isImage(mimeType: string) {
  return IMAGE_TYPES.includes(mimeType);
}

/**
 * Генерирует случайную строку (буквы, цифры).
 * @param length Длина строки.
 * @returns Случайная строка.
 */
export function randomString(length: number): string {
  const targetLength = length | 0;  // Отбрасываем дробную часть
  if (targetLength <= 0) return '';
  let result = '';
  while (result.length < targetLength) {
    result += Math.random().toString(36).substring(2, targetLength - result.length + 2);
  }
  return result;
}
