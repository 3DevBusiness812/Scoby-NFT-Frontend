import { useState } from "react"
import { Link } from "react-router-dom"
import Ring from '../../assets/images/Ring.png'
import Trace from '../../assets/images/Trace.png'
import Crown from '../../assets/images/Crown.png'
import DropDown from "../../components/home/DropDown"
import styled from "@emotion/styled"
import { Box } from "@mui/material"

const FilterContainer=styled(Box)({
    display: 'flex',
    width: '90vw',
    paddingLeft: '30px',
    justifyContent: 'space-between'
})

const FilterByName=styled(Box)({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '50%',
    marginTop: '10px',
})

const FilterByNameItem=styled(Link)(({selected})=>({
    marginRight: '20px',
    marginTop: '5px',
    textDecoration: 'none',
    fontFamily: 'TTNorms-Regular',
    fontSize: '13px',
    color: '#fff',
    background: selected? 'rgba(101, 54, 187, 1)':'rgba(101, 54, 187, .35)',
    borderRadius: '6px',
    display: 'flex',
    padding: '15px 10px 15px 10px',
    height: '20px',
    justifyContent: 'center',
    alignItems: 'center',
}))

const FilterIcon=styled(Box)({
    width: '20px',
    height: '20px',
    marginRight: '3px'
})

const FilterByFeatures=styled(Box)({
    width: '50%',
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
})

const Filters=()=>{
    const [filter, setFilter]=useState(null)
    const [price, setPrice]=useState('')
    const [royalty, setRoyalty]=useState('')

    const filtersName=['Trace', 'Ring', 'Crown']

    const getSelected=(selected)=>{
        if(filter===selected){
            return 'selected'
        }
    }

    return(
        <FilterContainer>
            <FilterByName>
                <FilterByNameItem
                    onClick={()=>setFilter(filtersName[0])}
                    selected={getSelected(filtersName[0])} to={'/explorer'} 
                >
                    <FilterIcon component={'img'} src={Trace}  alt=''/>
                    {filtersName[0]}
                </FilterByNameItem>
                <FilterByNameItem
                    onClick={()=>setFilter(filtersName[1])}
                    selected={getSelected(filtersName[1])} to={'/explorer'} 
                >
                    <FilterIcon component={'img'} src={Ring} alt=''/>
                   fujgjhhvh
                </FilterByNameItem>
                <FilterByNameItem
                    onClick={()=>setFilter(filtersName[2])}
                    selected={getSelected(filtersName[2])} to={'/explorer'} 
                >
                    <FilterIcon component={'img'} src={Crown} alt=''/>
                    {filtersName[2]}
                </FilterByNameItem>
            </FilterByName>
            <FilterByFeatures>
                <DropDown
                    options={[2,33,44,5,67]}
                    setValue={setPrice}
                    title={'By Price'}
                    value={price}
                />
                <DropDown
                    options={[2,4,5,7,8]}
                    setValue={setRoyalty}
                    title={'By Royalties'}
                    value={royalty}
                />
            </FilterByFeatures>
        </FilterContainer>
    )
}

export default Filters