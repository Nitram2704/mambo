const suma = require('../suma.js');

describe('suma', () => {
  test('debe sumar 2 + 3 correctamente', () => {
    expect(suma(2, 3)).toBe(5);
  });

  test('debe sumar 0 + 0 correctamente', () => {
    expect(suma(0, 0)).toBe(0);
  });

  test('debe sumar -1 + 1 correctamente', () => {
    expect(suma(-1, 1)).toBe(0);
  });
});