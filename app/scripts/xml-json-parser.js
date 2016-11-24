const parseAttributes = (attr) => {
  const attribute = /([^\s=]+)(="([^"]*)")?/g;
  const result = {};
  let execResult;
  while ((execResult = attribute.exec(attr)) !== null) {
    result['_attr_' + execResult[1]] = execResult[3] || true;
  }
  return result;
};

const countElements = (elements) => elements.reduce((prev, curr) => {
  prev[curr.name] = ++prev[curr.name] || 1;
  return prev;
}, {});

const parseElement = (element) => {
  const parsedElement = parseAttributes(element.attributes);
  if (typeof element.content === 'object') {
    Object.assign(parsedElement, element.content);
  } else if (Object.keys(parsedElement).length) {
    if (element.content) parsedElement['_text_'] = element.content;
  }
  return Object.keys(parsedElement).length ? parsedElement : element.content;

};

const parseElements = (elements) => {

  const elementCounter = countElements(elements);

  return elements.reduce((prev, element) => {
    if (elementCounter[element.name] > 1) {
      if (!prev.hasOwnProperty(element.name)) prev[element.name] = [];
      prev[element.name].push(parseElement(element));
    }
    else {
      prev[element.name] = parseElement(element);
    }
    return prev
  }, {});
};

const innerText = (str, start, end) =>
start < end
&& /\S/g.test(str.substring(start, end));

const xmlJsonParser = (xmlString = '') => {
  const openingTag = /<([a-zA-z_][\w\-]*)([^\/>]*)(\/)?>/g;
  const innerElements = [];
  let execResult;
  let lastIndex = 0;
  while ((execResult = openingTag.exec(xmlString)) !== null) {
    const closingTag = `</${execResult[1]}>`;
    const closingTagIndex = xmlString.indexOf(closingTag, openingTag.lastIndex);
    if (innerText(xmlString, lastIndex, execResult.index)) {
      innerElements.push({
        name: '_text_',
        attributes: '',
        content: xmlString.substring(lastIndex, execResult.index)
      });
    }
    innerElements.push({
      name: execResult[1],
      attributes: execResult[2],
      content: execResult[3] === '\/' ? ''
        : xmlJsonParser(xmlString.substring(execResult.index + execResult[0].length, closingTagIndex))
    });
    openingTag.lastIndex = lastIndex = execResult[3] === '\/' ? openingTag.lastIndex : closingTagIndex + closingTag.length;
  }

  return innerElements.length ? parseElements(innerElements) : xmlString;
};

export default xmlJsonParser;