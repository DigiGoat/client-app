import type { MessageBoxOptions, MessageBoxReturnValue, OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from 'electron';

export interface DialogService {
  showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
  showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue>;
  showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue>;
}
