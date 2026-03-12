/**
 * Модуль api для работы с загружаемыми файлами
 *
 * @summary
 * **Типы:**
 *
 * **Получение данных:**
 * getAuthUser, getUsers
 *
 * **Изменение данных:**
 * updateUser, registerAsClient, registerAsContractor, updatePassword
 */

import { post, fetchAsBlob } from './request';

export type FileUploadData = {
  dl_id?: number;
  base64?: string;
  name?: string;
  u_id?: number;
  private?: -1 | 0 | 1;
}

export type DropboxFileInfo = {
  dl_id: string;
  json: {
    name: string;
    name_upload: string;
    type: string;
    size: number;
    response?: Record<string, unknown>;
    response_del?: Record<string, unknown>;
  };
  private?: "-1" | "0" | "1";
  deleted?: "0" | "1";
  users?: string[];
  u_id?: string;
}

/**
 * Загрузка или обновление файла
 * @param fileData Данные файла для загрузки
 * @returns Промис, разрешающийся с ID файла или null
 */
async function uploadOrUpdate(fileData: FileUploadData) {
  const fileId = ( await post<{ dl_id: string }>('dropbox/file/', { file: JSON.stringify(fileData) }) )?.dl_id;
  const numericId = Number(fileId || 0);
  return numericId && Number.isFinite(numericId) ? numericId : null;
}

/**
 * Загрузка нового файла
 * @param name Имя файла
 * @param base64 Содержимое файла
 * @param userId ID пользователя владельца файла
 * @param privacy Уровень доступа к файлу
 * @returns Промис, разрешающийся с ID загруженного файла или null
 */
export function uploadFile(name: string, base64: string, privacy: -1 | 0 | 1 = 1, userId?: number)
  : Promise<number | null> {
  const fileData: FileUploadData = {
    base64,
    name,
    private: privacy
  };
  if (userId) fileData.u_id = userId;

  return uploadOrUpdate(fileData);
}

/**
 * Обновление существующего файла
 * @param fileId ID файла
 * @param base64 Содержимое файла
 * @param userId ID пользователя владельца файла
 * @param privacy Уровень доступа к файлу
 * @returns Промис, разрешающийся с ID загруженного файла
 */
export function updateFile(fileId: number, base64?: string, privacy?: -1 | 0 | 1, userId?: number)
  : Promise<number | null> {
  const fileData: FileUploadData = { dl_id: fileId };
  if (base64) fileData.base64 = base64;
  if (privacy === -1 || privacy === 0 || privacy === 1) fileData.private = privacy;
  if (userId) fileData.u_id = userId;

  return uploadOrUpdate(fileData);
}

/**
 * Получение файла
 * @param fileId Идентификатор файла
 * @returns Промис, возвращающий загруженный файл как Blob
 */
export async function fetchFile(fileId: number) {
  return fetchAsBlob(`dropbox/file/${fileId}`);
}

/**
 * Удаление файла
 * @param fileId Идентификатор файла
 * @returns Результат удаления (файл)
 */
export function deleteFile(fileId: number) {
  return post<void>(`dropbox/file/${fileId}/del`);
}

/**
 * Получение информации о файлах
 * @param fileIds Массив идентификаторов файлов
 * @returns Информация о файлах
 */
export async function getFilesInfo(fileIds: number[]): Promise<DropboxFileInfo[]> {
  const ret = await post<{ 'dropbox files': Record<string, DropboxFileInfo> }>(`dropbox/file/${fileIds}/select`);
  if (ret?.['dropbox files'] && 'object' === typeof ret['dropbox files']) return Object.values(ret['dropbox files']);
  else return [];
}
