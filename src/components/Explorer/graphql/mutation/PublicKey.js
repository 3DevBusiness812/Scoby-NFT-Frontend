import { gql } from "@apollo/client";

export const VERIFY_PUBLIC_KEY=gql`
    mutation verifyPublicKey($publicKey:String!){
        verifyPublicKey(publicKey:$publicKey){
            id
            avatar
            backgroundImage
            fullName
            username
        }
    }
`