
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
    console.error("Usage: node normalize-pdf.js <input> <output>");
    process.exit(1);
}

async function normalize() {
    try {
        const pdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Save without object streams/compression to ensure FPDI compatibility (PDF 1.4 ish)
        // pdf-lib defaults are usually quite compatible
        const pdfBytesSaved = await pdfDoc.save({ useObjectStreams: false });
        
        fs.writeFileSync(outputPath, pdfBytesSaved);
        console.log("PDF Normalized successfully");
    } catch (e) {
        console.error("Error normalizing PDF:", e);
        process.exit(1);
    }
}

normalize();
