const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { Signature, PrivateKey, PublicKey } = require("o1js");
const { Client } = require("mina-signer");

const { decodeVFStateBytesCompressed } = require("../utils/helper");

describe("PallasFieldsSignatureVerifier", function () {
  async function deployVerifierFixture() {
    const [deployer] = await ethers.getSigners();
    const PallasSignatureVerifier = await ethers.getContractFactory(
      "PallasFieldsSignatureVerifier"
    );
    const verifier = await PallasSignatureVerifier.deploy();
    return { verifier, deployer };
  }

  describe("Fields Signature Verification", function () {
    async function deployAndSetupFields() {
      const { verifier } = await loadFixture(deployVerifierFixture);

      // Setup mina-signer
      const client = new Client({ network: "testnet" });

      // const keypair = client.genKeys();
      const keypair = {
        privateKey: "EKEEa7Kzjh5ttuSzyjWZF9NEtZrQpsC3taNwKfi8U1nud3MwKvNs",
        publicKey: "B62qj2vSpa1MEXNPZAkLdEzQdRS9iE8NhhRfpqLCAvW6QCPi8fxAYnM",
      };

      const fields = [
        115792089237316195423570985008687907853269984665640564039457584007913129639935n, // MAX
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
      ];

      const signedFields = client.signFields(fields, keypair.privateKey);

      const altFields = [
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999999999999999999999999999999n,
        998899999999999999999999999998n,
      ];
      const altSignedFields = client.signFields(altFields, keypair.privateKey);

      const twoFields = [3412n, 548748548n]

      const twoSignedFields = client.signFields(twoFields, keypair.privateKey);

      return { verifier, signedFields, altSignedFields, twoSignedFields, keypair, client };
    }

    it("Should return isValid=false in case invalid.", async function () {
      const { verifier, signedFields, altSignedFields, client } =
        await loadFixture(deployAndSetupFields);

      /// 3 TEST CASES : signedFields is our original object.
      ///   1. DIFFERENT SIGNATURE
      ///   2. DIFFERENT DATA
      ///   3. DIFFERENT PUBLIC KEY

      /// DIFFERENT SIGNATURE -------------------------------------------------
      let signatureObject = Signature.fromBase58(altSignedFields.signature);
      let s = signatureObject.s.toBigInt();
      let r = signatureObject.r.toBigInt();

      let signer = PublicKey.fromBase58(signedFields.publicKey);
      let signerFull = signer.toGroup();

      let result = client.verifyFields({
        data: signedFields.data,
        signature: altSignedFields.signature,
        publicKey: signedFields.publicKey,
      });

      const verification0 = await verifier.verifySignatureIsValid(
        { x: signerFull.x.toString(), y: signerFull.y.toString() },
        { r: r, s: s },
        signedFields.data,
      );

      expect(verification0).to.equal(false);
      expect(verification0).to.equal(result);

      /// DIFFERENT DATA -------------------------------------------------
      signatureObject = Signature.fromBase58(signedFields.signature);
      s = signatureObject.s.toBigInt();
      r = signatureObject.r.toBigInt();

      signer = PublicKey.fromBase58(signedFields.publicKey);
      signerFull = signer.toGroup();

      result = client.verifyFields({
        data: altSignedFields.data,
        signature: signedFields.signature,
        publicKey: signedFields.publicKey,
      });

      const verification1 = await verifier.verifySignatureIsValid(
        { x: signerFull.x.toString(), y: signerFull.y.toString() },
        { r: r, s: s },
        altSignedFields.data,
      );

      expect(verification1).to.equal(false);
      expect(verification1).to.equal(result);

      /// DIFFERENT PUBLIC KEY -------------------------------------------------
      signatureObject = Signature.fromBase58(signedFields.signature);
      s = signatureObject.s.toBigInt();
      r = signatureObject.r.toBigInt();

      const randomPK = PrivateKey.random();
      const random = randomPK.toPublicKey();
      const randomFull = random.toGroup();

      result = client.verifyFields({
        data: signedFields.data,
        signature: signedFields.signature,
        publicKey: random.toBase58(),
      });

      const verification2 = await verifier.verifySignatureIsValid(
        { x: randomFull.x.toString(), y: randomFull.y.toString() },
        { r: r, s: s },
        signedFields.data,
      );
      expect(verification2).to.equal(false);
      expect(verification2).to.equal(result);
    });

    it("Should verify signature in 1 step", async function () {
      const { verifier, signedFields, client } = await loadFixture(
        deployAndSetupFields
      );

      const signatureObject = Signature.fromBase58(signedFields.signature);
      const s = signatureObject.s.toBigInt();
      const r = signatureObject.r.toBigInt();

      const signer = PublicKey.fromBase58(signedFields.publicKey);
      const signerFull = signer.toGroup();

      const paramVerify = {
        data: signedFields.data,
        signature: signedFields.signature,
        publicKey: signedFields.publicKey,
      };

      // Start verification 
      const verification = await verifier.verifySignatureIsValid(
        { x: signerFull.x.toString(), y: signerFull.y.toString() },
        { r: r, s: s },
        signedFields.data
      );

      const signatureGas =
        await verifier.testGasSignature(
          { x: signerFull.x.toString(), y: signerFull.y.toString() },
          { r: r, s: s },
          signedFields.data
        );
      await signatureGas.wait();

      const result = client.verifyFields(paramVerify);

      expect(verification).to.equal(result);
      expect(verification).to.equal(true);
    });

    it("Should verify 2 fiedls", async function () {
      const { verifier, twoSignedFields, client } = await loadFixture(
        deployAndSetupFields
      );

      const signatureObject = Signature.fromBase58(twoSignedFields.signature);
      const s = signatureObject.s.toBigInt();
      const r = signatureObject.r.toBigInt();

      const signer = PublicKey.fromBase58(twoSignedFields.publicKey);
      const signerFull = signer.toGroup();

      const paramVerify = {
        data: twoSignedFields.data,
        signature: twoSignedFields.signature,
        publicKey: twoSignedFields.publicKey,
      };

      // Start verification 
      const verification = await verifier.verifySignatureIsValid(
        { x: signerFull.x.toString(), y: signerFull.y.toString() },
        { r: r, s: s },
        [3412n, 548748548n]
      );

      const signatureGas =
        await verifier.testGasSignature(
          { x: signerFull.x.toString(), y: signerFull.y.toString() },
          { r: r, s: s },
          twoSignedFields.data
        );
      await signatureGas.wait();

      const result = client.verifyFields(paramVerify);

      expect(verification).to.equal(result);
      expect(verification).to.equal(true);
    });
  });

});
