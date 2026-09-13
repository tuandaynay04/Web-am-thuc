const ACCESS_TOKEN_KEY =
  'web_am_thuc_access_token';

export const AUTH_CHANGED_EVENT =
  'web-am-thuc-auth-changed';

export function saveAccessToken(
  token: string,
) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    token,
  );

  window.dispatchEvent(
    new Event(AUTH_CHANGED_EVENT),
  );
}

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(
    ACCESS_TOKEN_KEY,
  );
}

export function removeAccessToken() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );

  window.dispatchEvent(
    new Event(AUTH_CHANGED_EVENT),
  );
}