import { Suspense, lazy} from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/home/header';
import Loading from '../components/loading';
const Home=lazy(()=>import("../screens/home"))
const MagicSpore=lazy(()=>import("../screens/magicSpore"))

const MainRoute=()=>{
    return(
        <BrowserRouter>
            <Header/>
            <Suspense fallback={<Loading/>}>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path='magic_spore/*' element={<MagicSpore/>}/>
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}
export default MainRoute