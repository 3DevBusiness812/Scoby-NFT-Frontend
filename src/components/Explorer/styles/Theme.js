import { createTheme } from "@mui/material";
import TTNormsRegular from '../assets/fonts/TTNorms-Regular.otf'
import TTNormsBold from '../assets/fonts/TTNorms-Bold.otf'
import TTNormsMedium  from '../assets/fonts/TTNorms-Medium.otf'
import Avenir from '../assets/fonts/AvenirNext_Variable.ttf'

export const DefaultTheme=createTheme({
    typography: {
        h5:{
            fontFamily:'TTNorms-Bold',
            fontSize:12,
        },
        h6:{
            fontFamily:'Avenir-Medium',
            fontSize:10,
            lineHeight:'12px',
        }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
            @font-face {
                font-family: "TTNorms-Regular";
                font-style: normal;
                font-weight: 500;
                src:url(${TTNormsRegular});
            } 
            @font-face {
                font-family: "TTNorms-Medium";
                src:url(${TTNormsMedium});
            } 
            @font-face {
                font-family: "TTNorms-Bold";
                src:url(${TTNormsBold});
            } 
            @font-face {
                font-family: "Avenir-Regular";
                font-weight: 100;
                src:url(${Avenir});
            } 
            @font-face {
                font-family: "Avenir-Medium";
                src:url(${Avenir});
            } 
            @font-face {
                font-family: "Avenir-Bold";
                font-weight: 800;
                src:url(${Avenir});
            }
            @font-face {
                font-family: "Avenir";
                src:url(${Avenir});
            }
        `,
      },
    },
})