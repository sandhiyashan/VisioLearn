window.addEventListener('DOMContentLoaded', () => {
  const pdfUpload = document.getElementById('pdfUpload');
  const convertPdfBtn = document.getElementById('convertPdfBtn');
  const output = document.getElementById('output');

  // Initialize Liblouis Easy API (Async)
  const lou = new LiblouisEasyApiAsync({
    capi: 'https://raw.githubusercontent.com/sandhiyashan/VisioLearn/main/liblouis-build/build-no-tables-utf32.js',
    easyapi: 'https://raw.githubusercontent.com/sandhiyashan/VisioLearn/main/liblouis/easy-api.js',
  });

  // Enable on-demand table loading (async API)
  lou.enableOnDemandTableLoading('https://raw.githubusercontent.com/sandhiyashan/VisioLearn/main/liblouis-build/tables/', () => {
    console.log('On-demand table loading enabled');
  });

  async function extractText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n\n';
    }
    return text.trim();
  }

  async function convertPdfToBrf() {
    const file = pdfUpload.files[0];
    if (!file) return alert('Please upload a PDF file.');

    const text = await extractText(file);

    // Translate text to Braille using the async API
    lou.translateString('unicode.dis,en-ueb-g2.ctb', text, (braille) => {
      if (braille === null) {
        console.error('Translation failed');
        output.textContent = 'Translation failed';
        return;
      }

      console.log('Braille output:', braille);
      output.textContent = braille;
      downloadBlob(braille, file.name.replace('.pdf', '.brf'));
    });
  }

  function downloadBlob(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertPdfBtn.addEventListener('click', convertPdfToBrf);
});

