import xmlParser from './xml-json-parser';

const fileReader = new FileReader();

fileReader.onload = (event) => {
  document.querySelector('#xml-area').value = event.target.result
};


function xmltoJson(xmlStr) {
  return JSON.stringify(xmlParser(xmlStr), null, 2);
}


function xmltoJsonFromTextArea() {
  const xml = document.querySelector('#xml-area').value;
  document.querySelector('#json-area').value = xmltoJson(xml);
}

function parseXmlFile(event) {
  fileReader.readAsText(event.target.files[0]);
}

function downloadJSON() {
  if ('Blob' in window) {
    const jsonBlob = new Blob([document.querySelector('#json-area').value], {type: 'application/json'}),
      url = window.URL.createObjectURL(jsonBlob);

    const a = document.createElement("a");
    a.style = "display: none";
    a.href = url;
    a.download = 'parsed-xml.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } else {
    alert('Your browser does not support the HTML5 Blob.');
  }
}

document.querySelector('#to-json').addEventListener('click', xmltoJsonFromTextArea);
document.querySelector('#xml-file').addEventListener('change', parseXmlFile);
document.querySelector('#download-json').addEventListener('click', downloadJSON);
