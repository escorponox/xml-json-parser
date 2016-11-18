// var test = require('tape');
// var parser = require('../../app/scripts/xml-json-parser');

import test from 'tape';
import parser from '../../app/scripts/xml-json-parser';

test('it runs', (t) => {
  t.equal(parser(),'', 'No input returns empty string');
  t.end();
});