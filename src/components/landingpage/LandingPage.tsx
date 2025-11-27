import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/landing-variables.css';

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: 'available' | 'borrowed';
  publishedYear?: number;
  readUrl?: string;
}

const LandingPage: React.FC = () => {
  const [bestsellers, setBestsellers] = useState<Book[]>([]);
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBestsellerIndex, setCurrentBestsellerIndex] = useState(3);
  const [currentNewArrivalIndex, setCurrentNewArrivalIndex] = useState(3);

  useEffect(() => {
    fetchBooksFromGutenberg();
  }, []);

  // Auto-slide carousels
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBestsellerIndex((prev) => (prev + 1) % bestsellers.length);
    }, 3000); // Slide every 3 seconds
    return () => clearInterval(interval);
  }, [bestsellers.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewArrivalIndex((prev) => (prev + 1) % newArrivals.length);
    }, 3500); // Slide every 3.5 seconds
    return () => clearInterval(interval);
  }, [newArrivals.length]);

  const fetchBooksFromGutenberg = async () => {
    setLoading(true);
    
 
    const sampleBooks: Book[] = [
      { id: '1342', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://covers.openlibrary.org/b/id/240726-M.jpg', status: 'available', publishedYear: 1813, readUrl: 'https://www.gutenberg.org/files/1342/1342-h/1342-h.htm' },
      { id: '11', title: 'Alice in Wonderland', author: 'Lewis Carroll', coverUrl: 'https://covers.openlibrary.org/b/id/240725-M.jpg', status: 'borrowed', publishedYear: 1865, readUrl: 'https://www.gutenberg.org/files/11/11-h/11-h.htm' },
      { id: '84', title: 'Frankenstein', author: 'Mary Shelley', coverUrl: 'https://covers.openlibrary.org/b/id/240724-M.jpg', status: 'available', publishedYear: 1818, readUrl: 'https://www.gutenberg.org/files/84/84-h/84-h.htm' },
      { id: '345', title: 'Dracula', author: 'Bram Stoker', coverUrl: 'https://covers.openlibrary.org/b/id/240723-M.jpg', status: 'available', publishedYear: 1897, readUrl: 'https://www.gutenberg.org/files/345/345-h/345-h.htm' },
      { id: '64317', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://covers.openlibrary.org/b/id/240722-M.jpg', status: 'borrowed', publishedYear: 1925, readUrl: 'https://www.gutenberg.org/files/64317/64317-h/64317-h.htm' },
      { id: '768', title: 'Wuthering Heights', author: 'Emily Brontë', coverUrl: 'https://covers.openlibrary.org/b/id/240721-M.jpg', status: 'available', publishedYear: 1847, readUrl: 'https://www.gutenberg.org/files/768/768-h/768-h.htm' },
      { id: '2701', title: 'Moby Dick', author: 'Herman Melville', coverUrl: 'https://covers.openlibrary.org/b/id/240727-M.jpg', status: 'borrowed', publishedYear: 1851, readUrl: 'https://www.gutenberg.org/files/2701/2701-h/2701-h.htm' },
      { id: '1260', title: 'Jane Eyre', author: 'Charlotte Brontë', coverUrl: 'https://covers.openlibrary.org/b/id/240720-M.jpg', status: 'available', publishedYear: 1847, readUrl: 'https://www.gutenberg.org/files/1260/1260-h/1260-h.htm' }
    ];
    
    setBestsellers(sampleBooks);
    setNewArrivals([...sampleBooks].reverse());
    setLoading(false);
  };

  const nextBestseller = () => {
    setCurrentBestsellerIndex((prev) => (prev + 1) % bestsellers.length);
  };

  const prevBestseller = () => {
    setCurrentBestsellerIndex((prev) => (prev - 1 + bestsellers.length) % bestsellers.length);
  };

  const nextNewArrival = () => {
    setCurrentNewArrivalIndex((prev) => (prev + 1) % newArrivals.length);
  };

  const prevNewArrival = () => {
    setCurrentNewArrivalIndex((prev) => (prev - 1 + newArrivals.length) % newArrivals.length);
  };

  const handleReadBook = (book: Book) => {
    if (book.readUrl) {
      window.open(`/book-reader?pdf=${encodeURIComponent(book.readUrl)}&title=${encodeURIComponent(book.title)}&format=html`, '_blank');
    } else {
      alert('Book content not available');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh' }}>
        
        {/* Navbar */}
        <header role="banner" style={{
          height: 'var(--nav-height)',
          backgroundColor: 'var(--primary-green)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          maxWidth: 'var(--page-max-width)',
          margin: '0 auto'
        }}>
          <span style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>BookSync</span>
          
          <nav style={{ display: 'flex', gap: '28px' }}>
            <Link to="/user-register" style={{ fontSize: '15px', letterSpacing: '0.2px', color: 'white', textDecoration: 'none' }}>Register</Link>
            <Link to="/user-login" style={{ fontSize: '15px', letterSpacing: '0.2px', color: 'white', textDecoration: 'none' }}>Login</Link>
          </nav>
        </header>

        <main role="main" style={{ maxWidth: 'var(--page-max-width)', margin: '0 auto' }}>
          {/* Hero Section */}
          <section className="hero" style={{
            height: '420px',
            backgroundImage: `linear-gradient(rgba(0,0,0,0.08), rgba(0,0,0,0.08)), url('/images/landingpage_image.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '640px',
              maxWidth: '65%',
              padding: '36px 48px',
              backgroundColor: 'rgba(255,255,255,0.01)',
              backdropFilter: 'blur(12px)',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-hero)',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 16px 0',
                lineHeight: '1.2',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}>
Still using spreadsheets? Let your library join the future
              </h1>
              <p style={{
                fontSize: '18px',
                color: 'var(--primary-green)',
                margin: '0 0 20px 0',
                lineHeight: '1.5',
                textShadow: '1px 1px 3px rgba(255,255,255,0.8)'
              }}>
                A complete multi-tenant library platform for institutions, organizations, and public readers.
                <br />
                Manage books, users, approvals, and branches — securely and effortlessly.
              </p>
              <button 
                className="btn-hover focus-ring"
                onClick={() => window.location.href = '/register-library'}
                style={{
                  backgroundColor: 'var(--primary-green)',
                  color: 'white',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '44px',
                  minHeight: '44px',
                  marginBottom: '12px'
                }}
              >
                Get Started
              </button>
              <p style={{
                fontSize: '14px',
                color: '#ffffff',
                margin: '0',
                textShadow: '1px 1px 2px rgba(0,0,0,0.6)'
              }}>
                For Public Libraries & Institutional Libraries
              </p>
            </div>
          </section>

          {/* Icon Strip */}
          <section className="features" style={{
            backgroundColor: 'var(--card-white)',
            padding: '28px 0',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', gap: '18px' }}>
              {[
                { icon: <i className="bi bi-diagram-3" style={{ fontSize: '34px', color: 'var(--primary-green)' }}></i>, label: 'Multi-Library System' },
                { icon: <i className="bi bi-shield-check" style={{ fontSize: '34px', color: 'var(--primary-green)' }}></i>, label: 'Smart User Approvals' },
                { icon: <i className="bi bi-collection" style={{ fontSize: '34px', color: 'var(--primary-green)' }}></i>, label: 'Book Management' },
                { icon: <i className="bi bi-arrow-left-right" style={{ fontSize: '34px', color: 'var(--primary-green)' }}></i>, label: 'Issue & Return Flow' },
                { icon: <i className="bi bi-bar-chart" style={{ fontSize: '34px', color: 'var(--primary-green)' }}></i>, label: 'Insights & Reporting' }
              ].map((feature, index) => (
                <div key={index} className="card-hover" style={{
                  width: '132px',
                  height: '88px',
                  backgroundColor: 'var(--card-white)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(45,71,47,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <div style={{ marginBottom: '8px' }}>{feature.icon}</div>
                  <div style={{ fontSize: '13px', color: 'var(--primary-green)' }}>{feature.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Carousel */}
          <section className="carousel bestsellers" aria-label="Trending Books" style={{ padding: '0 20px' }}>
            <h2 style={{
              fontSize: '36px',
              textAlign: 'center',
              fontWeight: '700',
              color: 'var(--primary-green)',
              marginTop: '46px',
              marginBottom: '32px',
              letterSpacing: '-0.5px'
            }}>
              🔥 Trending
            </h2>
            
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <button 
                className="btn-hover focus-ring"
                onClick={prevBestseller}
                aria-label="Previous books"
                style={{
                  position: 'absolute',
                  left: '-12px',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--card-white)',
                  boxShadow: 'var(--shadow-card)',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-green)'
                }}
              >
                ←
              </button>
              
              <div style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
                {loading ? (
                  <div style={{ color: 'var(--primary-green)', fontSize: '18px' }}>Loading books...</div>
                ) : bestsellers.length === 0 ? (
                  <div style={{ color: 'var(--primary-green)', fontSize: '18px' }}>No books available</div>
                ) : bestsellers.slice(0, 6).map((book, index) => {
                  const actualIndex = (currentBestsellerIndex - 3 + index + bestsellers.length) % bestsellers.length;
                  const displayBook = bestsellers[actualIndex];
                  const isCenter = index === 2 || index === 3;
                  
                  return (
                    <div 
                      key={displayBook?.id || index}
                      className={`card-hover ${isCenter ? 'carousel-center' : ''}`}
                      data-qa={`book-card-${displayBook?.id}`}
                      onClick={() => handleReadBook(displayBook)}
                      style={{
                        width: isCenter ? '200px' : '180px',
                        height: isCenter ? '300px' : '280px',
                        backgroundColor: 'var(--card-white)',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow-card)',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer'
                      }}
                    >
                      <img 
                        src={displayBook?.coverUrl}
                        alt={displayBook?.title || 'Book cover'}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const nextElement = target.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                        style={{
                          width: '100%',
                          height: isCenter ? '200px' : '180px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '6px'
                        }}
                      />
                      <div style={{
                        width: '100%',
                        height: isCenter ? '200px' : '180px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '8px',
                        marginBottom: '6px',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px'
                      }}>
                        📚
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{
                            fontSize: isCenter ? '16px' : '14px',
                            fontWeight: '600',
                            color: 'var(--text-dark)',
                            margin: '0 0 4px 0',
                            lineHeight: '1.2',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {displayBook?.title || 'Loading...'}
                          </h3>
                          <p style={{
                            fontSize: '12px',
                            color: 'var(--subtext-gray)',
                            margin: '0 0 8px 0'
                          }}>
                            {displayBook?.author || 'Unknown Author'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button 
                className="btn-hover focus-ring"
                onClick={nextBestseller}
                aria-label="Next books"
                style={{
                  position: 'absolute',
                  right: '-12px',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--card-white)',
                  boxShadow: 'var(--shadow-card)',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-green)'
                }}
              >
                →
              </button>
            </div>

          </section>






          {/* Announcements */}
          <section className="offers" style={{ padding: '46px 20px' }}>
            <div style={{
              backgroundColor: 'var(--card-white)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-card)',
              padding: '22px',
              display: 'flex',
              alignItems: 'center',
              gap: '24px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: 'var(--primary-green)',
                  margin: '0 0 12px 0'
                }}>
                  Special Offer: Free Library Setup
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--primary-green)',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Register your library today and get 3 months of premium features absolutely free. 
                  Includes unlimited books, advanced analytics, and priority support.
                </p>
              </div>
              <img 
                src="/images/landingpage_image2.jpg"
                alt="Library setup offer"
                style={{
                  width: '300px',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer role="contentinfo" style={{
          backgroundColor: 'var(--primary-green)',
          color: 'rgba(255,255,255,0.9)',
          padding: '50px 20px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '80px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: 'Inter' }}>About</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px', fontFamily: 'Inter' }}>Our Story</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px', fontFamily: 'Inter' }}>Mission</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px', fontFamily: 'Inter' }}>Team</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: 'Inter' }}>Services</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px', fontFamily: 'Inter' }}>Library Management</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px', fontFamily: 'Inter' }}>Digital Catalog</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px', fontFamily: 'Inter' }}>Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: 'Inter' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px', fontFamily: 'Inter' }}>Help Center</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px', fontFamily: 'Inter' }}>Documentation</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px', fontFamily: 'Inter' }}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: 'Inter' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-envelope" style={{ color: 'white', fontSize: '16px' }}></i>
                  </div>
                  <span style={{ fontSize: '15px', fontFamily: 'Inter' }}>support@booksync.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-telephone" style={{ color: 'white', fontSize: '16px' }}></i>
                  </div>
                  <span style={{ fontSize: '15px', fontFamily: 'Inter' }}>+91 90000 12345</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-globe" style={{ color: 'white', fontSize: '16px' }}></i>
                  </div>
                  <span style={{ fontSize: '15px', fontFamily: 'Inter' }}>www.booksync.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <style>{`
            @media (max-width: 768px) {
              footer > div {
                grid-template-columns: 1fr !important;
                gap: 40px !important;
              }
            }
            
            @media (max-width: 1024px) and (min-width: 769px) {
              footer > div {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 60px !important;
              }
            }
          `}</style>
        </footer>
    </div>
  );
};

export default LandingPage;