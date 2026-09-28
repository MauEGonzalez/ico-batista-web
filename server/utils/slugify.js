// /server/utils/slugify.js
// "Vestido 'Aurora' de Satén" -> "vestido-aurora-de-saten"
export const slugify = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
