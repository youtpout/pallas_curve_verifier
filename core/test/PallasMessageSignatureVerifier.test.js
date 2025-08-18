const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { PublicKey, PrivateKey } = require("o1js");
const { Client } = require("mina-signer");
const { decodeVMStateBytesCompressed } = require("../utils/helper");

describe("PallasMessageSignatureVerifier", function () {
  async function deployVerifierFixture() {
    const [deployer] = await ethers.getSigners();
    const PallasSignatureVerifier = await ethers.getContractFactory(
      "PallasMessageSignatureVerifier"
    );
    const verifier = await PallasSignatureVerifier.deploy();
    await verifier.waitForDeployment();

    const TestGasContract = await ethers.getContractFactory(
      "GasVerifier"
    );
    const testGas = await TestGasContract.deploy();
    await testGas.waitForDeployment();

    return { verifier, deployer, testGas };
  }

  describe("Message Signature Verification", function () {
    async function deployAndSetupMessage() {
      const { verifier, testGas } = await loadFixture(deployVerifierFixture);

      // Setup mina-signer
      const client = new Client({ network: "mainnet" });

      // const keypair = client.genKeys();
      const keypair = {
        privateKey: "EKEEa7Kzjh5ttuSzyjWZF9NEtZrQpsC3taNwKfi8U1nud3MwKvNs",
        publicKey: "B62qj2vSpa1MEXNPZAkLdEzQdRS9iE8NhhRfpqLCAvW6QCPi8fxAYnM",
      };

      const message =
        "OHQBntWLxiMLLeRBIhBcEEvuzy6kEhhXaOVfN7TNvVUgupXZqeeoysxlrQ8zsn0KJ1sOcDQnUNYiZ2bsJgAVFaj3s4mp2O0R1232";

      // Get signed message
      const signedMessage = client.signMessage(message, keypair.privateKey);

      const altMessage =
        "Sign this message to prove you have access to this wallet. You will be logged in automatically at dashboard/";

      const altSignedMessage = client.signMessage(
        altMessage,
        keypair.privateKey
      );

      return {
        verifier,
        signedMessage,
        keypair,
        client,
        message,
        altMessage,
        altSignedMessage,
        testGas
      };
    }

    it("Should verify signature through all steps in case valid.", async function () {
      const { verifier, signedMessage, client, message, testGas } = await loadFixture(
        deployAndSetupMessage
      );

      // const signatureObject = Signature.fromBase58(signedMessage.signature);
      const s = BigInt(signedMessage.signature.scalar);
      const r = BigInt(signedMessage.signature.field);

      const signer = PublicKey.fromBase58(signedMessage.publicKey);
      const signerFull = signer.toGroup();

      const result = client.verifyMessage({
        data: signedMessage.data,
        publicKey: signedMessage.publicKey,
        signature: signedMessage.signature,
      });

      const vmId = 0;

      let txn;
      txn = await verifier.verifySignatureIsValid(
        { x: signerFull.x.toString(), y: signerFull.y.toString() },
        { r: r, s: s },
        message,
        true
      );

      expect(txn).to.equal(result);
      expect(txn).to.equal(true);

      // for gas test
      const addressVerifier = await verifier.getAddress();
      await testGas.verifyMessage(
        addressVerifier,
        { x: signerFull.x.toString(), y: signerFull.y.toString() },
        { r: r, s: s },
        message,
        true
      );
    });

    it("Should return isValid=false in case invalid data sent.", async function () {
      const { verifier, signedMessage, altSignedMessage, client } =
        await loadFixture(deployAndSetupMessage);

      /// 3 TEST CASES : signedMessage is our original object. altSignedMessage is our alternate object.
      ///   1. DIFFERENT SIGNATURE
      ///   2. DIFFERENT DATA
      ///   3. DIFFERENT PUBLIC KEY

      /// DIFFERENT SIGNATURE -------------------------------------------------
      let s = BigInt(altSignedMessage.signature.scalar);
      let r = BigInt(altSignedMessage.signature.field);

      let signer = PublicKey.fromBase58(signedMessage.publicKey);
      let signerFull = signer.toGroup();

      let result = client.verifyMessage({
        data: signedMessage.data,
        signature: altSignedMessage.signature,
        publicKey: signedMessage.publicKey,
      });

      let vmId = 0;

      let txn;
      txn = await verifier.verifySignatureIsValid(
        { x: signerFull.x.toString(), y: signerFull.y.toString() },
        { r: r, s: s },
        signedMessage.data,
        true
      );


      expect(txn).to.equal(false);
      expect(txn).to.equal(result);

      /// DIFFERENT DATA -------------------------------------------------
      s = BigInt(signedMessage.signature.scalar);
      r = BigInt(signedMessage.signature.field);

      signer = PublicKey.fromBase58(signedMessage.publicKey);
      signerFull = signer.toGroup();

      result = client.verifyMessage({
        data: altSignedMessage.data,
        signature: signedMessage.signature,
        publicKey: signedMessage.publicKey,
      });

      vmId = 1;

      txn;
      txn = await verifier.verifySignatureIsValid(
        { x: signerFull.x.toString(), y: signerFull.y.toString() },
        { r: r, s: s },
        altSignedMessage.data,
        true
      );

      expect(txn).to.equal(false);
      expect(txn).to.equal(result);

      /// DIFFERENT PUBLIC KEY -------------------------------------------------
      s = BigInt(signedMessage.signature.scalar);
      r = BigInt(signedMessage.signature.field);

      const randomPK = PrivateKey.random();
      const random = randomPK.toPublicKey();
      const randomFull = random.toGroup();

      result = client.verifyMessage({
        data: signedMessage.data,
        signature: signedMessage.signature,
        publicKey: random.toBase58(),
      });

      vmId = 2;

      txn;
      txn = await verifier.verifySignatureIsValid(
        { x: randomFull.x.toString(), y: randomFull.y.toString() },
        { r: r, s: s },
        signedMessage.data,
        true
      );

      expect(txn).to.equal(false);
      expect(txn).to.equal(result);
    });

    it("Should return isValid=false in case inverted network bool sent as parameter.", async function () {
      const { verifier, signedMessage } = await loadFixture(
        deployAndSetupMessage
      );

      /// Creating a testnet client.
      const altClient = new Client({ network: "testnet" });

      let s = BigInt(signedMessage.signature.scalar);
      let r = BigInt(signedMessage.signature.field);

      let signer = PublicKey.fromBase58(signedMessage.publicKey);
      let signerFull = signer.toGroup();

      /// The result will be false since the data was signed for mainnet.
      let result = altClient.verifyMessage({
        data: signedMessage.data,
        signature: signedMessage.signature,
        publicKey: signedMessage.publicKey,
      });

      let vmId = 0;

      let txn;
      /// Choosing testnet for the verification. Should return false finally.
      txn = await verifier.verifySignatureIsValid(
        { x: signerFull.x.toString(), y: signerFull.y.toString() },
        { r: r, s: s },
        signedMessage.data,
        false // testnet
      );

      expect(txn).to.equal(false);
      expect(txn).to.equal(result);
    });
  });
});
