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

function parseElement(element) {
  const parsedElement = parseAttributes(element.attributes);
  if (typeof element.content === 'object') {
    Object.assign(parsedElement, element.content);
  } else if (Object.keys(parsedElement).length) {
    if (element.content) parsedElement['_text_'] = element.content;
  }
  return Object.keys(parsedElement).length ? parsedElement : element.content;

}
const parseElements = (elements) => {

  const elementCounter = countElements(elements);
  const result = {};
  elements.forEach((element) => {
    if (elementCounter[element.name] > 1) {
      if (!result.hasOwnProperty(element.name)) result[element.name] = [];
      result[element.name].push(parseElement(element));
    }
    else {
      result[element.name] = parseElement(element);
    }
  });
  return result;
};

const xmlJsonParser = (xmlString = '') => {
  const openingTag = /<([a-zA-z_][\w\-]*)([^\/>]*)(\/)?>/g;
  const innerElements = [];
  let execResult;
  while ((execResult = openingTag.exec(xmlString)) !== null) {
    const closingTag = `</${execResult[1]}>`;
    const closingTagIndex = xmlString.indexOf(closingTag, openingTag.lastIndex);
    innerElements.push({
      name: execResult[1],
      attributes: execResult[2],
      content: execResult[3] === '\/' ? ''
        : xmlJsonParser(xmlString.substring(execResult.index + execResult[0].length, closingTagIndex))
    });
    openingTag.lastIndex = execResult[3] === '\/' ? openingTag.lastIndex : closingTagIndex + closingTag.length;
  }

  return innerElements.length ? parseElements(innerElements) : xmlString;
};

export default xmlJsonParser;