import { describe, it, expect } from 'vitest';
import { validateVin } from '../vinValidator';

describe('validateVin', () => {
  it('should return valid for correct VIN', () => {
    const result = validateVin('1HGBH41JXMN109186');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty VIN', () => {
    const result = validateVin('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('VIN is required');
  });

  it('should reject VIN with wrong length', () => {
    const result = validateVin('1HGBH41JXMN10918');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('VIN must be exactly 17 characters');
  });

  it('should reject VIN with invalid characters', () => {
    const result = validateVin('1HGBH41JXMN10918I');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('VIN contains invalid characters (I, O, Q not allowed)');
  });

  it('should reject VIN with invalid characters O', () => {
    const result = validateVin('1HGBH41JXMN10918O');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('VIN contains invalid characters (I, O, Q not allowed)');
  });

  it('should reject VIN with invalid characters Q', () => {
    const result = validateVin('1HGBH41JXMN10918Q');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('VIN contains invalid characters (I, O, Q not allowed)');
  });

  it('should handle VIN with spaces', () => {
    const result = validateVin('1HG BH4 1JX MN1 09186');
    expect(result.isValid).toBe(true);
  });

  it('should handle lowercase VIN', () => {
    const result = validateVin('1hgbh41jxmn109186');
    expect(result.isValid).toBe(true);
  });

  it('should reject VIN with invalid check digit', () => {
    const result = validateVin('1HGBH41JXMN109187');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid VIN check digit');
  });
});