'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Desktop } from '@/components/desktop';
import { User } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setUsername(user.displayName);
    }
  }, [user]);

  const handleUpdateUsername = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }
    if (!username) {
        toast({
            variant: 'destructive',
            title: 'Username Required',
            description: 'Please enter a username.',
        });
        return;
    }

    setIsLoading(true);
    try {
      // Update local storage with new username
      const updatedUser = { ...user, displayName: username };
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      
      toast({
        title: 'Success!',
        description: 'Your username has been updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return <Desktop><p>Loading user information...</p></Desktop>;
  }

  return (
    <Desktop>
       <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your public profile and account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                     <div className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your new username"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email ?? ''} disabled />
                </div>
                </CardContent>
                <CardFooter>
                <Button onClick={handleUpdateUsername} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                </CardFooter>
            </Card>
        </div>
    </Desktop>
  );
}
