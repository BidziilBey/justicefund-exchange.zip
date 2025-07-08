import { ethers } from 'ethers'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { ContractConfig, TransactionStatus } from '../types'

// Contract ABI (simplified for demo)
const SETTLEMENT_CONTRACT_ABI = [
  "function createSettlement(address defendant, uint256 amount, string caseNumber, string description) external returns (uint256)",
  "function depositFunds(uint256 settlementId) external payable",
  "function releaseFunds(uint256 settlementId) external",
  "function getSettlement(uint256 settlementId) external view returns (tuple(uint256 id, address plaintiff, address defendant, uint256 amount, uint8 status, string caseNumber, string description, uint256 createdAt, uint256 updatedAt, bool fundsDeposited, bool fundsReleased))",
  "function getUserSettlements(address user) external view returns (uint256[])",
  "function addDocument(uint256 settlementId, string documentHash) external",
  "function verifyParticipant(address participant, string kycHash) external",
  "event SettlementCreated(uint256 indexed settlementId, address indexed plaintiff, address indexed defendant, uint256 amount, string caseNumber)",
  "event FundsDeposited(uint256 indexed settlementId, address indexed depositor, uint256 amount)",
  "event FundsReleased(uint256 indexed settlementId, address indexed recipient, uint256 amount)"
]

class BlockchainService {
  private contractConfig: ContractConfig
  private provider: ethers.Provider | null = null
  private signer: ethers.Signer | null = null

  constructor(contractConfig: ContractConfig) {
    this.contractConfig = contractConfig
  }

  async initialize(provider: any, signer: any) {
    this.provider = provider
    this.signer = signer
  }

  private getContract(withSigner: boolean = false): ethers.Contract {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    const providerOrSigner = withSigner ? this.signer : this.provider
    if (withSigner && !this.signer) {
      throw new Error('Signer not available')
    }

    return new ethers.Contract(
      this.contractConfig.address,
      SETTLEMENT_CONTRACT_ABI,
      providerOrSigner
    )
  }

  async createSettlement(
    defendant: string,
    amount: string,
    caseNumber: string,
    description: string
  ): Promise<TransactionStatus> {
    try {
      const contract = this.getContract(true)
      const amountWei = ethers.parseEther(amount)
      
      const tx = await contract.createSettlement(
        defendant,
        amountWei,
        caseNumber,
        description,
        {
          gasLimit: this.contractConfig.gasLimit
        }
      )

      return {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0
      }
    } catch (error) {
      throw new Error(`Failed to create settlement: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async depositFunds(settlementId: string, amount: string): Promise<TransactionStatus> {
    try {
      const contract = this.getContract(true)
      const amountWei = ethers.parseEther(amount)
      
      const tx = await contract.depositFunds(settlementId, {
        value: amountWei,
        gasLimit: this.contractConfig.gasLimit
      })

      return {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0
      }
    } catch (error) {
      throw new Error(`Failed to deposit funds: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async releaseFunds(settlementId: string): Promise<TransactionStatus> {
    try {
      const contract = this.getContract(true)
      
      const tx = await contract.releaseFunds(settlementId, {
        gasLimit: this.contractConfig.gasLimit
      })

      return {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0
      }
    } catch (error) {
      throw new Error(`Failed to release funds: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getSettlement(settlementId: string): Promise<any> {
    try {
      const contract = this.getContract(false)
      const settlement = await contract.getSettlement(settlementId)
      
      return {
        id: settlement.id.toString(),
        plaintiff: settlement.plaintiff,
        defendant: settlement.defendant,
        amount: ethers.formatEther(settlement.amount),
        status: settlement.status,
        caseNumber: settlement.caseNumber,
        description: settlement.description,
        createdAt: new Date(Number(settlement.createdAt) * 1000).toISOString(),
        updatedAt: new Date(Number(settlement.updatedAt) * 1000).toISOString(),
        fundsDeposited: settlement.fundsDeposited,
        fundsReleased: settlement.fundsReleased
      }
    } catch (error) {
      throw new Error(`Failed to get settlement: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getUserSettlements(userAddress: string): Promise<string[]> {
    try {
      const contract = this.getContract(false)
      const settlementIds = await contract.getUserSettlements(userAddress)
      return settlementIds.map((id: any) => id.toString())
    } catch (error) {
      throw new Error(`Failed to get user settlements: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async addDocument(settlementId: string, documentHash: string): Promise<TransactionStatus> {
    try {
      const contract = this.getContract(true)
      
      const tx = await contract.addDocument(settlementId, documentHash, {
        gasLimit: this.contractConfig.gasLimit
      })

      return {
        hash: tx.hash,
        status: 'pending',
        confirmations: 0
      }
    } catch (error) {
      throw new Error(`Failed to add document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async waitForTransaction(txHash: string): Promise<TransactionStatus> {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    try {
      const receipt = await this.provider.waitForTransaction(txHash)
      
      if (!receipt) {
        throw new Error('Transaction receipt not found')
      }

      return {
        hash: txHash,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        confirmations: receipt.confirmations || 0,
        gasUsed: receipt.gasUsed?.toString(),
        effectiveGasPrice: receipt.gasPrice?.toString(),
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Failed to wait for transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async estimateGas(method: string, params: any[]): Promise<string> {
    try {
      const contract = this.getContract(true)
      const gasEstimate = await contract[method].estimateGas(...params)
      return gasEstimate.toString()
    } catch (error) {
      throw new Error(`Failed to estimate gas: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    if (!this.provider) {
      throw new Error('Provider not initialized')
    }

    try {
      const tx = await this.provider.getTransaction(txHash)
      const receipt = await this.provider.getTransactionReceipt(txHash)

      if (!tx) {
        throw new Error('Transaction not found')
      }

      let status: TransactionStatus['status'] = 'pending'
      if (receipt) {
        status = receipt.status === 1 ? 'confirmed' : 'failed'
      }

      return {
        hash: txHash,
        status,
        confirmations: receipt?.confirmations || 0,
        gasUsed: receipt?.gasUsed?.toString(),
        effectiveGasPrice: receipt?.gasPrice?.toString(),
        blockNumber: receipt?.blockNumber,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Failed to get transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Contract configuration
const contractConfig: ContractConfig = {
  address: process.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  abi: SETTLEMENT_CONTRACT_ABI,
  network: process.env.VITE_NETWORK || 'sepolia',
  gasLimit: 500000
}

export const blockchainService = new BlockchainService(contractConfig)
export default blockchainService