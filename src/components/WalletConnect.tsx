
import { useEffect, useState } from 'react';
import { switchToElectroneum } from '@/lib/contract';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

export const WalletConnect = () => {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const { toast } = useToast();

  const getBalance = async (address: string) => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    }
    return '0';
  };

  const updateBalance = async (address: string) => {
    const balance = await getBalance(address);
    setBalance(balance);
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask to use ChainWork",
          variant: "destructive",
        });
        return;
      }

      // First switch to Electroneum network
      await switchToElectroneum();
      
      // Force MetaMask to show the account selection modal every time
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      
      // After permission is granted, get the selected account
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      setAddress(accounts[0]);
      await updateBalance(accounts[0]);
      
      toast({
        title: "Wallet connected",
        description: "Successfully connected to Sonic Blaze testnet",
      });
    } catch (error: any) {
      // If user rejected the connection or closed MetaMask
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    setAddress('');
    setBalance('');
    localStorage.removeItem('walletAddress');
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(newAccounts[0]);
          await updateBalance(newAccounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        // Reload the page when chain changes
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  // Update balance periodically if connected
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (address) {
      intervalId = setInterval(() => {
        updateBalance(address);
      }, 10000); // Update every 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [address]);

  return (
    <div className="flex items-center gap-4">
      {address && (
        <div className="text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
          {parseFloat(balance).toFixed(4)} S
        </div>
      )}
      <Button
        onClick={address ? disconnectWallet : connectWallet}
        className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full"
      >
        {address ? (
          <>
            <LogOut className="w-4 h-4 mr-2" />
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    </div>
  );
};
