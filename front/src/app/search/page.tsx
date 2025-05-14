'use client';
import { useState } from 'react';

export default function SearchPage() {
  const [results, setResults] = useState([]);

  const handleSearch = async (query: string) => {
    const res = await fetch(`/api/search?q=${query}`);
    setResults(await res.json());
  };

  return (
    <div className="container">
      <input 
        type="text" 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search users..."
      />
      <div className="search-results">
        {results.map((user: any) => (
          <div key={user.id} className="user-card">
            {/* Карточка пользователя */}
          </div>
        ))}
      </div>
    </div>
  );
}