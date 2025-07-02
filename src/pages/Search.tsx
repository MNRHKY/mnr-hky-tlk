
import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, User, Clock } from 'lucide-react';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);

  // Mock search results
  const searchResults = query ? [
    {
      id: 1,
      title: 'Best Budget Hockey Skates for Kids Under 12',
      author: 'HockeyParent23',
      category: 'Equipment & Gear',
      replies: 12,
      views: 234,
      lastActivity: '2 hours ago',
      excerpt: 'Hi everyone! I\'m looking for recommendations for budget-friendly hockey skates for my 10-year-old...'
    },
    {
      id: 4,
      title: 'Hockey Skate Maintenance Tips',
      author: 'ProShopOwner',
      category: 'Equipment & Gear',
      replies: 18,
      views: 345,
      lastActivity: '1 day ago',
      excerpt: 'Here are some essential tips for maintaining your hockey skates to ensure they last longer...'
    }
  ] : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
        {query && (
          <p className="text-gray-600">
            Showing results for "{query}" ({searchResults.length} results found)
          </p>
        )}
      </div>

      {/* Search Form */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search topics, posts, and users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {/* Search Results */}
      {query && (
        <Card className="p-6">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        to={`/topic/${result.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 text-lg"
                      >
                        {result.title}
                      </Link>
                      <p className="text-gray-600 mt-1 text-sm">
                        {result.excerpt}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>by {result.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {result.category}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{result.replies} replies</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{result.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{result.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or browse our categories
              </p>
              <Button asChild>
                <Link to="/">Browse Forum</Link>
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* No Search Query */}
      {!query && (
        <Card className="p-6 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search the Forum</h3>
          <p className="text-gray-600 mb-4">
            Enter your search terms above to find topics, posts, and discussions
          </p>
          <Button asChild>
            <Link to="/">Back to Forum</Link>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;
