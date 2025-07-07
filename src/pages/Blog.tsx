import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock blog data - replace with real data later
const blogPosts = [
  {
    id: 1,
    title: "Essential Skills Every Young Hockey Player Should Master",
    excerpt: "From skating fundamentals to puck handling, discover the core skills that will set young players up for success on the ice.",
    author: "Coach Mike Johnson",
    date: "2024-01-15",
    category: "Training",
    readTime: "5 min read",
    image: "/api/placeholder/400/200"
  },
  {
    id: 2,
    title: "Choosing the Right Equipment for Your Minor Hockey Player",
    excerpt: "A comprehensive guide to selecting safe, appropriate, and budget-friendly hockey equipment for players at every level.",
    author: "Sarah Thompson",
    date: "2024-01-10",
    category: "Equipment",
    readTime: "8 min read",
    image: "/api/placeholder/400/200"
  },
  {
    id: 3,
    title: "Building Team Chemistry: Lessons from Successful Minor Hockey Programs",
    excerpt: "Explore strategies used by top minor hockey programs to foster teamwork, communication, and lasting friendships.",
    author: "Coach Dave Wilson",
    date: "2024-01-05",
    category: "Team Building",
    readTime: "6 min read",
    image: "/api/placeholder/400/200"
  },
  {
    id: 4,
    title: "Nutrition Tips for Young Athletes: Fueling Performance on and off the Ice",
    excerpt: "Learn how proper nutrition can enhance performance, support recovery, and promote healthy growth in young hockey players.",
    author: "Dr. Lisa Chen",
    date: "2023-12-28",
    category: "Health",
    readTime: "7 min read",
    image: "/api/placeholder/400/200"
  }
];

const categories = ["All", "Training", "Equipment", "Team Building", "Health", "Safety"];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Minor Hockey Talks Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Insights, tips, and stories from the world of minor hockey
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {post.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {post.readTime}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {post.title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="w-full group">
                Read More
                <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Coming Soon Message */}
      <div className="text-center mt-12 p-8 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">More Content Coming Soon!</h2>
        <p className="text-muted-foreground mb-6">
          We're working on bringing you more valuable content about minor hockey. 
          Stay tuned for regular updates, expert insights, and community stories.
        </p>
        <Button variant="outline">
          Subscribe for Updates
        </Button>
      </div>
    </div>
  );
};

export default Blog;