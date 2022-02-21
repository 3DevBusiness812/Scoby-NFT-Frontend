import React, { useMemo, lazy, Suspense } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getPhantomWallet,
  getLedgerWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import MainRoute from './routes/route'
import { ThemeProvider } from '@mui/system';
import { DefaultTheme } from './styles/Theme';
import { CssBaseline } from '@mui/material';
import { Box} from '@mui/material'
import background from './assets/images/background.png'
import styled from '@emotion/styled'
import UserProvider from './containers/userContext';
import Loading from './components/loading';
import {SCOBY_LINK} from './config/env'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
import Header from './components/home/header';

const client = new ApolloClient({
  uri: SCOBY_LINK,
  cache: new InMemoryCache()
});

const Home=lazy(()=>import("./screens/home"))

require('@solana/wallet-adapter-react-ui/styles.css');

const Main = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  minHeight: '100vh',
  alignItems: 'center',
  background: `url(${background}) no-repeat`,
  backgroundSize: 'cover'
})

const Explorer = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
 

  const wallets = useMemo(() => [
    getPhantomWallet(),
    getLedgerWallet(),
    getSlopeWallet(),
    getSolflareWallet(),
    getSolletExtensionWallet(),
    getSolletWallet(),
  ], [network]);

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={DefaultTheme}>
        <CssBaseline />
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <UserProvider>
                <Main>
                  <Header/>
                  <Suspense fallback={<Loading/>}>
                    <Home/>
                  </Suspense>
                </Main>
              </UserProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export default Explorer