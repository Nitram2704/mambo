const suma = require('./suma');

describe('suma', () => {
  test('debe sumar 2 + 3 = 5', () => {
    expect(suma(2, 3)).toBe(5);
  });

  test('debe sumar 0 + 0 = 0', () => {
    expect(suma(0, 0)).toBe(0);
  });

  test('debe sumar -1 + 1 = 0', () => {
    expect(suma(-1, 1)).toBe(0);
  });
});