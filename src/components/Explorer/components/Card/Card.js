import styled from "@emotion/styled"
import Logo from '../../assets/images/logo.png'
import { Avatar, Box, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import VerifiedIcon from "@mui/icons-material/Verified";
import CardContainer from "../Card/CardContainer"

const Header=styled(Box)(({img})=>({
    background: `url(${img}) no-repeat center center`,
    width:'100%',
    height:'100px',
    backgroundSize:'cover',
    borderRadius:'8px 8px 0px 0px',
    display:'flex',
    alignItems:'center'
}))

const Foot=styled(Box)({
    display:'flex',
    flexDirection:'row',
    width:'100%'
})

const UserAvatar=styled(Avatar)({
    border: "2px solid white", 
    width: 80, 
    height: 80,
    marginLeft:10
})

const LeftInfo=styled(Box)({
    width:'50%',
    marginLeft:10,
    display:'flex',
    flexDirection:'column'
})

const Name=styled(Typography)({
    color: "#fff",
    width:'100%',
    marginTop:10
})

const Bio=styled(Typography)({
    color: "#fff",
    alignItems: "center",
    marginTop:10
})

const Address=styled(Typography)({
    color:'rgba(30, 238, 251, 1)',
    marginTop:8
})

const Linking=styled(Link)({
    textDecoration:'none',
    color:'rgba(236, 0, 140, 1)',
    fontSize:12
})

const Connect=styled(Link)({
    color:'#fff',
    textDecoration:'none',
    fontSize:12,
    fontFamily:'TTNorms-Regular',
    fontWeight:'700',
    backgroundColor:'rgba(205, 6, 142, 1)',
    borderRadius:8,
    justifyContent:'center',
    alignItems:'center',
    display:'flex',
    width:100,
    padding:'5px 0px 5px 0px',
    margin: '10px 0px 10px 0px',
    '&:hover':{
        transform:'scale(1.04)'
    }
})

const LogoIcon=styled(Box)({
    width:15,
    height:15,
    marginLeft:5
})

const RightInfo=styled(Box)({
    display:'flex',
    flexDirection:'column',
    justifyContent:'space-between',
    width:'50%',
})

const Followers=styled(Box)({
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around',
    width:'100%'
})

const FollowersText=styled(Typography)({
    fontFamily:'TTNorms-Regular',
    color:'#fff',
    textAlign:'center',
    fontSize:11,
    marginTop:10
})

const SubTitle=styled(Typography)({
    fontFamily:'TTNorms-Bold',
    color:'rgba(30, 238, 251, 1)',
    margin:'10px 0 0px 30px',
    fontSize:12
})

const Text=styled(Typography)({
    fontFamily:'Avenir',
    fontWeight:'500',
    fontSize:9,
    margin:'0 20px 0px 30px',
    color:'#fff'
})

const ViewBotton=styled(Link)({
    backgroundColor:'#FFC800',
    color:'#000',
    textDecoration:'none',
    fontSize:12,
    fontFamily:'TTNorms-Regular',
    fontWeight:'700',
    borderRadius:8,
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'flex-end',
    display:'flex',
    width:120,
    padding:'5px 0px 5px 0px',
    margin: '10px 10px 10px 0px',
    '&:hover':{
        transform:'scale(1.04)'
    }
})

const Card=({user})=>{
    return(
        <CardContainer>
            <Header img={user.bg}>
                <UserAvatar src={user.profileImage}/>
            </Header>
            <Foot>
                <LeftInfo>
                    <Name variant="h5">
                        {user.name} 
                        <VerifiedIcon sx={{ marginLeft:'20px', color: "#fff", fontSize: "16px" }} />
                    </Name>
                    <Bio variant="h6">{user.bio}</Bio>
                    <Address variant="h6">Los Angeles, California, United States</Address>
                    <Linking to={'/explorer'}>www.motodave.com</Linking>
                    <Connect to={'/explorer'}>Connect <LogoIcon src={Logo} component={'img'}/>
                    </Connect>
                </LeftInfo>
                <RightInfo>
                    <Followers>
                        <FollowersText>200 <br/> Followers</FollowersText>
                        <FollowersText>200 <br/> Following</FollowersText>
                    </Followers>
                    <SubTitle>I’m holding:</SubTitle>
                    <Text>Trace, Ring, Morph, Crown and 5 more...</Text>
                    <ViewBotton to={'/explorer'}>View Collection</ViewBotton>
                </RightInfo>
            </Foot>
        </CardContainer>
    )
}

export default Card