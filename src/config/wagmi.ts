import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'JusticeFund Exchange',
  projectId: '2f05a7cac472ced85b0dfd95c1fd02ae', // Temporary project ID for development
  chains: [mainnet, polygon, optimism, arbitrum, sepolia],
  ssr: false,
})