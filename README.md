# Sepolia to Sonic Bridge

A bridge implementation for transferring assets between Sepolia Testnet and Sonic Blaze Testnet.

## Architecture

````mermaid
graph LR
    subgraph "Ethereum Side"
        UA[User A]
        EL1[Sepolia L1]
        GE[Gateway Contract\non Ethereum]
        BH1[Block Height\nof Sonic]
        MH1[Merkle\nRoot Hash]
    end

    subgraph "Validators"
        V1[Validator]
        V2[Validator]
        V3[Validator]
        V4[Validator]
    end

    subgraph "Clients"
        SC[Sonic\nClients]
        EC[Ethereum\nClients]
    end

    subgraph "Sonic Side"
        UB[User B]
        SL1[Sonic L1]
        GS[Gateway Contract\non Sonic]
        BH2[Block Height\nof Ethereum]
        MH2[Merkle\nRoot Hash]
    end

    %% Flow for Ethereum to Sonic
    UA -->|sending ETH| EL1
    EL1 -->|generating proof| GE
    GE -->|submitting ETH| GS
    GS -->|submitting ETH| SL1
    SL1 -->|receiving ETH| UB

    %% Validator connections
    V1 & V2 & V3 & V4 ---|securing blockchain| GE & GS
    SC & EC --> V1 & V2 & V3 & V4

    %% Block heights and hashes
    BH1 --> EL1
    MH1 --> EL1
    BH2 --> SL1
    MH2 --> SL1

    classDef user fill:#90EE90,stroke:#000
    classDef chain fill:#87CEEB,stroke:#000
    classDef gateway fill:#D3D3D3,stroke:#000
    classDef validator fill:#FFB6C1,stroke:#000
    classDef client fill:#ADD8E6,stroke:#000
    classDef block fill:#F5F5F5,stroke:#000

    class UA,UB user
    class EL1,SL1 chain
    class GE,GS gateway
    class V1,V2,V3,V4 validator
    class SC,EC client
    class BH1,BH2,MH1,MH2 block
```

## Overview

This bridge allows users to transfer assets between Ethereum's Sepolia testnet and Sonic's Blaze testnet. The bridge supports:
- Native ETH transfers
- Wrapped ETH (wETH)
- USDC (Coming soon)
- EURC (Coming soon)
- USDT (Coming soon)

## How It Works

1. **Deposit Flow (Sepolia → Sonic)**
   - User deposits ETH on Sepolia
   - Bridge contract locks the assets
   - Proof is generated and validated
   - Equivalent assets are minted on Sonic
   - Process takes approximately 10 minutes

2. **Withdrawal Flow (Sonic → Sepolia)**
   - User initiates withdrawal on Sonic
   - Bridge contract burns the assets
   - Proof is generated and validated
   - Original assets are released on Sepolia
   - Process takes approximately 1 hour

## Technical Components

### Smart Contracts
- Bridge Contract (Sepolia): `0x9Ef7629F9B930168b76283AdD7120777b3c895b3`
- Bridge Contract (Sonic): `0x9EF7629F9B930168b76283AdD7120777b3c895b3`
- Token Pairs Contract: `0x134E4c207aD5A13549DE1eBF8D43c1f49b00ba94`
- State Oracle: `0x836664B0c0CB29B7877bCcF94159CC996528F2C3`

### Network Details
- Sepolia Testnet
  - RPC URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR-KEY`
  - Chain ID: 11155111

- Sonic Blaze Testnet
  - RPC URL: `https://rpc.blaze.soniclabs.com`
  - Chain ID: 57054

## Setup and Usage

1. **Install Dependencies**
```bash
npm install
````

2. **Configure Environment**
   Create a `.env` file:

```env
ETHEREUM_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
SONIC_RPC=https://rpc.blaze.soniclabs.com
PRIVATE_KEY=your_private_key_without_0x_prefix
```

3. **Run Bridge Script**

```bash
node scripts/bridge.js
```

## Security Considerations

- Private keys should never be shared or committed to version control
- Always test with small amounts first
- Ensure sufficient gas on both networks
- Wait for confirmations before considering transactions final
- Monitor transaction status on both networks

## Development

### Prerequisites

- Node.js v14+
- npm or yarn
- An Ethereum wallet with Sepolia ETH
- Access to Alchemy or Infura API

## Acknowledgments

- Sonic Labs for their bridge implementation
- Ethereum community for the testnet infrastructure
- All contributors to this project
