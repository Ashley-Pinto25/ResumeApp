import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with multiple fallbacks
try {
  // Try local worker first
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
} catch {
  console.warn('Local worker not available, using CDN fallback');
  // Fallback to CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export const pdfUtils = {
  async extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log('Starting PDF text extraction for:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      
      // Try to load the PDF document with error handling
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@2.11.338/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@2.11.338/standard_fonts/'
        }).promise;
        console.log('PDF loaded successfully, pages:', pdf.numPages);
      } catch (loadError) {
        console.warn('PDF loading with full config failed, trying basic config:', loadError);
        
        // Fallback: try with minimal configuration
        try {
          pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          console.log('PDF loaded with basic config, pages:', pdf.numPages);
        } catch (basicError) {
          console.error('Both PDF loading attempts failed:', basicError);
          const errorMessage = basicError instanceof Error ? basicError.message : 'Unknown error';
          throw new Error(`Failed to load PDF document: ${errorMessage}`);
        }
      }
      
      let fullText = '';
      let successfulPages = 0;
      
      // Extract text from each page with individual error handling
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item) => 'str' in item ? item.str : '')
            .join(' ');
          
          fullText += pageText + '\n';
          successfulPages++;
        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }
      
      console.log(`Text extraction completed. Processed ${successfulPages}/${pdf.numPages} pages successfully.`);
      
      const extractedText = fullText.trim();
      
      // Provide feedback based on extraction results
      if (!extractedText && successfulPages === 0) {
        return 'No text could be extracted from this PDF. This may be a scanned document, image-based PDF, or encrypted file.';
      } else if (!extractedText && successfulPages > 0) {
        return 'PDF was processed successfully, but no readable text was found. This may be a document with only images or special formatting.';
      } else if (successfulPages < pdf.numPages) {
        return extractedText + `\n\n[Note: ${pdf.numPages - successfulPages} pages could not be processed]`;
      }
      
      return extractedText;
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      
      // Provide specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('worker') || error.message.includes('Worker')) {
          return 'PDF processing encountered a worker loading issue. The file upload will continue, but text analysis may be limited. Please try refreshing the page if this persists.';
        } else if (error.message.includes('Invalid PDF') || error.message.includes('corrupted')) {
          throw new Error('The uploaded file appears to be corrupted or is not a valid PDF document.');
        } else if (error.message.includes('password') || error.message.includes('encrypted')) {
          throw new Error('This PDF is password protected or encrypted. Please provide an unprotected PDF file.');
        }
      }
      
      // For any other errors, still allow the upload to proceed with a warning
      return 'Text extraction from PDF encountered an issue, but the file has been uploaded successfully. Manual review of the document may be needed for analysis.';
    }
  },

  validatePDFFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'Please select a PDF file' };
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }
    
    return { isValid: true };
  }
};
