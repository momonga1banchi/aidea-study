const request = require('supertest');
const app = require('../src/app');

describe('GET /tax', () => {
  test('有効なpriceに対して税計算結果を返す', async () => {
    const response = await request(app).get('/tax?price=1000');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      data: {
        price: 1000,
        taxRate: 0.1,
        tax: 100,
        total: 1100,
      },
    });
  });

  test('price未指定は400エラーにする', async () => {
    const response = await request(app).get('/tax');

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.error.code).toBe('INVALID_PRICE');
  });

  test('小数のpriceは400エラーにする', async () => {
    const response = await request(app).get('/tax?price=100.5');

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.error.code).toBe('INVALID_PRICE');
  });
});
