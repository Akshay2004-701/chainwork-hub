
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x398f4e01c4D56962a41A5bB242bC1479a646ab6D';
const CHAIN_ID = 57054;

const ABI = [
  "function createTask(string memory _description, uint256 _deadline) external payable",
  "function getTask(uint256 _taskId) external view returns (uint256 id, address taskProvider, string memory description, uint256 bounty, bool isCompleted, bool isCancelled, address[] memory selectedFreelancers, uint256 deadline)",
  "function submitWork(uint256 _taskId, string memory _submissionLink) external",
  "function getSubmissions(uint256 _taskId) external view returns (tuple(address freelancer, string submissionLink, bool isApproved)[] memory)",
  "function approveSubmission(uint256 _taskId, address[] memory _selectedFreelancers) external",
  "function cancelTask(uint256 _taskId) external",
  "function getCounter() external view returns (uint256)",
  "event TaskCreated(uint256 taskId, address indexed taskProvider, uint256 bounty, uint256 deadline)",
  "event SubmissionAdded(uint256 taskId, address indexed freelancer)",
  "event TaskCompleted(uint256 taskId, address[] selectedFreelancers, uint256 bounty)"
];

export const getContract = async () => {
  if (!window.ethereum) throw new Error("No crypto wallet found");

  await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  return contract;
};

export const switchToSonicChain = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${CHAIN_ID.toString(16)}`,
            chainName: 'Sonic Blaze Testnet',
            nativeCurrency: {
              name: 'SONIC',
              symbol: 'SONIC',
              decimals: 18,
            },
            rpcUrls: ['https://testnet.sonicchain.com/rpc'],
            blockExplorerUrls: ['https://testnet-explorer.sonicchain.com'],
          },
        ],
      });
    }
  }
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatAmount = (amount: bigint) => {
  return ethers.formatEther(amount);
};
