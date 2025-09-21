// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./BlueCarbonCredit.sol";
import "./PlantationRegistry.sol";

contract BlueCarbonMRV is AccessControl, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant FIELD_OFFICER_ROLE = keccak256("FIELD_OFFICER_ROLE");

    BlueCarbonCredit public carbonCreditToken;
    PlantationRegistry public plantationRegistry;

    constructor(address _creditAddress, address _registryAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);

        carbonCreditToken = BlueCarbonCredit(_creditAddress);
        plantationRegistry = PlantationRegistry(_registryAddress);

        carbonCreditToken.grantRole(carbonCreditToken.MINTER_ROLE(), address(this));
        plantationRegistry.grantRole(plantationRegistry.VERIFIER_ROLE(), address(this));
    }

    // … keep all the Stakeholder, Monitoring, Marketplace logic here
    // (no need to redeploy subcontracts inside constructor anymore!)
}
