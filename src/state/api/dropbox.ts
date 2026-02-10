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

import { API_BASE_URL, post } from './request';

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
 * @returns Идентификатор файла
 */
async function uploadOrUpdate(fileData: FileUploadData) {
  const fileId = ( await post<{ dl_id: string }>('dropbox/file/', { file: JSON.stringify(fileData) }) )?.dl_id;
  return fileId || null;
}

/**
 * Загрузка нового файла
 * @param name Имя файла
 * @param base64 Содержимое файла
 * @param userId ID пользователя владельца файла
 * @param privacy Уровень доступа к файлу
 * @returns URL загруженного файла
 */
export async function uploadFile(name: string, base64: string, privacy: -1 | 0 | 1 = 1, userId?: number)
  : Promise<{ id?: string, url?: string }> {
  const fileData: FileUploadData = {
    base64,
    name,
    private: privacy
  };
  if (userId) fileData.u_id = userId;

  const fileId = await uploadOrUpdate(fileData);
  if (fileId) return {
    id: fileId,
    url: `${API_BASE_URL}dropbox/file/${fileId}`
  };
  else return {};
}

/**
 * Обновление существующего файла
 * @param fileId ID файла
 * @param base64 Содержимое файла
 * @param userId ID пользователя владельца файла
 * @param privacy Уровень доступа к файлу
 * @returns URL загруженного файла
 */
export async function updateFile(fileId: number, base64?: string, privacy?: -1 | 0 | 1, userId?: number)
  : Promise<{ id?: string, url?: string }> {
  const fileData: FileUploadData = { dl_id: fileId };
  if (base64) fileData.base64 = base64;
  if (privacy === -1 || privacy === 0 || privacy === 1) fileData.private = privacy;
  if (userId) fileData.u_id = userId;

  const retFileId = await uploadOrUpdate(fileData);
  if (retFileId) return {
    id: retFileId,
    url: `${API_BASE_URL}dropbox/file/${retFileId}`
  };
  else return {};
}

/**
 * Удаление файла
 * @param dl_id Идентификатор файла
 * @returns Результат удаления (файл)
 */
export function deleteFile(fileId: string) {
  return post<void>(`dropbox/file/${fileId}/del`);
}

/**
 * Получение информации о файлах
 * @param fileIds Массив идентификаторов файлов
 * @returns Информация о файлах
 */
export async function getFilesInfo(fileIds: string[]): Promise<DropboxFileInfo[]> {
  const ret = await post<{ 'dropbox files': Record<string, DropboxFileInfo> }>(`dropbox/file/${fileIds}/select`);
  if (ret?.['dropbox files'] && 'object' === typeof ret['dropbox files']) return Object.values(ret['dropbox files']);
  else return [];
}
