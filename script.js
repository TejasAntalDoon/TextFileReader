const fileInput = document.getElementById("fileInput");
const documentContainer = document.getElementById("documentContainer");
const wordElement = document.getElementById("word");
const definitionElement = document.getElementById("definition");

// Handle file upload
fileInput.addEventListener("change", handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileType = file.name.split(".").pop().toLowerCase();
  if (fileType === "pdf") {
    renderPDF(file);
  } else if (fileType === "docx" || fileType === "txt") {
    renderTextFile(file);
  } else {
    alert("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
  }
}

// Render PDF using PDF.js
function renderPDF(file) {
  const fileReader = new FileReader();
  fileReader.onload = async function () {
    const pdfData = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    documentContainer.innerHTML = ""; // Clear previous content

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;

      documentContainer.appendChild(canvas);
    }
  };
  fileReader.readAsArrayBuffer(file);
}

// Render text files or Word files
function renderTextFile(file) {
  const fileReader = new FileReader();
  fileReader.onload = function () {
    const content = this.result;
    const words = content.split(/\s+/).map((word) => word.trim());

    documentContainer.innerHTML = ""; // Clear previous content
    const paragraph = document.createElement("p");

    words.forEach((word) => {
      const span = document.createElement("span");
      span.innerText = word + " ";
      span.style.cursor = "pointer";
      span.addEventListener("click", () => handleWordClick(word));
      paragraph.appendChild(span);
    });

    documentContainer.appendChild(paragraph);
  };
  fileReader.readAsText(file);
}

// Fetch word meaning
async function fetchWordMeaning(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await response.json();
    return (
      data[0]?.meanings[0]?.definitions[0]?.definition || "No definition found."
    );
  } catch (error) {
    return "Error fetching definition.";
  }
}

// Handle word click
async function handleWordClick(word) {
  wordElement.innerText = `Word: ${word}`;
  const definition = await fetchWordMeaning(word);
  definitionElement.innerText = `Meaning: ${definition}`;
}
