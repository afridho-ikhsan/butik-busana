export function isValidUrl(urlString: string) {
    try {
      new URL(urlString); // Mencoba membuat instance URL
      return true; // Jika berhasil, URL valid
    } catch (e) {
      return false; // Jika gagal, URL tidak valid
    }
  }