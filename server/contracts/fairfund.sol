// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title FairFund
 * @dev A transparent aid distribution system for small farmers (Farmer-initiated model)
 */
contract FairFund {
    address public owner;
    uint256 public totalFundsDistributed;
    uint256 public totalBeneficiaries;
    uint256 public totalDonors;

    struct Donor {
        string name;
        string description;
        uint256 totalDonated;
        uint256 successfulDisbursements;
        bool isVerified;
        uint256 reputationScore;
    }

    struct Farmer {
        string name;
        string location;
        string farmType;
        bool isVerified;
        uint256 totalReceived;
        uint256 lastDisbursementDate;
    }

    struct AidRequest {
        uint256 id;
        address farmer;
        string name;
        string purpose;
        uint256 amountRequested;
        uint256 amountFunded;
        uint256 timestamp;
        bool fulfilled;
    }

    mapping(address => Donor) public donors;
    mapping(address => Farmer) public farmers;
    mapping(address => bool) public registeredDonors;
    mapping(address => bool) public registeredFarmers;

    address[] public donorAddresses;
    address[] public farmerAddresses;

    AidRequest[] public aidRequests;

    event DonorRegistered(address indexed donorAddress, string name);
    event FarmerRegistered(address indexed farmerAddress, string name, string location);
    event AidRequested(uint256 indexed requestId, address indexed farmer, string name, string purpose, uint256 amount);
    event AidFunded(uint256 indexed requestId, address indexed donor, address indexed farmer, uint256 amount);
    event DonorVerified(address indexed donorAddress);
    event FarmerVerified(address indexed farmerAddress);
    event ReputationUpdated(address indexed donorAddress, uint256 newScore);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyRegisteredDonor() {
        require(registeredDonors[msg.sender], "Only registered donors can call this function");
        _;
    }

    modifier onlyRegisteredFarmer() {
        require(registeredFarmers[msg.sender], "Only registered farmers can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerDonor(string memory _name, string memory _description) external {
        require(!registeredDonors[msg.sender], "Donor already registered");

        donors[msg.sender] = Donor({
            name: _name,
            description: _description,
            totalDonated: 0,
            successfulDisbursements: 0,
            isVerified: false,
            reputationScore: 50
        });

        registeredDonors[msg.sender] = true;
        donorAddresses.push(msg.sender);
        totalDonors++;

        emit DonorRegistered(msg.sender, _name);
    }

    function registerFarmer(string memory _name, string memory _location, string memory _farmType) external {
        require(!registeredFarmers[msg.sender], "Farmer already registered");

        farmers[msg.sender] = Farmer({
            name: _name,
            location: _location,
            farmType: _farmType,
            isVerified: false,
            totalReceived: 0,
            lastDisbursementDate: 0
        });

        registeredFarmers[msg.sender] = true;
        farmerAddresses.push(msg.sender);
        totalBeneficiaries++;

        emit FarmerRegistered(msg.sender, _name, _location);
    }

    function verifyDonor(address _donorAddress) external onlyOwner {
        require(registeredDonors[_donorAddress], "Donor not registered");
        donors[_donorAddress].isVerified = true;
        emit DonorVerified(_donorAddress);
    }

    function verifyFarmer(address _farmerAddress) external onlyOwner {
        require(registeredFarmers[_farmerAddress], "Farmer not registered");
        farmers[_farmerAddress].isVerified = true;
        emit FarmerVerified(_farmerAddress);
    }

    function requestAid(string memory _name, string memory _purpose, uint256 _amountRequested) external onlyRegisteredFarmer {
        require(_amountRequested > 0, "Requested amount must be greater than zero");

        aidRequests.push(AidRequest({
            id: aidRequests.length,
            farmer: msg.sender,
            name: _name,
            purpose: _purpose,
            amountRequested: _amountRequested,
            amountFunded: 0,
            timestamp: block.timestamp,
            fulfilled: false
        }));

        emit AidRequested(aidRequests.length - 1, msg.sender, _name, _purpose, _amountRequested);
    }

    function fundAidRequest(uint256 _requestId) external payable onlyRegisteredDonor {
        require(_requestId < aidRequests.length, "Invalid request ID");
        AidRequest storage request = aidRequests[_requestId];
        require(!request.fulfilled, "Aid request already fulfilled");
        require(msg.value > 0, "Must send ETH to fund");

        request.amountFunded += msg.value;
        if (request.amountFunded >= request.amountRequested) {
            request.fulfilled = true;
        }

        farmers[request.farmer].totalReceived += msg.value;
        farmers[request.farmer].lastDisbursementDate = block.timestamp;

        donors[msg.sender].totalDonated += msg.value;
        donors[msg.sender].successfulDisbursements++;

        totalFundsDistributed += msg.value;

        updateDonorReputation(msg.sender);

        emit AidFunded(_requestId, msg.sender, request.farmer, msg.value);

        (bool success, ) = payable(request.farmer).call{value: msg.value}("");
        require(success, "Transfer failed");
    }

    function updateDonorReputation(address _donorAddress) internal {
        Donor storage donor = donors[_donorAddress];
        if (donor.totalDonated == 0) return;

        uint256 successRate = (donor.successfulDisbursements * 100) / (donor.successfulDisbursements + 1);
        uint256 timeFactor = 5;

        donor.reputationScore = (successRate * 80 + timeFactor * 20) / 100;

        if (donor.reputationScore > 100) {
            donor.reputationScore = 100;
        }

        emit ReputationUpdated(_donorAddress, donor.reputationScore);
    }

    function getAllAidRequests() external view returns (
        uint256[] memory ids,
        address[] memory farmerAddressesList,
        string[] memory requestNames,
        string[] memory purposes,
        uint256[] memory amountsRequested,
        uint256[] memory amountsFunded,
        uint256[] memory timestamps,
        bool[] memory fulfilledStatuses
    ) {
        uint256 length = aidRequests.length;

        ids = new uint256[](length);
        farmerAddressesList = new address[](length);
        requestNames = new string[](length);
        purposes = new string[](length);
        amountsRequested = new uint256[](length);
        amountsFunded = new uint256[](length);
        timestamps = new uint256[](length);
        fulfilledStatuses = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            AidRequest storage a = aidRequests[i];
            ids[i] = a.id;
            farmerAddressesList[i] = a.farmer;
            requestNames[i] = a.name;
            purposes[i] = a.purpose;
            amountsRequested[i] = a.amountRequested;
            amountsFunded[i] = a.amountFunded;
            timestamps[i] = a.timestamp;
            fulfilledStatuses[i] = a.fulfilled;
        }
    }

    function getAllFarmers() external view returns (
        address[] memory addresses,
        string[] memory names,
        string[] memory locations,
        string[] memory farmTypes,
        bool[] memory isVerified,
        uint256[] memory totalReceived
    ) {
        uint256 length = farmerAddresses.length;

        addresses = new address[](length);
        names = new string[](length);
        locations = new string[](length);
        farmTypes = new string[](length);
        isVerified = new bool[](length);
        totalReceived = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address farmerAddr = farmerAddresses[i];
            Farmer storage f = farmers[farmerAddr];

            addresses[i] = farmerAddr;
            names[i] = f.name;
            locations[i] = f.location;
            farmTypes[i] = f.farmType;
            isVerified[i] = f.isVerified;
            totalReceived[i] = f.totalReceived;
        }
    }

    function getAllDonors() external view returns (
        address[] memory addresses,
        string[] memory names,
        string[] memory descriptions,
        bool[] memory isVerified,
        uint256[] memory totalDonated,
        uint256[] memory successfulDisbursements,
        uint256[] memory reputationScores
    ) {
        uint256 length = donorAddresses.length;

        addresses = new address[](length);
        names = new string[](length);
        descriptions = new string[](length);
        isVerified = new bool[](length);
        totalDonated = new uint256[](length);
        successfulDisbursements = new uint256[](length);
        reputationScores = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address donorAddr = donorAddresses[i];
            Donor storage d = donors[donorAddr];

            addresses[i] = donorAddr;
            names[i] = d.name;
            descriptions[i] = d.description;
            isVerified[i] = d.isVerified;
            totalDonated[i] = d.totalDonated;
            successfulDisbursements[i] = d.successfulDisbursements;
            reputationScores[i] = d.reputationScore;
        }
    }

    function getDonorStats(address _donorAddress) external view returns (
        string memory name,
        string memory description,
        uint256 totalDonated,
        uint256 successfulDisbursements,
        bool isVerified,
        uint256 reputationScore
    ) {
        Donor storage d = donors[_donorAddress];
        return (
            d.name,
            d.description,
            d.totalDonated,
            d.successfulDisbursements,
            d.isVerified,
            d.reputationScore
        );
    }

    function getFarmerStats(address _farmerAddress) external view returns (
        string memory name,
        string memory location,
        string memory farmType,
        bool isVerified,
        uint256 totalReceived,
        uint256 lastDisbursementDate
    ) {
        Farmer storage f = farmers[_farmerAddress];
        return (
            f.name,
            f.location,
            f.farmType,
            f.isVerified,
            f.totalReceived,
            f.lastDisbursementDate
        );
    }

    function getContractStats() external view returns (
        uint256 _totalDonors,
        uint256 _totalBeneficiaries,
        uint256 _totalFundsDistributed
    ) {
        return (totalDonors, totalBeneficiaries, totalFundsDistributed);
    }

    function isDonorRegistered(address _address) public view returns (bool) {
        return registeredDonors[_address];
    }

    function isFarmerRegistered(address _address) public view returns (bool) {
        return registeredFarmers[_address];
    }
}
