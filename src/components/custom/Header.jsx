import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useNavigation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import axios from 'axios';
import { FcGoogle } from "react-icons/fc";
import { toast } from 'sonner';
import NotificationBell from './NotificationBell';
import { BellIcon } from 'lucide-react';

function Header() {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const handleUserUpdate = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener('user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);

    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    }
  });

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'Application/json'
      }
    }).then((resp) => {
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
      window.location.reload();
    })
      .catch((error) => {
        console.error('Profile fetch error:', error);
        toast.error('Failed to load user profile');
      });
  };

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-5'>
      <a href='/'>
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent cursor-pointer"
          aria-label='Home'
        >
          <div className="w-[160px] md:w-[180px] h-auto aspect-[1750/398]"> {/* 4.44:1 ratio */}
            <img
              src='/logo.svg'
              className="w-full h-full object-contain"
              alt="Cypress Logo"
            />
          </div>
        </Button>
      </a>
      <div>
        {user ?
          <div className='flex items-center gap-2 sm:gap-3 flex-wrap justify-end'>
            <NotificationBell />
            <a href='/create-report'>
              <Button variant="outline"
                className='rounded-full cursor-pointer'>+ Create Report</Button>
            </a>
            <a href='/my-reports'>
              <Button variant="outline"
                className='rounded-full cursor-pointer'>My Reports</Button>
            </a>
            <Popover>
              <PopoverTrigger aria-label='User profile menu'>
                <img
                  src={user?.picture}
                  className='h-[35px] w-[35px] rounded-full cursor-pointer'
                  alt={`${user?.name}'s profile`}
                />
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1.5"> {/* Reduced overall popover padding */}
                <div className='flex flex-col'>
                  <div className='px-3 py-2 border-b'>
                    <p className='text-sm font-medium text-gray-700 truncate'>{user?.name}</p>
                    <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
                  </div>
                  <a href='/' className="block w-full">
                    <div
                      className="cursor-pointer px-3 py-2 text-md font-medium hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => {
                        googleLogout();
                        localStorage.clear();
                        window.location.href = '/';
                      }}
                    >
                      Log Out
                    </div>
                  </a>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          :
          <Button
            onClick={() => setOpenDialog(true)}
            aria-label='Sign in'
          >
            Sign In
          </Button>
        }
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" />
              <h2 className='font-bold text-lg mt-7'>Sign In With Google</h2>
              <p>Securely sign in to Cypress with Google authentication</p>
              <Button
                onClick={login}
                className='w-full mt-5 flex gap-4 items-center'>
                <FcGoogle className='h-7 w-7' />
                Sign in with Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Header