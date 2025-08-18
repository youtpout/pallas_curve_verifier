// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./kimchi/Poseidon.sol";

error InvalidPublicKey();

/**
 * @title PallasFieldsSignatureVerifier
 * @dev Verifies signatures over fields generated using mina-signer.
 */

contract PallasFieldsSignatureVerifier is Poseidon {
    /// @notice Identifier for the type of verification.
    uint8 constant TYPE_VERIFY_FIELDS = 2;

    bool public valid = false;
    function testGasSignature(
        Point calldata publicKey,
        Signature calldata signature,
        uint256[] calldata fields
    ) external {
        valid = verifySignatureIsValid(publicKey, signature, fields);
    }

    /// @notice Check the signature is valid for the given fields and public key
    /// @dev Matches the behavior of verify() from o1js
    /// @return bool True if the signature is valid, false otherwise
    function verifySignatureIsValid(
        Point calldata publicKey,
        Signature calldata signature,
        uint256[] calldata fields
    ) public view returns (bool) {
        if (!isValidPublicKey(publicKey)) revert InvalidPublicKey();

        uint256 message = hashMessage(fields, publicKey, signature.r);

        Point memory pointInGroup = _defaultToGroup(
            PointCompressed({x: publicKey.x, isOdd: (publicKey.y & 1 == 1)})
        );

        Point memory G = Point(G_X, G_Y);
        // Compute sG without storing it in the state
        Point memory sG = scalarMul(G, signature.s);

        Point memory ePk = scalarMul(pointInGroup, message);

        Point memory R = addPoints(sG, Point(ePk.x, FIELD_MODULUS - ePk.y));

        return (R.x == signature.r) && (R.y & 1 == 0);
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

    /// @notice Converts a string to its character array representation and computes its Poseidon hash
    /// @dev Matches the behavior of CircuitString.from(str).hash() from o1js
    /// Process:
    /// 1. Converts string to fixed-length character array
    /// 2. Pads array with zeros if needed
    /// 3. Computes Poseidon hash of the array
    /// @param str The input string to convert and hash
    /// @return uint256[] Array of character values, padded to DEFAULT_STRING_LENGTH
    /// @return uint256 Poseidon hash of the character array
    function fromStringToHash(
        string memory str
    ) public view returns (uint256[] memory, uint256) {
        bytes memory strBytes = bytes(str);
        require(
            strBytes.length <= DEFAULT_STRING_LENGTH,
            "CircuitString.fromString: input string exceeds max length!"
        );

        uint256[] memory charValues = new uint256[](DEFAULT_STRING_LENGTH);

        // Convert string characters to their numeric values
        for (uint i = 0; i < strBytes.length; i++) {
            charValues[i] = uint256(uint8(strBytes[i]));
        }
        // Pad remaining slots with zeros
        for (uint i = strBytes.length; i < DEFAULT_STRING_LENGTH; i++) {
            charValues[i] = 0;
        }

        uint256 charHash = poseidonHash(charValues);
        return (charValues, charHash);
    }

    /// @notice Converts a compressed point to its full curve point representation
    /// @dev Implements point decompression for Pallas curve (y² = x³ + 5)
    /// Process:
    /// 1. Keep x-coordinate from compressed point
    /// 2. Calculate y² using curve equation (y² = x³ + 5)
    /// 3. Compute square root to get y value
    /// 4. Choose correct y value based on oddness flag
    /// @param compressed The compressed point containing x-coordinate and oddness flag
    /// @return Point Complete point with both x and y coordinates on Pallas curve
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
