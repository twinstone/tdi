import TDI from '../src/index';

describe('index.ts', () => {
  it('should export TDI object', () => {
    expect(TDI).toBeDefined();
    expect(typeof TDI).toBe('object');
  });

  it('should have setup method on TDI', () => {
    expect(typeof (TDI as any).setup).toBe('function');
  });

  it('should not allow direct config modification', () => {
    const TDIApi = TDI as any;
    expect(() => {
      TDIApi.config = { method: 'POST' };
    }).toThrow();
  });

  it('should update config via setup()', () => {
    const TDIApi = TDI as any;
    TDIApi.setup({
      method: 'POST',
      headers: {
        'my-custom-header': 'CustomValue',
      },
    });
    expect(TDIApi.config.method).toBe('POST');
    expect(TDIApi.config.headers['my-custom-header']).toBe('CustomValue');
  });

  it('should not update config with invalid keys', () => {
    const TDIApi = TDI as any;
    const prevConfig = { ...TDIApi.config };
    TDIApi.setup({ invalidKey: 'value' });
    expect(TDIApi.config).toEqual(prevConfig);
  });
});
