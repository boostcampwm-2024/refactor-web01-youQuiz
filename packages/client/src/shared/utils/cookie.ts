export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}

export function setCookie(name: string, val: any, minute?: number) {
  const date = new Date();
  const value = val;
  // minute가 없는 경우 세션쿠키로 설정
  if (minute) {
    date.setTime(date.getTime() + minute * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  } else {
    document.cookie = `${name}=${value}; path=/`;
  }
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
}
