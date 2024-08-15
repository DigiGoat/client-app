import { contextBridge } from 'electron';
import { AppModule } from './app.module';

jest.mock('electron', () => ({ contextBridge: { exposeInMainWorld: jest.fn() } }));
describe('AppModule', () => {
  let module: AppModule;
  beforeEach(() => {
    module = new AppModule();
  });
  it('should create an instance', () => {
    expect(module).toBeTruthy();
  });
  it('should have an api', () => {
    expect(module.api).toBeTruthy();
  });
  it('should expose the api under `window.electron`', () => {
    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('electron', module.api);
  });
});
