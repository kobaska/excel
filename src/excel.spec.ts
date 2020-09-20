import { getResults } from './excel';

describe('getResults', () => {
  describe('when all valid values provided', () => {
    it('should return correct results', () => {
      // Arrange
      const input = [
        ['1', '2', '4'],
        ['A + B', 'C - B'],
      ];

      // Act
      const results = getResults(input);

      // Assert
      expect(results).toStrictEqual([input[0], [3, 2]]);
    });
  });

  describe('when some invalid value provided', () => {
    it('should return correct results with Error for the invalid value', () => {
      // Arrange
      const input = [
        ['1', '2', '4'],
        ['A + B', '2C - B'],
      ];

      // Act
      const results = getResults(input);

      // Assert
      expect(results).toStrictEqual([input[0], [3, 'ERROR']]);
    });

    it('should return correct results with Error when malicious data exists', () => {
      // Arrange
      const input = [
        ['1', '2', '4'],
        ['A * C', 'process.exit(1)'],
      ];

      // Act
      const results = getResults(input);

      // Assert
      expect(results).toStrictEqual([input[0], [4, 'ERROR']]);
    });
  });
});
