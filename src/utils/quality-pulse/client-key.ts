const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function toClientKey(clientName: string): string {
  return clientName
    .trim()
    .toLocaleLowerCase("es-CL")
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/\s+/g, " ");
}
