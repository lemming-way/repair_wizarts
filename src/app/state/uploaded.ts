/**
 * Модуль для работы с загруженными файлами
 *
 * @summary
 * **Функции, влияющие на глобальное состояние:**
 * useFileById
 */
import { useQuery } from '@tanstack/react-query';

import CONFIG from 'config';
import { fetchFile } from './api/dropbox';

export function useFileById(fileId: number | null) {
  const queryResult = useQuery({
    queryKey: [ 'files', fileId ],
    queryFn: () => fetchFile(fileId ?? 0),
    staleTime: CONFIG.API?.filesStaleTime ?? 1800000,
    enabled: !!fileId
  });

  const { data: { blob, type, filename } = {}, ...ret } = queryResult;
  return {
    ...ret,
    blob,
    type,
    filename
  };
}
