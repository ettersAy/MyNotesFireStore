import * as Clipboard from 'expo-clipboard';

export default class ClipboardService {
  async writeText(text) {
    return Clipboard.setStringAsync(String(text || ''));
  }
}
