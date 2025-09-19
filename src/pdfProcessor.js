"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPDFText = extractPDFText;
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
function extractPDFText(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1. Verify file exists
            if (!fs_1.default.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            // 2. Verify it's a PDF
            if (!filePath.toLowerCase().endsWith('.pdf')) {
                throw new Error('File is not a PDF');
            }
            // 3. Read and parse
            const dataBuffer = fs_1.default.readFileSync(filePath);
            const { text } = yield (0, pdf_parse_1.default)(dataBuffer);
            //console.log(text)
            // 4. Clean text
            return text.replace(/\s+/g, ' ').trim();
        }
        catch (error) {
            console.error('Error extracting PDF text:', error);
            throw error; // Re-throw for caller handling
        }
    });
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
