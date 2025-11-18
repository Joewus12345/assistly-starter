import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export async function extractPDFText(filePath: string): Promise<string> {
  try {
    // 1. Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // 2. Verify it's a PDF
    if (!filePath.toLowerCase().endsWith('.pdf')) {
      throw new Error('File is not a PDF');
    }

    // 3. Read and parse
    const dataBuffer = fs.readFileSync(filePath);
    const { text } = await pdf(dataBuffer);
    //console.log(text)
    
    // 4. Clean text
    return text.replace(/\s+/g, ' ').trim();
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw error; // Re-throw for caller handling
  }
}

// Proper execution
// (async () => {
//   try {
//     const pdfPath = path.join(__dirname, '..', 'data', 'documents', 'pdf.pdf'); // ← Verify name!
//     console.log(`Reading PDF from: ${pdfPath}`);
    
//     const text = await extractPDFText(pdfPath);
//     // console.log('Extracted text:', text);
    
//   } catch (error) {
//     console.error('Failed to process PDF:', error);
//   }
// })();