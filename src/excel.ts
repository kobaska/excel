import { readFileSync, writeFileSync } from 'fs';
import * as Papa from 'papaparse';
import { NodeVM } from 'vm2';
import { ParsedData, VmScope, InputParams } from './types';

/**
 * Evaluates each algebraic expression present in the input file and outputs
 * value to the provided output file path
 *
 * Input file should have first row as the integers for the expression and
 * second row onwards to be the expressions. Output file would have the same first
 * row as the input. Rest of the row cells would have the value of the evaluated expression
 *
 * @param inputFilePath, input file path
 * @param outputFilePath, output file path
 */
export function processExcel(inputFilePath: string, outputFilePath: string) {
  const parsedData = getParsedData(inputFilePath);

  if (parsedData.errors?.length) {
    writeFileSync(outputFilePath, 'ERROR_PARSING');
    return;
  }

  if (!parsedData.data.length) {
    writeFileSync(outputFilePath, 'NO_DATA_PROVIDED');
    return;
  }

  var csv = Papa.unparse(getResults(parsedData.data));
  writeFileSync(outputFilePath, csv);
}

/**
 * Evaluates the numeric value of each algebraic expression provided from row 2 onwards, and returns the
 * expression values. First row will be the same as the input's first row
 *
 * @param rows, first row with integer params followed by rows of algebraic expressions
 */
export function getResults(rows: string[][]): string[][] {
  const firstRow = [rows[0]];
  const params = getParams(firstRow[0]);
  const results = firstRow;

  const scope: VmScope = {};
  const vm = new NodeVM({
    sandbox: { scope },
    wasm: false,
  });
  vm.freeze(params, 'params');

  rows.slice(1).forEach((row) => {
    const rowResults: string[] = [];
    row.forEach((expression) => {
      rowResults.push(getResult(vm, expression, scope));
    });

    results.push(rowResults);
  });

  return results;
}

function getParsedData(filePath: string): ParsedData {
  const dataFile = readFileSync(filePath).toString('utf8');
  return Papa.parse(dataFile, {
    skipEmptyLines: 'greedy',
    header: false,
    transform: (v) => v && v.trim(),
    transformHeader: (v) => v && v.trim(),
  });
}

/**
 * Returns value for algebraic expression. If an invalid expression provided, function
 * would return 'ERROR'
 *
 * @param vm, VM instance
 * @param expression, algebraic expression to calculate
 * @param scope, VM sandbox scope object
 */
function getResult(vm: NodeVM, expression: string, scope: VmScope): string {
  vm.freeze(expression, 'expression');

  // reset scope result
  scope.result = undefined;

  try {
    vm.run(`
      const calculate = new Function(...Object.keys(params), 'return ' + String(expression));
      scope.result = calculate(...Object.values(params));
    `);
    return (scope.result as unknown) as string;
  } catch (err) {
    return 'ERROR';
  }
}

/**
 * Returns a Dictionary of numbers. Keys would start from A and go till Z
 *
 * @param params array of param values
 */
function getParams(params: string[]): InputParams {
  let startCharIndex = 'A'.charCodeAt(0);
  const inputParams: InputParams = {};

  // TODO: limitation - the keys only would work till column Z.
  // Handle for cases where column is AA, AB etc.
  return params.reduce((p, c) => {
    p[String.fromCharCode(startCharIndex++)] = Number(c);
    return p;
  }, inputParams);
}
