import Title from "../components/home/title"
import Filters from "../components/home/filters"
import Users from "../components/Card/Users"
import { CardsData } from '../constants/mockupData/userData'
import { Box } from '@mui/material'
import styled from "@emotion/styled";

const Main=styled(Box)({
    display:'flex',
    alignItems:'center',
    width: '100vw',
    minHeight:'90vh',
    flexDirection:'column'
})

const HomePage=()=>{
    return(
        <Main>
            <Title/>
            <Filters/>
            <Users users={CardsData}/>
        </Main>
    )
}

export default HomePage