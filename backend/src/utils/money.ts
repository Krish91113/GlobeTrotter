import { Decimal } from 'decimal.js';

export type MoneyInput = Decimal | string | number | null | undefined;

/**
 * Converts any supported money value to a fixed decimal string.
 * Never use JS float arithmetic on money — always route through Decimal.
 */
export function toDecimalString(value: MoneyInput, decimalPlaces = 2): string | null {
  if (value === null || value === undefined) return null;
  return new Decimal(value instanceof Decimal ? value : value.toString()).toFixed(decimalPlaces);
}

/**
 * Sums a list of money values using Decimal arithmetic and returns a
 * fixed decimal string. Empty input yields "0.00".
 */
export function sumDecimals(values: Array<MoneyInput>, decimalPlaces = 2): string {
  return values
    .reduce<Decimal>(
      (acc, value) => acc.plus(value instanceof Decimal ? value : new Decimal(value?.toString() ?? 0)),
      new Decimal(0)
    )
    .toFixed(decimalPlaces);
}
