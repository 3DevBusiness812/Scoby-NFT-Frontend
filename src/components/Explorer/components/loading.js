import Logo from '../assets/images/logo.png'
import { TailSpin } from 'react-loader-spinner'
import styled from '@emotion/styled'
import { Box } from '@mui/material'

const LoadingContainer=styled(Box)({
    display: 'flex',
    width: '100vw',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
})

const Loading=()=>{
    return(
        <LoadingContainer>
            <img src={Logo} height={'100px'} width={'100px'} style={{marginBottom:20}} alt=''/>
            <TailSpin color='#4A2098' height={40} width={40}/>
        </LoadingContainer>
    )
}

export default Loading