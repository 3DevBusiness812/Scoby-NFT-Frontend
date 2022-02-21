import styled from "@emotion/styled"
import { Box, Typography, TextField, Button } from "@mui/material"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState} from "react"
import { Formik, Form } from 'formik'
import NFT from '../../assets/images/mint-card.png'

const Container = styled(Box)({
    background: "rgba(255, 255, 255, 0.17)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    minWidth: 300,
    marginTop:20
})

const HorizontalContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: '300px',
    margin: 20
})

const NftImage = styled(Box)({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(91.53deg, rgba(255, 255, 255, 0.16) 1.89%, rgba(255, 255, 255, 0.105) 103.72%)",
    border: "1px solid rgba(242, 242, 242, 0.4)",
    boxShadow: "1px 0px 5px 3px rgba(255, 255, 255, 0.06)",
    borderRadius: "12px",
    backdropFilter: "blur(20px)",
    p: 2,
    width: "130px",
    height: "130px",
})

const VerticalContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
})

const Text = styled(Typography)({
    fontSize: "14px",
    color: "#fff",
    fontFamily: "TTNorms-Medium",
    lineHeight: "130%",
    textTransform: "capitalize",
    textAlign: "center",
})

const NoteText = styled(Typography)({
    color: "#fff",
    textAlign: "center",
    fontSize: "12px",
    fontFamily: "TTNorms-Regular",
    width: 300
})

const Input = styled(TextField)({
    maxWidth: "70px",
    marginTop: 10,
    "& label.Mui-focused": {
        color: "#fff",
    },
    "& label": {
        fontSize: "14px",
        color: "#fff",
    },
    "& .MuiInput-underline:after": {
        borderBottomColor: "#fff",
    },
    "& .MuiInput-underline:before": {
        borderBottomColor: "#fff",
    },

    "& .MuiInput-root": {
        fontSize: "14px",
        color: "#fff",
        "& fieldset": {
            color: "#fff",
        },
    },
})

const MaxBottom = styled(Button)({
    width: '40%',
    boxShadow: "none",
    textTransform: "none",
    fontSize: 14,
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "10px",
    fontFamily: "TTNorms-Medium",
    border: "none",
    lineHeight: 1.5,
    background: "linear-gradient(96.57deg, #D858BC 0%, #3C00FF 98.85%)",
})

const MintSpore = styled(Button)({
    width: '40%',
    boxShadow: "none",
    textTransform: "none",
    fontSize: 14,
    color: "rgba(9, 7, 58, 1)",
    padding: "6px 12px",
    borderRadius: "10px",
    border: "none",
    fontFamily: "TTNorms-Medium",
    lineHeight: 1.5,
    backgroundColor: "#FFC800",
})

const TOTALMINT = 1000;

const Card = () => {
    const [Balance, setBalance] = useState(null)
    const Wallet= useWallet()
    const {publicKey}=Wallet
    const Conection = useConnection()

    useEffect(() => {
        if (publicKey) {
            Conection.connection.getBalance(publicKey)
                .then((balance) => setBalance(Math.floor(balance / 1000000000)))
        }
    }, [publicKey, Conection.connection])

    const Mint = (e) => {
        console.log(e)
    }

    return (
        <Container>
            <Formik
                initialValues={{ mints: 0, totalPrice: 30 }}
                onSubmit={Mint}
            >
                {(formikProps) => (
                    <Form>
                        <HorizontalContainer>
                            <NftImage component={'img'} src={NFT} alt='' />
                        </HorizontalContainer>
                        <HorizontalContainer>
                            <VerticalContainer>
                                <Text variant="h1">Number <br /> Available</Text>
                                <Text variant="h1">{TOTALMINT}/{TOTALMINT}</Text>
                                <Input
                                    variant="standard"
                                    {...formikProps.getFieldProps('mints')}
                                    label="Mint me"
                                    fullWidth={true}
                                    autoComplete={'off'}
                                    onChange={(event) => formikProps.setFieldValue('mints', parseFloat(event.target.value) || 0)}
                                />
                            </VerticalContainer>
                            <VerticalContainer>
                                <Text variant="h1">price per <br /> spore <br /> 1 sol</Text>
                                <Input
                                    variant="standard"
                                    {...formikProps.getFieldProps('totalPrice')}
                                    label="Total Price"
                                    InputProps={{ readOnly: true }}
                                />
                            </VerticalContainer>
                        </HorizontalContainer>
                        <HorizontalContainer>
                            <MaxBottom onClick={() => formikProps.setFieldValue('mints', Balance)}>Max ({Balance})</MaxBottom>
                            <MintSpore onClick={formikProps.handleSubmit} type="submit">Mint my spores!</MintSpore>
                        </HorizontalContainer>
                        <HorizontalContainer>
                            <NoteText>
                                Magic Spores thrive in community. A Guardian must be currently
                                caring for a Spore to mint a new Spore.
                            </NoteText>
                        </HorizontalContainer>
                    </Form>
                )}
            </Formik>
        </Container>
    )
}

export default Card