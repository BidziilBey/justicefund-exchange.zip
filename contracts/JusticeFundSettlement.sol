// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title JusticeFundSettlement
 * @dev Smart contract for managing legal settlements on the blockchain
 * @author JusticeFund Team
 */
contract JusticeFundSettlement is ReentrancyGuard, Ownable, Pausable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _settlementIds;
    
    enum SettlementStatus {
        Pending,
        Approved,
        Completed,
        Disputed,
        Cancelled
    }
    
    struct Settlement {
        uint256 id;
        address plaintiff;
        address defendant;
        uint256 amount;
        SettlementStatus status;
        string caseNumber;
        string description;
        uint256 createdAt;
        uint256 updatedAt;
        bool fundsDeposited;
        bool fundsReleased;
        string[] documentHashes;
    }
    
    struct Participant {
        bool isVerified;
        bool isActive;
        uint256 kycTimestamp;
        string kycHash;
    }
    
    // Mappings
    mapping(uint256 => Settlement) public settlements;
    mapping(address => Participant) public participants;
    mapping(address => uint256[]) public userSettlements;
    mapping(string => bool) public usedCaseNumbers;
    
    // Events
    event SettlementCreated(
        uint256 indexed settlementId,
        address indexed plaintiff,
        address indexed defendant,
        uint256 amount,
        string caseNumber
    );
    
    event SettlementStatusUpdated(
        uint256 indexed settlementId,
        SettlementStatus oldStatus,
        SettlementStatus newStatus
    );
    
    event FundsDeposited(
        uint256 indexed settlementId,
        address indexed depositor,
        uint256 amount
    );
    
    event FundsReleased(
        uint256 indexed settlementId,
        address indexed recipient,
        uint256 amount
    );
    
    event ParticipantVerified(
        address indexed participant,
        uint256 timestamp
    );
    
    event DocumentAdded(
        uint256 indexed settlementId,
        string documentHash
    );
    
    // Modifiers
    modifier onlyVerified() {
        require(participants[msg.sender].isVerified, "Participant not verified");
        require(participants[msg.sender].isActive, "Participant not active");
        _;
    }
    
    modifier onlySettlementParty(uint256 _settlementId) {
        Settlement memory settlement = settlements[_settlementId];
        require(
            msg.sender == settlement.plaintiff || 
            msg.sender == settlement.defendant || 
            msg.sender == owner(),
            "Not authorized for this settlement"
        );
        _;
    }
    
    modifier settlementExists(uint256 _settlementId) {
        require(_settlementId > 0 && _settlementId <= _settlementIds.current(), "Settlement does not exist");
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor() {}
    
    /**
     * @dev Verify a participant's KYC
     * @param _participant Address of the participant
     * @param _kycHash Hash of the KYC documents
     */
    function verifyParticipant(address _participant, string memory _kycHash) 
        external 
        onlyOwner 
    {
        participants[_participant] = Participant({
            isVerified: true,
            isActive: true,
            kycTimestamp: block.timestamp,
            kycHash: _kycHash
        });
        
        emit ParticipantVerified(_participant, block.timestamp);
    }
    
    /**
     * @dev Create a new settlement
     * @param _defendant Address of the defendant
     * @param _amount Settlement amount in wei
     * @param _caseNumber Unique case number
     * @param _description Description of the settlement
     */
    function createSettlement(
        address _defendant,
        uint256 _amount,
        string memory _caseNumber,
        string memory _description
    ) 
        external 
        onlyVerified 
        whenNotPaused 
        returns (uint256) 
    {
        require(_defendant != address(0), "Invalid defendant address");
        require(_defendant != msg.sender, "Plaintiff and defendant cannot be the same");
        require(_amount > 0, "Settlement amount must be greater than 0");
        require(bytes(_caseNumber).length > 0, "Case number cannot be empty");
        require(!usedCaseNumbers[_caseNumber], "Case number already used");
        require(participants[_defendant].isVerified, "Defendant not verified");
        
        _settlementIds.increment();
        uint256 newSettlementId = _settlementIds.current();
        
        settlements[newSettlementId] = Settlement({
            id: newSettlementId,
            plaintiff: msg.sender,
            defendant: _defendant,
            amount: _amount,
            status: SettlementStatus.Pending,
            caseNumber: _caseNumber,
            description: _description,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            fundsDeposited: false,
            fundsReleased: false,
            documentHashes: new string[](0)
        });
        
        userSettlements[msg.sender].push(newSettlementId);
        userSettlements[_defendant].push(newSettlementId);
        usedCaseNumbers[_caseNumber] = true;
        
        emit SettlementCreated(newSettlementId, msg.sender, _defendant, _amount, _caseNumber);
        
        return newSettlementId;
    }
    
    /**
     * @dev Update settlement status
     * @param _settlementId ID of the settlement
     * @param _newStatus New status
     */
    function updateSettlementStatus(uint256 _settlementId, SettlementStatus _newStatus)
        external
        onlyOwner
        settlementExists(_settlementId)
        whenNotPaused
    {
        Settlement storage settlement = settlements[_settlementId];
        SettlementStatus oldStatus = settlement.status;
        
        require(oldStatus != _newStatus, "Status is already set to this value");
        require(oldStatus != SettlementStatus.Completed, "Cannot update completed settlement");
        require(oldStatus != SettlementStatus.Cancelled, "Cannot update cancelled settlement");
        
        settlement.status = _newStatus;
        settlement.updatedAt = block.timestamp;
        
        emit SettlementStatusUpdated(_settlementId, oldStatus, _newStatus);
    }
    
    /**
     * @dev Deposit funds for a settlement
     * @param _settlementId ID of the settlement
     */
    function depositFunds(uint256 _settlementId)
        external
        payable
        settlementExists(_settlementId)
        onlySettlementParty(_settlementId)
        whenNotPaused
        nonReentrant
    {
        Settlement storage settlement = settlements[_settlementId];
        
        require(settlement.status == SettlementStatus.Approved, "Settlement must be approved");
        require(!settlement.fundsDeposited, "Funds already deposited");
        require(msg.value == settlement.amount, "Incorrect deposit amount");
        
        settlement.fundsDeposited = true;
        settlement.updatedAt = block.timestamp;
        
        emit FundsDeposited(_settlementId, msg.sender, msg.value);
    }
    
    /**
     * @dev Release funds to the plaintiff
     * @param _settlementId ID of the settlement
     */
    function releaseFunds(uint256 _settlementId)
        external
        onlyOwner
        settlementExists(_settlementId)
        whenNotPaused
        nonReentrant
    {
        Settlement storage settlement = settlements[_settlementId];
        
        require(settlement.status == SettlementStatus.Approved, "Settlement must be approved");
        require(settlement.fundsDeposited, "Funds not deposited");
        require(!settlement.fundsReleased, "Funds already released");
        
        settlement.fundsReleased = true;
        settlement.status = SettlementStatus.Completed;
        settlement.updatedAt = block.timestamp;
        
        uint256 amount = settlement.amount;
        address payable plaintiff = payable(settlement.plaintiff);
        
        (bool success, ) = plaintiff.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(_settlementId, plaintiff, amount);
        emit SettlementStatusUpdated(_settlementId, SettlementStatus.Approved, SettlementStatus.Completed);
    }
    
    /**
     * @dev Add a document hash to a settlement
     * @param _settlementId ID of the settlement
     * @param _documentHash Hash of the document
     */
    function addDocument(uint256 _settlementId, string memory _documentHash)
        external
        onlySettlementParty(_settlementId)
        settlementExists(_settlementId)
        whenNotPaused
    {
        require(bytes(_documentHash).length > 0, "Document hash cannot be empty");
        
        settlements[_settlementId].documentHashes.push(_documentHash);
        settlements[_settlementId].updatedAt = block.timestamp;
        
        emit DocumentAdded(_settlementId, _documentHash);
    }
    
    /**
     * @dev Get settlement details
     * @param _settlementId ID of the settlement
     */
    function getSettlement(uint256 _settlementId)
        external
        view
        settlementExists(_settlementId)
        returns (Settlement memory)
    {
        return settlements[_settlementId];
    }
    
    /**
     * @dev Get user's settlements
     * @param _user Address of the user
     */
    function getUserSettlements(address _user)
        external
        view
        returns (uint256[] memory)
    {
        return userSettlements[_user];
    }
    
    /**
     * @dev Get total number of settlements
     */
    function getTotalSettlements() external view returns (uint256) {
        return _settlementIds.current();
    }
    
    /**
     * @dev Get document hashes for a settlement
     * @param _settlementId ID of the settlement
     */
    function getSettlementDocuments(uint256 _settlementId)
        external
        view
        settlementExists(_settlementId)
        returns (string[] memory)
    {
        return settlements[_settlementId].documentHashes;
    }
    
    /**
     * @dev Deactivate a participant
     * @param _participant Address of the participant
     */
    function deactivateParticipant(address _participant) external onlyOwner {
        participants[_participant].isActive = false;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}