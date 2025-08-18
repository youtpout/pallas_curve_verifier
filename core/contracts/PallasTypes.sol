// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PallasTypes
 * @dev Common types used in Pallas operations
 */
contract PallasTypes {
    /// @title Point Structure
    /// @notice Represents a point on an elliptic curve with x and y coordinates
    /// @dev Used for public key and signature operations
    struct Point {
        uint256 x;
        uint256 y;
    }

    /// @title Compressed Point Structure
    /// @notice Represents a compressed form of an elliptic curve point
    /// @dev Uses x-coordinate and a boolean flag instead of full coordinates
    struct PointCompressed {
        uint256 x;
        bool isOdd;
    }

    /// @title Digital Signature Structure
    /// @notice Represents a digital signature with its components
    /// @dev Used for cryptographic signature verification
    struct Signature {
        uint256 r;
        uint256 s;
    }

    /// @title Projective Point Structure
    /// @notice Represents a point in projective coordinates
    /// @dev Used for efficient elliptic curve operations
    struct ProjectivePoint {
        uint256 x;
        uint256 y;
        uint256 z;
    }
}
