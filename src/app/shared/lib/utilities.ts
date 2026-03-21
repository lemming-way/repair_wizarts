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
