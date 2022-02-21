import styled from '@emotion/styled'
import { Box, Typography } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const TitleContainer=styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding:'0px 0px 15px 0px',
    width: '90vw',
    borderBottom: '1px solid rgba(255,255,255, .3)'
})

const TitleText=styled(Typography)({
    color: '#fff',
    fontFamily: 'TTNorms-Bold'
})

const Text=styled(Typography)({
    color: '#fff',
    fontFamily: 'TTNorms-Regular'
})

const SubMenu=styled(Box)({
    width: '100%',
    display: 'flex',
    marginTop: '10px',
    flexDirection: 'row',
    flexWrap: 'wrap'
})

const SubMenuItem=styled(Link)(({selected})=>({
    marginRight: '20px',
    marginTop: '10px',
    textDecoration: 'none',
    fontFamily: 'TTNorms-Regular',
    fontSize: '13px',
    color: '#fff',
    background: selected?'rgba(101, 54, 187, 1)':'rgba(101, 54, 187, .35)',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'center',
    padding: '5px 20px 5px 20px',
}))

const Title = () => {
    const [filter, setFilter] = useState('All')

    const changeStyle = (name) => {
        if (filter === name) {
            return true
        }
        return false
    }

    const names = ['All', 'Reservation Desk', 'Minting Press', 'Trading Post']

    return (
        <TitleContainer>
            <TitleText variant='h4'>Scoby Social</TitleText>
            <Text>Membership Directory</Text>
            <SubMenu>
                <SubMenuItem selected={changeStyle(names[0])} onClick={() => setFilter(names[0])} to={'/explorer'}>{names[0]}</SubMenuItem>
                <SubMenuItem selected={changeStyle(names[1])} onClick={() => setFilter(names[1])} to={'/explorer'}>{names[1]}</SubMenuItem>
                <SubMenuItem selected={changeStyle(names[2])} onClick={() => setFilter(names[2])} to={'/explorer'}>{names[2]}</SubMenuItem>
                <SubMenuItem selected={changeStyle(names[3])} onClick={() => setFilter(names[3])} to={'/explorer'}>{names[3]}</SubMenuItem>
            </SubMenu>
        </TitleContainer>
    )
}

export default Title