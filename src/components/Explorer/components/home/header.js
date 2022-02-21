import { useState, useMemo, useEffect, useContext } from 'react';
import { UserContext } from '../../containers/userContext';
import { useWallet } from '@solana/wallet-adapter-react';
import Logo from '../../assets/images/logo.png'
import { styled, TextField, InputAdornment, Box, Alert, Collapse, IconButton  } from '@mui/material'
import { Search } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Avatar } from '@mui/material';
import {
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import CloseIcon from '@mui/icons-material/Close';
import { useMutation } from '@apollo/client';
import { VERIFY_PUBLIC_KEY } from '../../graphql/mutation/PublicKey';

const SearchBar = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    width: "300px",
    height: "35px",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    "& fieldset": {
      background: "#6536BB",
      opacity: 0.35,
      color: "#fff",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
  },
});

const HeaderContainer = styled(Box)({
  display: 'flex',
  width: '100vw',
  height: '10vh',
  alignItems: 'center',
  justifyContent: 'space-around',
  flexWrap: 'wrap'
})

const LogoContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'row'
})

const LogoImg = styled(Box)({
  height: '63px',
  width: '63px'
})

const LogoText = styled(Box)({
  alignSelf: 'flex-end',
  color: '#fff',
  fontFamily: 'TTNorms-Regular'
})

const Menu = styled(Box)({
  display: 'flex',
  marginTop: '10px',
  marginBottom: '10px',
  width: '30vw',
  justifyContent: 'space-between',
  alignItems: 'center',
})

const MenuLink = styled(Link)({
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  fontFamily: 'TTNorms-Bold'
})

const Wallet = styled(WalletMultiButton)({
  marginLeft: '10px',
  height: '30px',
  background: 'linear-gradient(90deg,#D858BC 0.5% 1%, #3C00FF80 60% 99%)',
  borderRadius: '8px'
})

const Container = styled(Box)(({error})=>({
  display: 'flex',
  width: '100vw',
  alignItems: 'center',
  flexDirection:'column',
  marginTop:'10px 0 0 0',
}))

const Header = () => {
  const [errorMatch, setError]=useState(false)
  const { publicKey } = useWallet()
  const {setUser}=useContext(UserContext)

  const [setVerifyPublicKey, { data: { verifyPublicKey } = { verifyPublicKey: {} } }] = useMutation(VERIFY_PUBLIC_KEY, {
    onCompleted({verifyPublicKey}) {
      setUser(verifyPublicKey)
      setError(false)
    },
    onError(e) {
      if (publicKey) {
        setError(true)
      }
    }
  })

  const user = useMemo(() => verifyPublicKey, [verifyPublicKey])

  useEffect(() => {
    setVerifyPublicKey({
      variables: {
        publicKey: publicKey
      }
    })
  }, [publicKey, setVerifyPublicKey])

  return (
    <Container error={errorMatch}>
      <HeaderContainer>
        <LogoContainer>
          <LogoImg component={'img'} src={Logo} alt='' />
          <LogoText>Invest in friends.</LogoText>
        </LogoContainer>
        <SearchBar
          placeholder='Search collections and tokens'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Search sx={{ color: '#fff' }} />
              </InputAdornment>)
          }}
        />
        <Menu>
          <MenuLink to={'/explorer'} >Resources</MenuLink>
          <MenuLink to={'/explorer'} >Scoby Academy</MenuLink>
          <Avatar
            sx={{ height: '50px', width: '50px' }}
            alt='Profile Image'
            src={user?.avatar || null}
          />
          <Wallet>Wallet</Wallet>
        </Menu>
      </HeaderContainer>
      <Collapse in={errorMatch}>
        <Alert
          severity="warning"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setError(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ background: 'linear-gradient(270deg, rgba(16, 14, 89, 0) 0%, #100E59 48.71%, rgba(16, 14, 89, 0) 93.14%)', color: '#fff' }}
        >
          I'm sorry, we couldn't find a Scoby Social profile that matches with your wallet. Please connect a wallet that matches with a Scoby Social profile.
        </Alert>
      </Collapse>
    </Container>
  )
}

export default Header