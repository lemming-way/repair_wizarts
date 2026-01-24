/**
 * Результат успешной аутентификации пользователя.
 */
export type AuthToken = {
  /** Токен аутентификации. */
  token: string;
  /** Хэш пользователя. */
  u_hash: string;
};

const AUTH_TOKEN_LS_KEY = 'auth_token';
const SESSION_ID_LS_KEY = 'session_id';

/**
 * Простая XOR функция шифрования/дешифрования.
 * @param data Строка для шифрования/дешифрования.
 * @param key Ключ шифрования.
 * @returns Зашифрованная/дешифрованная строка.
 */
function xorEncryptDecrypt(data: string, key: string): string {
  if (!data || !key) {
    return data;
  }
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

/**
 * Генерирует случайный идентификатор сессии.
 * @returns Случайная строка идентификатора.
 */
function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Генерирует ключ шифрования длиной 16 байт из строки.
 * @returns Строка ключа шифрования.
 */
function generateKeyFromString(inputString: string): string {
  let key = '';
  let hash = 0;
  
  // Простой хеш на основе строки
  for (let i = 0; i < inputString.length; i++) {
    hash = ((hash << 5) - hash) + inputString.charCodeAt(i);
    hash |= 0; // Преобразуем в 32-битное целое
  }
  
  // Заполняем ключ на основе хеша
  for (let i = 0; i < 16; i++) {
    key += String.fromCharCode( (hash * (i + 1) + inputString.charCodeAt(i % inputString.length)) & 0xFF );
  }
  
  return key;
}

/**
 * Генерирует ключ шифрования на основе идентификатора сессии и свойств Navigator.
 * @param sessionId Текущий идентификатор сессии.
 * @returns Строка ключа шифрования.
 */
function getEncryptionKey(sessionId: string): string {
  if (!sessionId) {
    return '';
  }

  let keyParts: (string | number | boolean | undefined)[] = [sessionId];

  if (typeof navigator !== 'undefined') {
    keyParts.push(navigator.platform || 'undefined');
    // @ts-ignore
    keyParts.push(navigator.oscpu || 'undefined');
    keyParts.push(navigator.vendor || 'undefined');
    // @ts-ignore
    keyParts.push(navigator.deviceMemory || 'undefined');
    keyParts.push(navigator.hardwareConcurrency || 'undefined');

    // navigator.userAgentData - более новый API
    // @ts-ignore
    if (typeof navigator.userAgentData !== 'undefined' && navigator.userAgentData !== null) {
      // @ts-ignore
      const uaData = navigator.userAgentData;
      if (uaData.brands && Array.isArray(uaData.brands)) {
        // Исключаем информацию о версии, используем только названия брендов
        keyParts.push(uaData.brands.map((b: { brand: string; version: string }) => b.brand).join('|'));
      }
      keyParts.push(uaData.mobile || 'undefined');
      keyParts.push(uaData.platform || 'undefined');
    } else {
      // Отсутствие API - это тоже информация
      keyParts.push('undefined');
    }
  }

  // Объединяем, преобразуем числа/булевы значения в строки.
  const keyString = keyParts.map(String).join('-');
  return generateKeyFromString(keyString);
}

let token: AuthToken | null = null;

// При загрузке модуля пытаемся восстановить токен из localStorage
if (typeof localStorage !== 'undefined') {
  const storedSessionId = localStorage.getItem(SESSION_ID_LS_KEY);
  const base64Token = localStorage.getItem(AUTH_TOKEN_LS_KEY);

  if (storedSessionId && base64Token) {
    try {
      const encryptedToken = atob(base64Token);
      const encryptionKey = getEncryptionKey(storedSessionId);
      const decryptedString = xorEncryptDecrypt(encryptedToken, encryptionKey);
      const parsedToken: AuthToken = JSON.parse(decryptedString);

      // Базовая валидация структуры токена
      if (
        parsedToken && !!parsedToken.token && !!parsedToken.u_hash &&
        typeof parsedToken.token === 'string' && typeof parsedToken.u_hash === 'string'
      ) {
        token = { token: parsedToken.token, u_hash: parsedToken.u_hash } = parsedToken; // Сохраняем в памяти
      }
    } catch (e) {
      console.error('Не удалось расшифровать или разобрать токен из localStorage:', e);
      clearToken(); // Очищаем поврежденные данные
    }
  }
}

/**
 * Возвращает текущий токен аутентификации из памяти.
 * @returns Токен аутентификации или null.
 */
export function getToken(): AuthToken | null {
  return token;
}

/**
 * Устанавливает токен аутентификации.
 * Если persist = true, токен сохраняется в localStorage в зашифрованном виде.
 * @param authToken Объект токена аутентификации.
 * @param persist Флаг, указывающий, нужно ли сохранять токен в localStorage.
 */
export function setToken(authToken: AuthToken, persist: boolean = false): void {
  token = authToken; // Всегда устанавливаем в памяти

  if (persist) {
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage недоступен, токен не будет сохранен.');
      return; // Невозможно сохранить, если localStorage недоступен
    }

    const sessionId = generateRandomId(); // Генерируем новый sessionId
    try {
      const encryptionKey = getEncryptionKey(sessionId);
      const tokenString = JSON.stringify(authToken);
      const encryptedToken = xorEncryptDecrypt(tokenString, encryptionKey);
      const base64Token = btoa(encryptedToken);
      localStorage.setItem(AUTH_TOKEN_LS_KEY, base64Token);
      localStorage.setItem(SESSION_ID_LS_KEY, sessionId);
    } catch (e) {
      console.error('Не удалось зашифровать или сохранить токен в localStorage:', e);
      // Если сохранение не удалось, очищаем частично сохраненные данные
      localStorage.removeItem(AUTH_TOKEN_LS_KEY);
      localStorage.removeItem(SESSION_ID_LS_KEY);
    }
  } else {
    if (typeof localStorage !== 'undefined') {
      // Если persist = false, очищаем любой ранее сохраненный токен
      localStorage.removeItem(AUTH_TOKEN_LS_KEY);
      localStorage.removeItem(SESSION_ID_LS_KEY);
    }
  }
}

/**
 * Очищает токен аутентификации из памяти и localStorage, а также sessionId.
 */
export function clearToken(): void {
  token = null;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_LS_KEY);
    localStorage.removeItem(SESSION_ID_LS_KEY);
  }
}
