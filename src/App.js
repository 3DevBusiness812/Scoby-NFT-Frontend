import React, { useMemo, useState } from "react";
import Hero from "./components/Hero";
import ChooseWallet from "./components/ChooseWallet";
import { Route, Routes } from "react-router-dom";
import Marketplace from "./components/MarketPlace/Marketplace";
import "./App.scss";
import SingleCollection from "./components/MarketPlace/Content/SingleCollection/SingleCollection";
import './bootstrap.min.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import Mint from './components/Mint/pages/mint';
import Explorer from './components/Explorer';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import {
  getPhantomWallet,
} from '@solana/wallet-adapter-wallets';


function App() {
  const [connectWallet, setConnectWallet] = useState(false);
  const [chosenWallet, setChosenWallet] = useState(null);

  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [getPhantomWallet()], []);


  const GetChosenWallet = (wallet) => {
    console.log(wallet);
    setChosenWallet(wallet);
  };
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="App">
            <Routes>
              <Route
                path="/"
                exact
                element={
                  <Hero
                    setConnectWallet={setConnectWallet}
                    chosenWallet={chosenWallet}
                  />
                }
              />
              <Route path="/marketplace/*" exact element={<Marketplace />} />
              <Route path="/mint" exact element={<Mint />} />
              <Route path="/explorer" exact element={<Explorer />} />
              {/* <Route path="/marketplace/collection/:collectionID" exact element={<SingleCollection />} /> */}
            </Routes>
            {connectWallet && (
              <ChooseWallet
                setConnectWallet={setConnectWallet}
                GetChosenWallet={GetChosenWallet}
              />
            )}
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
