import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { ArrowBack, Download } from '@mui/icons-material';
import '../../assets/styles/landing-variables.css';

const BookReader: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pdf = urlParams.get('pdf') || '';
    const title = urlParams.get('title') || 'Book Reader';
    const bookFormat = urlParams.get('format') || 'pdf';
    
    setPdfUrl(decodeURIComponent(pdf));
    setBookTitle(decodeURIComponent(title));
    setFormat(bookFormat);
    
    if (bookFormat === 'html') {
      fetchBookContent(decodeURIComponent(pdf));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBookContent = async (url: string) => {
    // Skip fetching, use direct iframe instead
    setLoading(false);
  };

  const extractBookContent = (htmlContent: string): string => {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove Project Gutenberg header and footer
    const pgHeader = doc.querySelector('#pg-header');
    const pgFooter = doc.querySelector('#pg-footer');
    if (pgHeader) pgHeader.remove();
    if (pgFooter) pgFooter.remove();
    
    // Find the main content area
    const body = doc.body;
    if (!body) return htmlContent;
    
    // Remove navigation and metadata elements
    const elementsToRemove = [
      'script', 'style', 'nav', '.navigation', '#toc', '.toc',
      '[id*="gutenberg"]', '[class*="gutenberg"]',
      '[id*="header"]', '[id*="footer"]'
    ];
    
    elementsToRemove.forEach(selector => {
      const elements = body.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    

    const chapters = body.querySelectorAll('.chapter, [class*="chapter"], h1, h2');
    const paragraphs = body.querySelectorAll('p');
    

    if (chapters.length > 0 || paragraphs.length > 10) {
      // Add enhanced styling for readability
      const style = doc.createElement('style');
      style.textContent = `
        body { 
          font-family: 'Crimson Text', Georgia, serif; 
          line-height: 1.8; 
          max-width: 90%; 
          margin: 0 auto; 
          padding: 20px 15px;
          color: #2c3e50;
          background: #fefefe;
          font-size: 18px;
        }
        h1 { 
          color: #2D472F; 
          font-size: 2.5em;
          margin: 2em 0 1em 0; 
          text-align: center;
          font-weight: 300;
          letter-spacing: 1px;
        }
        h2, h3 { 
          color: #2D472F; 
          margin: 2em 0 1em 0; 
          text-align: center;
          font-weight: 400;
        }
        p { 
          text-align: justify; 
          margin-bottom: 1.2em;
          text-indent: 2em;
          hyphens: auto;
        }
        .chapter { 
          margin-top: 4em;
          border-top: 2px solid #E5E5E5;
          padding-top: 2em;
        }
        blockquote {
          margin: 2em 0;
          padding: 1em 2em;
          border-left: 4px solid #7BA87B;
          background: #F8F9F5;
          font-style: italic;
        }
        em, i { font-style: italic; color: #555; }
        strong, b { font-weight: 600; color: #2c3e50; }
        .gutenberg-header, .gutenberg-footer {
          display: none !important;
        }
      `;
      doc.head.appendChild(style);
      
      return doc.documentElement.outerHTML;
    }
    
    return htmlContent;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${bookTitle}.pdf`;
    link.click();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'var(--primary-green)' }}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => window.close()}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📖 {bookTitle}
          </Typography>
          <Button
            color="inherit"
            startIcon={<Download />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content Viewer */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-ivory)' }}>
        {loading ? (
          <Container className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <Typography variant="h5" color="text.secondary">
                📚 Loading book content...
              </Typography>
              <Typography variant="body1" color="text.secondary" className="mt-2">
                Please wait while we fetch your book.
              </Typography>
            </div>
          </Container>
        ) : error ? (
          <Container className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center">
              <Typography variant="h5" color="error" className="mb-3">
                ⚠️ Failed to load book
              </Typography>
              <Typography variant="body1" color="text.secondary" className="mb-3">
                {error}
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => window.open(pdfUrl, '_blank')}
                className="me-2"
              >
                Open Direct Link
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </Container>
        ) : format === 'html' ? (
          // Direct HTML Book Display
          <div style={{ height: '100%', position: 'relative' }}>
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{ 
                border: 'none',
                backgroundColor: 'var(--card-white)'
              }}
              title={bookTitle}
            />
          </div>
        ) : (
          // PDF Viewer or Fallback
          <div style={{ height: '100%', position: 'relative' }}>
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title={bookTitle}
            />
            
            {/* Fallback options */}
            <div style={{ 
              position: 'absolute', 
              bottom: '20px', 
              right: '20px', 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '8px',
              fontSize: '12px',
              maxWidth: '200px'
            }}>
              <div style={{ marginBottom: '8px' }}>Reading: {format.toUpperCase()} format</div>
              <Button 
                size="small" 
                color="inherit" 
                onClick={() => window.open(pdfUrl, '_blank')}
                style={{ 
                  color: 'lightblue', 
                  textDecoration: 'underline', 
                  padding: 0, 
                  minWidth: 'auto',
                  fontSize: '11px'
                }}
              >
                Open Direct Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReader;