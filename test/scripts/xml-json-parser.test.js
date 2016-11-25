import test from 'tape';
import parser from '../../app/scripts/xml-json-parser';

test('root element', (t) => {
  t.equal(parser(), '', 'No input returns ""');
  t.equal(parser(''), '', 'Empty input returns ""');
  t.deepEqual(parser('<files></files>'), {files: ""}, 'Empty root returns a empty value');
  t.deepEqual(parser(`<files>
</files>`), {files: '\n'}, 'Multiline elements');
  t.deepEqual(parser('<files>lalala</files>'),
    {
      files: 'lalala'
    },
    'Text element returns the text');
  t.deepEqual(parser('<files lalala></files>'),
    {
      files: {
        _attr_lalala: true
      }
    },
    'Empty root with empty attribute return only a true attribute');

  t.deepEqual(parser('<files lalala>lelele</files>'),
    {
      files: {
        _attr_lalala: true,
        '_text_': 'lelele'
      }
    },
    'Text root with attributes returns the attributes and the text');
  t.end();
});

test('multiple elements of same type', (t) => {

  t.deepEqual(parser('<files><file>a</file><file>b</file></files>'),
    {
      files: {
        file: ['a', 'b']
      }
    },
    'multiple inner tags of same type is an array');

  t.deepEqual(parser(`<files>
  a
  <file>a</file>
  b
  <file>b</file>
  
  </files>`), {
    files: {
      file: ['a', 'b'],
      _text_: ['\n  a\n  ', '\n  b\n  ']
    }
  }, 'Multiple text content. Text content first');

  t.deepEqual(parser(`<files>
  
  <file>a</file>
  a
  <file>b</file>
  b
  </files>`), {
    files: {
      file: ['a', 'b'],
      _text_: ['\n  a\n  ', '\n  b\n  ']
    }
  }, 'More multiple text content. Text content at the end');

  t.end();
});

test('declaration', (t) => {
  t.deepEqual(parser(`<?xml version="1.0"
encoding="UTF-8"?>
<people>
  <person>
    <name>Pepito Garcia</name>
  </person>
</people>`), {
    people: {
      person: {
        name: 'Pepito Garcia'
      }
    }
  }, 'xml declaration is filtered');
  t.end();
});

test('nesting', (t) => {
  t.deepEqual(parser(`<people>
  <person>
    <children>
      <person>
        <name>Juanito Garcia</name>
      </person>
    </children>
  </person>
</people>`), {
    people: {
      person: {
        children: {
          person: {
            name: 'Juanito Garcia'
          }
        }
      }
    }
  }, 'Person inside person children');
  t.end();
});

test('integration', (t) => {

  t.deepEqual(parser(`<file lala="ajs">
<title >Pandora</title>
    <author  asdajh>Pedro Vian</author>
    <album asdasd="34:45">Viejuno</album>
    <genre>Electronic</genre>
    <emptyTag />
</file>`), {
    file: {
      _attr_lala: 'ajs',
      title: 'Pandora',
      author: {
        _attr_asdajh: true,
        _text_: 'Pedro Vian',
      },
      album: {
        _attr_asdasd: '34:45',
        _text_: 'Viejuno'
      },
      genre: 'Electronic',
      emptyTag: ''
    }
  }, 'a complex audio file xml');

  t.deepEqual(parser(`<files><file lala="ajs">
<title >Pandora</title>
    <author  asdajh>Pedro Vian</author>
    <album asdasd="34:45">Viejuno</album>
    <genre>Electronic</genre>
    <emptyTag />
</file>
<file lala="ajsa">
<title >Pandora</title>
    <author  asdajh>Pedro Vian</author>
    <album asdasd="34:45">Viejuno</album>
    <genre>Electronic</genre>
    <emptyTag />
</file>
</files>`), {
    files: {
      file: [{
        _attr_lala: 'ajs',
        title: 'Pandora',
        author: {
          _attr_asdajh: true,
          _text_: 'Pedro Vian',
        },
        album: {
          _attr_asdasd: '34:45',
          _text_: 'Viejuno'
        },
        genre: 'Electronic',
        emptyTag: ''
      },
        {
          _attr_lala: 'ajsa',
          title: 'Pandora',
          author: {
            _attr_asdajh: true,
            _text_: 'Pedro Vian',
          },
          album: {
            _attr_asdasd: '34:45',
            _text_: 'Viejuno'
          },
          genre: 'Electronic',
          emptyTag: ''
        }]
    }
  }, 'complex audio files xml');

  t.end();
});