import { useState } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import {Upload} from 'antd'
import {
  Connection,
  clusterApiUrl
} from '@solana/web3.js'
import useNotify from './notify'
import {mintNftToIpfs, VERIFY_KEYPAIR} from './uploadNft'
import { WalletConnect } from '../wallet';

const { Dragger } = Upload;
let wallet;
let conn = new Connection(clusterApiUrl('devnet'));
let notify;

export default function Mint(){
	wallet = useWallet();
	notify = useNotify();

	const [name, setName] = useState('');
	const [symbol, setSymbol] = useState('MagicSpore');
	const [description, setDescription] = useState('');
	const [file, setFile] = useState();
	const [fileZip, setFileZip] = useState();
	const [isMinting, setIsMinting] = useState(false);

	const mintNft = async() => {
		setIsMinting(true);
		let creators = [];
		const VERIFY_ADDRESS = VERIFY_KEYPAIR.publicKey;
		if(VERIFY_ADDRESS != wallet.publicKey.toBase58())
			creators = [
						{address : VERIFY_ADDRESS.toBase58(), share : 0, verified : true},
						{address : wallet.publicKey.toBase58(), share : 100, verified : false}
					];
		else
			creators = [
						{address : VERIFY_ADDRESS, share : 100, verified : true}
					];
		const result = await mintNftToIpfs(
			conn, 
			wallet,
			{
				name : name,
				symbol : symbol,
				description : description,
				seller_fee_basis_points : 300,
				image : '',
				external_url : '',
				properties:{
					creators : creators
				},
				collection: {
					name : "MagicSpore",
					family: "MagicSpore"
				},
			},
			{
				imageFile : file,
				zipFile : fileZip,
			}
		);
		if(result){
			notify('success', 'Success!');
		}else{
			notify('error', 'Failed Instruction!');
		}
		setIsMinting(false);
	}

	return <>
		<div className="d-flex justify-content-center">
			<WalletConnect />
		</div>
		<div className="container-fluid mt-4">
			<div className="row">
				<div className="col-lg-12">
					<div className="input-group mb-3">
						<div className="input-group-prepend">
							<span className="input-group-text">NFT Name</span>
						</div>
						<input name="nftName" type="text" className="form-control" onChange={(event)=>{setName(event.target.value)}} value={name}/>
					</div>
					<div className="mb-3">
						<label htmlFor="description">Description:</label>
						<textarea className="form-control" id="description" name="text" onChange={(event)=>{setDescription(event.target.value)}} value={description}></textarea>
					</div>
				<div className="card">
					<Dragger
						accept=".png,.jpg,.gif,.mp4"
						style={{ padding: 20 }}
						multiple={false}
						customRequest={info => {
						info?.onSuccess?.({}, null);
						}}
						fileList={file ? [file] : []}
						onChange={async info => {
						const fileli = info.file.originFileObj;
						if (fileli) setFile(fileli);
						}}
					>
						<div className="ant-upload-drag-icon">
						<h5 style={{ fontWeight: 700 }}>
							Upload your cover image (PNG, JPG, GIF)
						</h5>
						</div>
					</Dragger>
				</div>
						<div className="card mb-3">
					<Dragger
						accept="*.*"
						style={{ padding: 20 }}
						multiple={false}
						customRequest={info => {
						info?.onSuccess?.({}, null);
						}}
						fileList={fileZip ? [fileZip] : []}
						onChange={async info => {
						const fileli = info.file.originFileObj;
						if (fileli) setFileZip(fileli);
						}}
						>
						<div className="ant-upload-drag-icon">
						<h5 style={{ fontWeight: 700 }}>
							Upload your digital data
						</h5>
						</div>
					</Dragger>  
						</div>
				{
					wallet && wallet.connected && 
					<div className="row container-fluid">
						<button 
							type="button"
							disabled={isMinting} 
							className="btn btn-primary mb3 d-flex justify-content-center" 
							onClick={async ()=>{
								await mintNft()
								}
							}>
							{isMinting ? <div className="loader"></div> : <div>MINT</div>}
						</button>
					</div>
				}
				</div>
			</div>
		</div>
	</>
}