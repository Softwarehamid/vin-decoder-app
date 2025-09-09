/**
 * Validates a VIN (Vehicle Identification Number)
 * @param vin - The VIN to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateVin(vin: string): { isValid: boolean; error?: string } {
  if (!vin) {
    return { isValid: false, error: 'VIN is required' };
  }

  // Remove spaces and convert to uppercase
  const cleanVin = vin.replace(/\s/g, '').toUpperCase();

  // Check length
  if (cleanVin.length !== 17) {
    return { isValid: false, error: 'VIN must be exactly 17 characters' };
  }

  // Check for invalid characters (I, O, Q are not allowed)
  const validChars = /^[ABCDEFGHJKLMNPRSTUVWXYZ0123456789]+$/;
  if (!validChars.test(cleanVin)) {
    return { isValid: false, error: 'VIN contains invalid characters (I, O, Q not allowed)' };
  }

  // Basic check digit validation (simplified)
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const values: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
  };

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    if (i === 8) continue; // Skip check digit position
    sum += (values[cleanVin[i]] || 0) * weights[i];
  }

  const checkDigit = sum % 11;
  const expectedCheckDigit = checkDigit === 10 ? 'X' : checkDigit.toString();
  
  if (cleanVin[8] !== expectedCheckDigit) {
    return { isValid: false, error: 'Invalid VIN check digit' };
  }

  return { isValid: true };
}