
import { useEffect, useState } from 'react';
import { switchToElectroneum } from '@/lib/contract';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WalletConnect = () => {
  const [address, setAddress] = useState<string>('');
  const { toast } = useToast();

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

      await switchToElectroneum();
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAddress(accounts[0]);
      toast({
        title: "Wallet connected",
        description: "Successfully connected to Electroneum testnet",
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    setAddress('');
    localStorage.removeItem('walletAddress');
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          await switchToElectroneum();
        }
      }
    };
    checkConnection();
  }, []);

  return (
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
  );
};
