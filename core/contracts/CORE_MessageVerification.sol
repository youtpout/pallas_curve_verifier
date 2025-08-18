// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./legacy/PoseidonLegacy.sol";

error InvalidPublicKey();
error StepSkipped();

/**
 * @title PallasMessageSignatureVerifier
 * @dev Verifies signatures over message generated using mina-signer.
 */

contract PallasMessageSignatureVerifier is PoseidonLegacy {
    /// @notice Identifier for the type of verification.
    uint8 constant TYPE_VERIFY_MESSAGE = 1;

    bool public valid = false;
    function testGasSignature(
        Point calldata publicKey,
        Signature calldata signature,
        string calldata message,
        bool network
    ) external {
        valid = verifySignatureIsValid(publicKey, signature, message, network);
    }

    /// @notice Validates if a point lies on the Pallas curve
    /// @dev Checks if the point coordinates satisfy the curve equation y² = x³ + 5
    /// @param point The point to validate with x and y coordinates
    /// @return bool True if the point lies on the curve, false otherwise
    function isValidPublicKey(Point memory point) public pure returns (bool) {
        if (point.x >= FIELD_MODULUS || point.y >= FIELD_MODULUS) {
            return false;
        }

        uint256 x2 = mulmod(point.x, point.x, FIELD_MODULUS);
        uint256 lhs = mulmod(point.y, point.y, FIELD_MODULUS);
        return
            lhs == addmod(mulmod(x2, point.x, FIELD_MODULUS), 5, FIELD_MODULUS);
    }

    /// @notice Zero step - Input assignment for message verification
    /// ==================================================
    /// Initializes the verification state for a message signature
    /// @param publicKey The public key point (x,y)
    /// @param signature Contains r (x-coordinate) and s (scalar)
    /// @param message The string message to verify
    /// @param network Network identifier (true for mainnet, false for testnet)
    function verifySignatureIsValid(
        Point calldata publicKey,
        Signature calldata signature,
        string calldata message,
        bool network
    ) public view returns (bool) {
        if (!isValidPublicKey(publicKey)) revert InvalidPublicKey();

        uint256 messageHashed = hashMessageLegacy(
            message,
            publicKey,
            signature.r,
            network ? "MinaSignatureMainnet" : "CodaSignature*******"
        );

        Point memory pointInGroup = _defaultToGroup(
            PointCompressed({x: publicKey.x, isOdd: (publicKey.y & 1 == 1)})
        );

        Point memory G = Point(G_X, G_Y);
        // Compute sG without storing it in the state
        Point memory sG = scalarMul(G, signature.s);

        Point memory ePk = scalarMul(pointInGroup, messageHashed);

        Point memory R = addPoints(sG, Point(ePk.x, FIELD_MODULUS - ePk.y));

        return (R.x == signature.r) && (R.y & 1 == 0);
    }

    /// @notice Converts a compressed point to its full curve point representation
    /// @dev Implements point decompression for Pallas curve (y² = x³ + 5)
    /// Process:
    /// 1. Calculate y² using curve equation
    /// 2. Find square root of y²
    /// 3. Choose correct y value based on oddness flag
    /// @param compressed The compressed point containing x-coordinate and oddness flag
    /// @return Point Complete point with both x and y coordinates
    function _defaultToGroup(
        PointCompressed memory compressed
    ) internal view returns (Point memory) {
        uint256 _x = compressed.x;

        uint256 x2 = mulmod(_x, _x, FIELD_MODULUS);
        uint256 y2 = addmod(mulmod(x2, _x, FIELD_MODULUS), BEQ, FIELD_MODULUS);

        uint256 _y = sqrtmod(y2, FIELD_MODULUS);

        if ((_y & 1 == 1) != compressed.isOdd) {
            _y = FIELD_MODULUS - _y;
        }

        return Point({x: _x, y: _y});
    }
}
