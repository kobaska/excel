import { processExcel } from './excel';

(() => {
  try {
    processExcel('inputs/input.csv', 'outputs/output.csv');
  } catch (err) {
    console.log('Something went wrong', err);
  }
})();
