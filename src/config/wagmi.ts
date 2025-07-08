import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'JusticeFund Exchange',
  projectId: 'demo-project-id', // Using demo project ID to avoid allowlist issues
  chains: [mainnet, polygon, optimism, arbitrum, sepolia],
  ssr: false,
})