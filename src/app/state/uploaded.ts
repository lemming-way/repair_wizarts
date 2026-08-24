/**
 * Модуль для работы с загруженными файлами
 *
 * @summary
 * **Функции, влияющие на глобальное состояние:**
 * useFileById
 */
import { useQuery } from '@tanstack/react-query';

import CONFIG from 'config';
import { objectMapper } from 'app/shared/lib/objectMapper';
import { fetchFile } from './api/dropbox';

export function useFileById(fileId: number | null) {
  const queryResult = useQuery({
    queryKey: [ 'files', fileId ],
    queryFn: () => fetchFile(fileId ?? 0),
    staleTime: CONFIG.API?.filesStaleTime ?? 1800000,
    enabled: !!fileId
  });

  return objectMapper(queryResult, {
    data: null,
    blob(target) { return target.data?.blob; },
    type(target) { return target.data?.type; },
    filename(target) { return target.data?.filename; }
  });
}
