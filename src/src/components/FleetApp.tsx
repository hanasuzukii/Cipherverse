import { useMemo, useState } from 'react';
import { Contract } from 'ethers';
import { useAccount, useReadContract } from 'wagmi';

import { Header } from './Header';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';

import '../styles/FleetApp.css';

type FleetTab = 'hangar' | 'battle';

export function FleetApp() {
  const { address, isConnected } = useAccount();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [activeTab, setActiveTab] = useState<FleetTab>('hangar');
  const [minting, setMinting] = useState(false);
  const [mintMessage, setMintMessage] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [decryptedPower, setDecryptedPower] = useState<number | null>(null);
  const [decryptingPower, setDecryptingPower] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState<boolean | null>(null);
  const [decryptingResult, setDecryptingResult] = useState(false);
  const [defenseInput, setDefenseInput] = useState('');
  const [attacking, setAttacking] = useState(false);
  const [attackError, setAttackError] = useState<string | null>(null);
  const [lastAttackTx, setLastAttackTx] = useState<string | null>(null);

  const {
    data: shipIdData,
    refetch: refetchShip,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'shipOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const shipId = typeof shipIdData === 'bigint' ? shipIdData : 0n;
  const hasShip = shipId !== 0n;

  const {
    data: attackPowerData,
    refetch: refetchPower,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAttackPower',
    args: hasShip ? [shipId] : undefined,
    query: {
      enabled: hasShip,
    },
  });

  const encryptedPower = typeof attackPowerData === 'string' ? attackPowerData : undefined;

  const {
    data: lastAttackData,
    refetch: refetchAttackResult,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getLastAttackResult',
    args: hasShip ? [shipId] : undefined,
    query: {
      enabled: hasShip,
    },
  });

  const encryptedResult = typeof lastAttackData === 'string' ? lastAttackData : undefined;

  const { data: totalSupplyData, refetch: refetchSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
  });

  const totalSupply = typeof totalSupplyData === 'bigint' ? totalSupplyData : 0n;

  const zamaStatusMessage = useMemo(() => {
    if (zamaLoading) {
      return 'Initializing Zama FHE relayer...';
    }
    if (zamaError) {
      return zamaError;
    }
    return 'Relayer ready for encrypted operations';
  }, [zamaLoading, zamaError]);

  const requireSigner = async () => {
    if (!signerPromise) {
      throw new Error('Connect your wallet to continue');
    }
    const signer = await signerPromise;
    if (!signer) {
      throw new Error('Wallet signer unavailable');
    }
    return signer;
  };

  const requireInstance = () => {
    if (!instance) {
      throw new Error('Encryption service not ready yet');
    }
    return instance;
  };

  const handleMintShip = async () => {
    try {
      setMintError(null);
      setMintMessage(null);
      setMinting(true);

      const signer = await requireSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.mintShip();
      setMintMessage(`Waiting for confirmation: ${tx.hash}`);

      const receipt = await tx.wait();
      if (receipt?.status !== 1) {
        throw new Error('Mint transaction reverted');
      }

      setMintMessage('Spaceship successfully minted!');
      setDecryptedPower(null);
      setDecryptedResult(null);
      await refetchShip();
      if (refetchPower) {
        await refetchPower();
      }
      if (refetchAttackResult) {
        await refetchAttackResult();
      }
      if (refetchSupply) {
        await refetchSupply();
      }
    } catch (error) {
      setMintError(error instanceof Error ? error.message : 'Failed to mint spaceship');
    } finally {
      setMinting(false);
    }
  };

  const handleDecryptPower = async () => {
    if (!address || !hasShip || !encryptedPower) {
      return;
    }

    try {
      setDecryptingPower(true);
      const zama = requireInstance();
      const keypair = zama.generateKeypair();
      const handles = [
        {
          handle: encryptedPower,
          contractAddress: CONTRACT_ADDRESS,
        },
      ];

      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = zama.createEIP712(keypair.publicKey, contractAddresses, startTimestamp, durationDays);
      const signer = await requireSigner();
      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      const result = await zama.userDecrypt(
        handles,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimestamp,
        durationDays,
      );

      const plainValue = result[encryptedPower];
      if (!plainValue) {
        throw new Error('Decryption result missing');
      }

      setDecryptedPower(Number(plainValue));
    } catch (error) {
      setMintError(error instanceof Error ? error.message : 'Failed to decrypt attack power');
    } finally {
      setDecryptingPower(false);
    }
  };

  const handleLaunchAttack = async () => {
    if (!address || !hasShip) {
      setAttackError('Mint your spaceship before launching an attack');
      return;
    }

    const defenseValue = Number.parseInt(defenseInput, 10);
    if (!Number.isInteger(defenseValue) || defenseValue < 0) {
      setAttackError('Defense value must be a non-negative integer');
      return;
    }

    try {
      setAttackError(null);
      setLastAttackTx(null);
      setAttacking(true);
      const zama = requireInstance();
      const signer = await requireSigner();

      const encryptedDefense = await zama
        .createEncryptedInput(CONTRACT_ADDRESS, address)
        .add32(defenseValue)
        .encrypt();

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.launchAttack(shipId, encryptedDefense.handles[0], encryptedDefense.inputProof);
      setLastAttackTx(tx.hash);

      const receipt = await tx.wait();
      if (receipt?.status !== 1) {
        throw new Error('Attack transaction reverted');
      }

      setDefenseInput('');
      setLastAttackTx(null);
      setDecryptedResult(null);
      if (refetchAttackResult) {
        await refetchAttackResult();
      }
    } catch (error) {
      setAttackError(error instanceof Error ? error.message : 'Failed to launch attack');
    } finally {
      setAttacking(false);
    }
  };

  const handleDecryptLastResult = async () => {
    if (!address || !hasShip || !encryptedResult) {
      return;
    }

    try {
      setDecryptingResult(true);
      const zama = requireInstance();
      const keypair = zama.generateKeypair();
      const handles = [
        {
          handle: encryptedResult,
          contractAddress: CONTRACT_ADDRESS,
        },
      ];

      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = zama.createEIP712(keypair.publicKey, contractAddresses, startTimestamp, durationDays);
      const signer = await requireSigner();
      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      const result = await zama.userDecrypt(
        handles,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimestamp,
        durationDays,
      );

      const plainValue = result[encryptedResult];
      if (!plainValue) {
        throw new Error('Could not decrypt last attack result');
      }

      setDecryptedResult(plainValue === '1');
    } catch (error) {
      setAttackError(error instanceof Error ? error.message : 'Failed to decrypt result');
    } finally {
      setDecryptingResult(false);
    }
  };

  return (
    <div className="fleet-app">
      <Header />
      <main className="fleet-main">
        <section className="status-grid">
          <div className="status-card">
            <span className="status-label">Pilot Status</span>
            <span className="status-value">{isConnected ? 'Connected' : 'Wallet disconnected'}</span>
            <span className="status-helper">{address ?? 'Connect a wallet to begin'}</span>
          </div>
          <div className="status-card">
            <span className="status-label">Spaceship</span>
            <span className="status-value">{hasShip ? `Token #${shipId}` : 'No ship minted'}</span>
            <span className="status-helper">Fleet supply: {totalSupply.toString()}</span>
          </div>
          <div className="status-card">
            <span className="status-label">Attack Power (encrypted)</span>
            <span className="encrypted-value">{encryptedPower ?? '0x00'}</span>
            <button
              className="secondary-button"
              onClick={handleDecryptPower}
              disabled={!hasShip || decryptingPower || !instance || !isConnected}
            >
              {decryptingPower ? 'Decrypting...' : decryptedPower !== null ? `Decrypted: ${decryptedPower}` : 'Decrypt power'}
            </button>
          </div>
          <div className="status-card">
            <span className="status-label">Last Attack Result</span>
            <span className="encrypted-value">{encryptedResult ?? 'No attacks yet'}</span>
            <button
              className="secondary-button"
              onClick={handleDecryptLastResult}
              disabled={!hasShip || decryptingResult || !instance || !isConnected}
            >
              {decryptingResult ? 'Decrypting...' : decryptedResult === null ? 'Decrypt result' : decryptedResult ? 'Success' : 'Failed'}
            </button>
          </div>
        </section>

        <div className="zama-status">{zamaStatusMessage}</div>

        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'hangar' ? 'active' : ''}`}
            onClick={() => setActiveTab('hangar')}
          >
            Hangar
          </button>
          <button
            className={`tab-button ${activeTab === 'battle' ? 'active' : ''}`}
            onClick={() => setActiveTab('battle')}
          >
            Battle Simulator
          </button>
        </div>

        {activeTab === 'hangar' ? (
          <section className="panel">
            <h2 className="panel-title">Hangar</h2>
            <p className="panel-description">
              Mint a Cipherverse spaceship. Each pilot can own exactly one ship with an encrypted attack power of 100.
            </p>
            <button
              className="primary-button"
              onClick={handleMintShip}
              disabled={minting || !isConnected || hasShip}
            >
              {hasShip ? 'Spaceship minted' : minting ? 'Minting...' : 'Mint my spaceship'}
            </button>
            {mintMessage && <p className="success-message">{mintMessage}</p>}
            {mintError && <p className="error-message">{mintError}</p>}
          </section>
        ) : (
          <section className="panel">
            <h2 className="panel-title">Battle Simulator</h2>
            <p className="panel-description">
              Submit an encrypted defense value to test your ship. Results remain encrypted until you choose to decrypt them.
            </p>
            <div className="form-grid">
              <label className="form-label" htmlFor="defense-input">
                Defense value
              </label>
              <input
                id="defense-input"
                type="number"
                min="0"
                placeholder="Enter defense rating"
                value={defenseInput}
                onChange={(event) => setDefenseInput(event.target.value)}
                className="form-input"
              />
              <button
                className="primary-button"
                onClick={handleLaunchAttack}
                disabled={!hasShip || !isConnected || attacking || !defenseInput}
              >
                {attacking ? 'Engaging...' : 'Launch attack'}
              </button>
            </div>
            {lastAttackTx && (
              <p className="info-message">Broadcasting attack transaction: {lastAttackTx}</p>
            )}
            {attackError && <p className="error-message">{attackError}</p>}
            <div className="panel-note">
              <p>
                Tip: enter a defense value below 100 to guarantee success, or above 100 to simulate a resistance check.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
