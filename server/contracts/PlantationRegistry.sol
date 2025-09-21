// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PlantationRegistry is ERC721, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    Counters.Counter private _tokenIdCounter;

    struct PlantationData {
        uint256 id;
        string location;
        uint256 area;
        string ecosystemType;
        uint256 plantationDate;
        address implementer;
        bool verified;
        string ipfsHash;
    }

    mapping(uint256 => PlantationData) public plantations;
    mapping(address => uint256[]) public implementerPlantations;
    mapping(uint256 => bool) private _plantationExists;

    event PlantationRegistered(uint256 indexed id, address indexed implementer, string location);
    event PlantationVerified(uint256 indexed id, address indexed verifier);

    constructor() ERC721("Blue Carbon Plantation", "BCP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    function registerPlantation(
        string memory location,
        uint256 area,
        string memory ecosystemType,
        string memory ipfsHash
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        plantations[tokenId] = PlantationData({
            id: tokenId,
            location: location,
            area: area,
            ecosystemType: ecosystemType,
            plantationDate: block.timestamp,
            implementer: msg.sender,
            verified: false,
            ipfsHash: ipfsHash
        });

        implementerPlantations[msg.sender].push(tokenId);
        _plantationExists[tokenId] = true;
        _mint(msg.sender, tokenId);

        emit PlantationRegistered(tokenId, msg.sender, location);
        return tokenId;
    }

    function verifyPlantation(uint256 tokenId) public onlyRole(VERIFIER_ROLE) {
        require(_plantationExists[tokenId], "Plantation does not exist");
        plantations[tokenId].verified = true;
        emit PlantationVerified(tokenId, msg.sender);
    }

    function getPlantation(uint256 tokenId) public view returns (PlantationData memory) {
        require(_plantationExists[tokenId], "Plantation does not exist");
        return plantations[tokenId];
    }

    function plantationExists(uint256 tokenId) public view returns (bool) {
        return _plantationExists[tokenId];
    }

    function getImplementerPlantations(address implementer) public view returns (uint256[] memory) {
        return implementerPlantations[implementer];
    }

    // ✅ Fix multiple inheritance: must explicitly override supportsInterface
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
