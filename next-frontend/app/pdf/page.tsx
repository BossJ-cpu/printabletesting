"use client";

import { useState } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export default function PDFPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const generatePdf = async () => {
    try {
      setProcessing(true);
      
      // Load the existing PDF from the public folder
      const existingPdfBytes = await fetch('/Arive-Internship-Plan-SIGNED_signed.pdf').then(res => res.arrayBuffer());
      
      // Load a PDFDocument from the existing PDF bytes
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Embed the standard font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Get the form of the page
      const form = pdfDoc.getForm();

      // OPTIONAL: Get the first page to add visual elements if needed, 
      // but form fields are added to the document form
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      // Example: Adding a text field for 'Name'
      // You might need to adjust x, y coordinates to match the PDF layout
      const textField = form.createTextField('intern_name_field');
      textField.setText('Generated Name');
      // textField.setFontSize(12); // Removed to prevent /DA error
      textField.addToPage(page, {
        x: 50,
        y: height - 100, // pdf-lib uses coordinate system where (0,0) is bottom-left
        width: 200,
        height: 20,
        font: helveticaFont, // Pass font here
      });

      // Example: Adding a text field for 'Date'
      const dateField = form.createTextField('sign_date_field');
      dateField.setText(new Date().toLocaleDateString());
      // dateField.setFontSize(12); // Removed to prevent /DA error
      dateField.addToPage(page, {
        x: 300,
        y: height - 100, 
        width: 150,
        height: 20,
        font: helveticaFont, // Pass font here
      });
      
      // Update appearances with the embedded font
      // This is crucial for avoiding the /DA error and ensuring text is visible
      /* @ts-ignore */
      form.updateFieldAppearances(helveticaFont);

      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();

      // Create a URL for the PDF
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newPdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(newPdfUrl);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to load or generate PDF. Check if existing PDF is valid.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">PDF Generator</h1>
      <p className="mb-4">Template: Arive-Internship-Plan-SIGNED_signed.pdf</p>
      
      <button 
        onClick={generatePdf}
        disabled={processing}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Generate Filled PDF'}
      </button>

      {pdfUrl && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Result:</h3>
          <div className="mb-4">
            <a 
              href={pdfUrl} 
              download="signed-internship-plan.pdf"
              className="text-blue-500 underline"
            >
              Download PDF
            </a>
          </div>
          <iframe src={pdfUrl} width="100%" height="600" className="border shadow-lg" />
        </div>
      )}
    </div>
  );
}
