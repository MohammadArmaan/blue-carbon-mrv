# 🌊 Blue Carbon MRV System (Prototype)

[![Deploy to Vercel](https://vercel.com/button)](https://blue-carbon-mrv-project.vercel.app)

A **prototype Monitoring, Reporting & Verification (MRV) system** for Blue Carbon projects.  
It leverages **blockchain + web3** to ensure transparency in plantation tracking, verification, and carbon credit issuance.

> ⚠️ **Note:** This is a **prototype developed for Smart India Hackathon 2025**.  
> It is **not production-ready** and should not be used for real financial or environmental reporting.

---

## 🚀 Features

- **Plantation Registration**  
  Stakeholders (implementers) can register new plantations with details (location, ecosystem type, area, date).

- **Verification Workflow**  
  Admins/Verifiers can review pending plantations and either approve or reject them.  
  Upon approval, **carbon credits (ERC20 tokens)** are minted to the implementer.

- **Blockchain Integration**  
  All verification and token minting is handled via smart contracts for immutability and transparency.

- **User Wallet Connection**  
  Uses Web3 wallet (e.g., MetaMask) for authentication and transactions.

- **UI Components**  
  Built with **React, TailwindCSS, shadcn/ui**, and deployed on **Vercel**.

---

## 🏗️ Tech Stack

- **Frontend:** React (Vite), TailwindCSS, shadcn/ui  
- **Blockchain:** Solidity Smart Contracts (Plantation Registry, Carbon Credit Token)  
- **Web3 Integration:** ethers.js + custom `contractService`  
- **Deployment:** Vercel ([blue-carbon-mrv-project.vercel.app](https://blue-carbon-mrv-project.vercel.app))  

---


---

## 🔑 User Roles

- **Implementer (Plantation Owner):**  
  Registers new plantations for review.  

- **Verifier (Admin/NGO/Government):**  
  Reviews plantations and approves or rejects them.  
  On approval, carbon credits are automatically minted to the implementer.  

- **Buyer/Company (Future scope):**  
  Can purchase carbon credits from verified projects.

---

## 📜 Smart Contracts

- **PlantationRegistry.sol**  
  Stores plantation data and handles verification.  

- **CarbonCreditToken.sol (ERC20)**  
  Issues Blue Carbon Credits (BCC) to verified plantations.  

- **contractService.ts**  
  Frontend integration layer for contract read/write functions.  

---

## ⚠️ Disclaimer

This is a **prototype created for Smart India Hackathon 2025** and is **not audited**.  
Do not use for real-world carbon credit trading or financial transactions.  

---

## ✨ Future Improvements

- Tokenized plantations as NFTs for traceability  
- Marketplace for carbon credits  
- On-chain reporting & monitoring data  
- Enhanced verification workflows with multiple verifiers  
- Geo-tagged satellite/IoT integration for plantation validation  

