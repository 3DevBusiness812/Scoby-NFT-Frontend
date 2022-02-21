import styled from "@emotion/styled"
import Card from "../Card/Card"
const { Grid } = require("@mui/material")

const UserContainer = styled(Grid)({
    width:'90vw',
})

const setKeyExtractor=(index)=>{
    return `Card-${Math.random()}-${index}`
}

const Users = ({users}) => {
    return (
        <UserContainer container>
            {
                users.map((user, index)=><Card user={user} key={setKeyExtractor(index)}/>)
            }
        </UserContainer>
    )
}

export default Users