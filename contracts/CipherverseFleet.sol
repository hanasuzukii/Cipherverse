// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title CipherverseFleet
/// @notice FHE-enabled NFT fleet where each pilot mints a spaceship with encrypted attack power.
contract CipherverseFleet is SepoliaConfig {
    struct Ship {
        euint32 attackPower;
        ebool lastAttackSuccess;
    }

    uint256 private _nextTokenId = 1;

    mapping(uint256 => Ship) private _ships;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(address => uint256) private _ownedToken;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event AttackLaunched(address indexed pilot, uint256 indexed tokenId, ebool success);

    error AlreadyMinted();
    error NonexistentToken();
    error NotTokenOwner();

    /// @notice Returns the owner of a specific spaceship.
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) {
            revert NonexistentToken();
        }
        return owner;
    }

    /// @notice Returns the number of spaceships owned by an address.
    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Invalid owner");
        return _balances[owner];
    }

    /// @notice Returns the spaceship token id owned by a pilot. Returns 0 if none.
    function shipOf(address pilot) external view returns (uint256) {
        return _ownedToken[pilot];
    }

    /// @notice Mints a spaceship NFT with encrypted attack power of 100.
    function mintShip() external returns (uint256) {
        if (_ownedToken[msg.sender] != 0) {
            revert AlreadyMinted();
        }

        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = msg.sender;
        _balances[msg.sender] += 1;
        _ownedToken[msg.sender] = tokenId;

        euint32 initialPower = FHE.asEuint32(100);
        ebool initialStatus = FHE.asEbool(false);

        _ships[tokenId] = Ship({attackPower: initialPower, lastAttackSuccess: initialStatus});

        FHE.allowThis(initialPower);
        FHE.allow(initialPower, msg.sender);
        FHE.allowThis(initialStatus);
        FHE.allow(initialStatus, msg.sender);

        emit Transfer(address(0), msg.sender, tokenId);
        return tokenId;
    }

    /// @notice Retrieves the encrypted attack power of a spaceship.
    function getAttackPower(uint256 tokenId) external view returns (euint32) {
        if (_owners[tokenId] == address(0)) {
            revert NonexistentToken();
        }
        return _ships[tokenId].attackPower;
    }

    /// @notice Retrieves the encrypted result of the last attack for a spaceship.
    function getLastAttackResult(uint256 tokenId) external view returns (ebool) {
        if (_owners[tokenId] == address(0)) {
            revert NonexistentToken();
        }
        return _ships[tokenId].lastAttackSuccess;
    }

    /// @notice Launches an attack using the caller's spaceship against an encrypted defense value.
    /// @param tokenId The spaceship token id owned by the caller.
    /// @param enemyDefense The encrypted defense value provided by the caller.
    /// @param inputProof Proof associated with the encrypted input.
    function launchAttack(uint256 tokenId, externalEuint32 enemyDefense, bytes calldata inputProof) external returns (ebool) {
        address pilot = ownerOf(tokenId);
        if (pilot != msg.sender) {
            revert NotTokenOwner();
        }

        euint32 defense = FHE.fromExternal(enemyDefense, inputProof);
        euint32 power = _ships[tokenId].attackPower;

        ebool success = FHE.ge(power, defense);
        _ships[tokenId].lastAttackSuccess = success;

        FHE.allowThis(success);
        FHE.allow(success, msg.sender);

        emit AttackLaunched(msg.sender, tokenId, success);
        return success;
    }

    /// @notice Returns the total minted spaceship supply.
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
