import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Cipherverse Fleet',
  projectId: '6fd5bcd0619287b873f9c2d4e9267bfa',
  chains: [sepolia],
  ssr: false,
});
