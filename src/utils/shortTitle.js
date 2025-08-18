export function shortTitle(str) {
  const s = (str == null || str === '') ? 'Untitled' : String(str);
  return s.length > 13 ? s.slice(0, 13) + ' ...' : s;
}
