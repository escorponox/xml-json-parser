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

const innerText = (str, start, end) => start < end && /\S/g.test(str.substring(start, end));

const findClosingTag = (str, tagName, start) => {
  const closingTag = `</${tagName}>`;
  const nestedTag = `<${tagName}`;

  const nestedTagIndex = str.indexOf(nestedTag, start);
  const closingTagIndex = str.indexOf(closingTag, start);

  return (nestedTagIndex === -1 || closingTagIndex < nestedTagIndex) ? closingTagIndex : findClosingTag(str, tagName, closingTagIndex + 1);
};

const collectTags = (xmlString) => {
  const openingTag = /<([a-zA-z_][\w\-]*)([^\/>]*)(\/)?>/g;
  const innerElements = [];
  let execResult;
  let lastIndex = 0;
  while ((execResult = openingTag.exec(xmlString)) !== null) {
    const closingTag = `</${execResult[1]}>`;
    const closingTagIndex = findClosingTag(xmlString, execResult[1], openingTag.lastIndex);
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
        : collectTags(xmlString.substring(execResult.index + execResult[0].length, closingTagIndex))
    });
    openingTag.lastIndex = lastIndex = execResult[3] === '\/' ? openingTag.lastIndex : closingTagIndex + closingTag.length;
  }
  if (innerElements.length && innerText(xmlString, lastIndex, xmlString.length)) {
    innerElements.push({
      name: '_text_',
      attributes: '',
      content: xmlString.substring(lastIndex)
    });
  }
  return innerElements.length ? parseElements(innerElements) : xmlString;
};


const removeDeclaration = (xmlString) => xmlString.replace(/<\?xml (.|[\r\n])*\?>/, '');

const parseXml = (xmlString = '') => collectTags(removeDeclaration(xmlString));

export default parseXml;