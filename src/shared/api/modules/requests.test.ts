import { getClientRequests } from './requests';

jest.mock('../auth', () => ({
  getAuthParams: jest.fn(() => ({})),
}));

describe('requests module', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getClientRequests calls POST and resolves data', async () => {
    const spy = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ([]),
    } as any);
    const res = await getClientRequests();
    expect(res.ok).toBe(true);
    expect(spy).toHaveBeenCalled();
    const [, init] = (spy as jest.Mock).mock.calls[0];
    expect(init.method).toBe('POST');
  });
});
