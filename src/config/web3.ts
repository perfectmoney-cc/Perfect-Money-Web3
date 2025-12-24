import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, bscTestnet } from 'wagmi/chains';
import { http } from 'wagmi';

// WalletConnect Project ID
const projectId = '88a829f94229e32fb1a0d91a24cbb7cf';

// Infura API Key
const infuraApiKey = 'fa259a35d86740c692c60261ab4b0cdb';

export const config = getDefaultConfig({
  appName: 'PerfectMoney',
  projectId,
  chains: [bsc, bscTestnet],
  transports: {
    [bsc.id]: http(`https://bsc-mainnet.infura.io/v3/${infuraApiKey}`),
    [bscTestnet.id]: http(`https://bsc-testnet.infura.io/v3/${infuraApiKey}`),
  },
  ssr: false,
});
