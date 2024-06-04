import { AppModule } from './app.module';

jest.mock('electron', () => ({ app: { isPackaged: true, quit: jest.fn(), on: jest.fn() }, BrowserWindow: { getAllWindows: jest.fn(() => []) } }));
describe('AppModule', () => {
  it('should create an instance', () => {
    expect(new AppModule()).toBeTruthy();
  });
});
