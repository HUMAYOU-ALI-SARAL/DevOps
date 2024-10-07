export const hexToUtf8 = (hexString: string): string => {
  try {
    let parsedHexString = hexString.replace(/^\\*?x/gi, '');
    return decodeURIComponent(parsedHexString.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
  } catch (err) {
    return hexString;
  }
}
