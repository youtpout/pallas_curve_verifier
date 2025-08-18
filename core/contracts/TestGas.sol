// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PallasTypes.sol";

interface IFieldVerifier {
    function verifySignatureIsValid(
        PallasTypes.Point calldata publicKey,
        PallasTypes.Signature calldata signature,
        uint256[] calldata fields
    ) external view returns (bool);
}

interface IMessageVerifier {
    function verifySignatureIsValid(
        PallasTypes.Point calldata publicKey,
        PallasTypes.Signature calldata signature,
        string calldata message,
        bool network
    ) external view returns (bool);
}

contract GasVerifier {
    bool public validMessage = false;
    function verifyMessage(
        address messageVerifier,
        PallasTypes.Point calldata publicKey,
        PallasTypes.Signature calldata signature,
        string calldata message,
        bool network
    ) external {
        validMessage = IMessageVerifier(messageVerifier).verifySignatureIsValid(
            publicKey,
            signature,
            message,
            network
        );
    }

    bool public validField = false;
    function verifyField(
        address fieldVerifier,
        PallasTypes.Point calldata publicKey,
        PallasTypes.Signature calldata signature,
        uint256[] calldata fields
    ) external {
        validField = IFieldVerifier(fieldVerifier).verifySignatureIsValid(
            publicKey,
            signature,
            fields
        );
    }
}
