
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Ban, Shield, User } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { formatDistanceToNow } from 'date-fns';

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users, isLoading, error } = useAdminUsers();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h2>
          <p className="text-gray-600">{error.message || 'Unable to load user data'}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button>Add New User</Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users by username..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Reputation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at ? formatDistanceToNow(new Date(user.created_at)) + ' ago' : 'Unknown'}
                    </TableCell>
                    <TableCell>{user.post_count}</TableCell>
                    <TableCell>{user.reputation}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="mr-2 h-4 w-4" />
                            Ban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">
            {isLoading ? '...' : users?.length || 0}
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Active Users</h3>
          <p className="text-2xl font-bold text-green-600">
            {isLoading ? '...' : users?.length || 0}
          </p>
          <p className="text-sm text-gray-500">All users are considered active</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Admins</h3>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? '...' : users?.filter(u => u.role === 'admin').length || 0}
          </p>
        </Card>
      </div>
    </div>
  );
};
