import React, { useState, useEffect } from 'react';
import { SearchResponse } from './types';

export default function App() {
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minBedrooms, setMinBedrooms] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [targetBudget, setTargetBudget] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minBedrooms) params.append('minBedrooms', minBedrooms);
      if (city) params.append('city', city);
      if (keyword) params.append('keyword', keyword);
      if (targetBudget) params.append('targetBudget', targetBudget);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      const response = await fetch(`http://localhost:8080/api/listings/search?${params.toString()}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch listings');
      }

      setData(json);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    setCity('');
    setKeyword('');
    setTargetBudget('');
    setPage(1);
    setPageSize(5);
    setTimeout(fetchListings, 0);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>MLS Property Listing Search</h1>
      
      <form onSubmit={handleSearchSubmit} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Min Price ($):</label>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="e.g. 400000" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Price ($):</label>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="e.g. 600000" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Min Bedrooms:</label>
          <input type="number" value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)} placeholder="e.g. 2" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City:</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Springfield" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Keyword:</label>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. condo, pets" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Target Budget ($):</label>
          <input type="number" value={targetBudget} onChange={(e) => setTargetBudget(e.target.value)} placeholder="e.g. 450000" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Page Size:</label>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ width: '100%', padding: '8px' }}>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Search</button>
          <button type="button" onClick={handleReset} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
        </div>
      </form>

      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '20px', fontSize: '18px' }}>Loading results...</div>}

      {!loading && !error && data && (
        <div>
          <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>
            Found {data.totalElements} listings (Page {data.currentPage} of {data.totalPages})
          </div>

          {data.content.length === 0 ? (
            <div style={{ background: '#fff3cd', color: '#856404', padding: '20px', borderRadius: '4px', textAlign: 'center' }}>
              No listings match your filter criteria or budget.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {data.content.map((listing) => (
                <div key={`${listing.source}-${listing.id}`} style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>{listing.address}, {listing.city}, {listing.state} {listing.zip}</h3>
                      <p style={{ margin: '0 0 10px 0', color: '#555' }}>{listing.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>${listing.price.toLocaleString()}</span>
                      <div style={{ fontSize: '12px', background: '#e9ecef', padding: '3px 6px', borderRadius: '4px', marginTop: '5px', display: 'inline-block' }}>
                        Relevance: <strong>{listing.relevanceScore}</strong>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                    <span>🛏️ {listing.bedrooms} Beds</span>
                    <span>🛁 {listing.bathrooms} Baths</span>
                    <span>📐 {listing.sqft} sqft</span>
                    <span>🏷️ Source: {listing.source}</span>
                    <span>📅 Listed: {listing.listedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={data.currentPage === 1}
                style={{ padding: '8px 15px', cursor: data.currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span>Page {data.currentPage} of {data.totalPages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, data.totalPages))}
                disabled={data.currentPage === data.totalPages}
                style={{ padding: '8px 15px', cursor: data.currentPage === data.totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
