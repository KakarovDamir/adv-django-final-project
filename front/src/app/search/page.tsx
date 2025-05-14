"use client";
import { GooeySearchBar } from "@/components/ui/animated-search-bar";
import { useState } from "react";

export default function SearchPage() {
  const [results, setResults] = useState([]);

  return (
    <div className="container mx-auto px-4 pt-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-violet-900 mb-6">Search Users</h1>

      <div className="mb-8">
        <GooeySearchBar />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-violet-800 mb-4">
          Search Results
        </h2>

        {results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((user: any) => (
              <div
                key={user.id}
                className="p-4 border border-violet-100 rounded-lg hover:bg-violet-50 transition-colors"
              >
                {/* User card content */}
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-violet-200 flex items-center justify-center text-violet-600 font-semibold mr-3">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-medium">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No results found. Try searching for users.
          </p>
        )}
      </div>
    </div>
  );
}
