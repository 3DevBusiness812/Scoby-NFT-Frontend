import styled from "@emotion/styled"

const { Box } = require("@mui/material")

const Container=styled(Box)({
    minHeight:'25vh',
    width:'25vw',
    margin:'10px',
    backgroundColor:'rgba(255,255,255,.2)',
    '&:hover':{
        transform:'scale(1.04)'
    },
    transition: "all ease-in-out .4s",
    borderRadius:10,
    cursor:'pointer',
    flexGrow: 1,
    boxShadow: "1px 0px 5px 3px rgba(255, 255, 255, 0.06)",
})

const CardContainer=({children})=>{
    return (
        <Container>
            {children}
        </Container>
    )
}
export default CardContainer