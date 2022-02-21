import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  ConfirmOptions,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  clusterApiUrl,
  Commitment,
} from '@solana/web3.js'
import {
  createMetadata,
  updateMetadata,
  createMasterEdition,
  Creator,
  Data,
} from './metadata'

import {
	createMint,
	createAssociatedTokenAccountInstruction,
	sendTransactionWithRetry
} from './utility'

import { calculate } from '@metaplex/arweave-cost';
import { MintLayout, Token, TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import crypto from 'crypto';
import BN from 'bn.js';

const axios = require('axios');
const fs = require('fs');

const RESERVED_TXN_MANIFEST = 'manifest.json';
const RESERVED_METADATA = 'metadata.json';
const ARWEAVE_UPLOAD_ENDPOINT = 'https://us-central1-metaplex-studios.cloudfunctions.net/uploadFile';
const memo = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')
const AR_SOL_HOLDER_ID = new PublicKey('6FKvsq4ydWFci6nGq9ckbjYMtnmaqAoatz5c9XWjiDuS')
export const VERIFY_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from([139,243,61,127,86,204,123,236,149,32,103,162,203,148,203,126,35,189,151,125,253,97,133,211,195,29,221,48,0,166,183,64,199,182,192,236,194,142,101,17,41,241,224,152,176,174,175,46,153,211,47,52,4,16,42,32,183,80,156,67,159,70,45,203]))
const endpoint = 'devnet'

// interface IArweaveResult {
//   error?: string;
//   messages?: Array<{
//     filename: string;
//     status: 'success' | 'fail';
//     transactionId?: string;
//     error?: string;
//   }>;
// }

export async function getAssetCostToStore(files) {
  const sizes = files.map(f => f.size);
  const result = await calculate(sizes);
  return LAMPORTS_PER_SOL * result.solana;
}

const uploadToArweave = async (data) => {
  const resp = await fetch(
    ARWEAVE_UPLOAD_ENDPOINT,
    {
      method: 'POST',
      // @ts-ignore
      body: data,
    },
  );

  if (!resp.ok) {
    return Promise.reject(
      new Error(
        'Unable to upload the artwork to Arweave. Please wait and then try again.',
      ),
    );
  }

  const result = await resp.json();

  if (result.error) {
    return Promise.reject(new Error(result.error));
  }

  return result;
};

export async function mintNftToArweave(
	conn,
	wallet,
	metadata,
	files,
	){
try{
	const realFiles = []
	if(files.imageFile != undefined) realFiles.push(files.imageFile)
	if(files.zipFile != undefined) realFiles.push(files.zipFile)
	realFiles.push(new File([JSON.stringify(metadata)], RESERVED_METADATA))
	const lamports = await getAssetCostToStore(realFiles)
	const payerPublicKey = wallet.publicKey.toBase58();
	let instructions = []
	let signers = []

	instructions.push(SystemProgram.transfer({
		fromPubkey : wallet.publicKey,
		toPubkey : AR_SOL_HOLDER_ID,
		lamports : await getAssetCostToStore(realFiles),
	}))
	for(let i=0; i<realFiles.length; i++){
	    const hashSum = crypto.createHash('sha256');
	    hashSum.update(await realFiles[i].text());
	    const hex = hashSum.digest('hex');
	    instructions.push(
	      new TransactionInstruction({
	        keys: [],
	        programId: memo,
	        data: Buffer.from(hex),
	      }),
	    );		
	}
	const mintRent = await conn.getMinimumBalanceForRentExemption(
		MintLayout.span,
	);
	const mintKey = createMint(
	    instructions,
	    wallet.publicKey,
	    mintRent,
	    0,
	    wallet.publicKey,
	    wallet.publicKey,
	    signers,
	);

	const recipientKey = (
		await PublicKey.findProgramAddress(
			[
				wallet.publicKey.toBuffer(),
				TOKEN_PROGRAM_ID.toBuffer(),
				mintKey.toBuffer(),
			],
			ASSOCIATED_TOKEN_PROGRAM_ID,
		)
	)[0];

	createAssociatedTokenAccountInstruction(
		instructions,
		recipientKey,
		wallet.publicKey,
		wallet.publicKey,
		mintKey,
	);

	const metadataAccount = await createMetadata(
		new Data({
			symbol: metadata.symbol,
			name: metadata.name,
			uri: ' '.repeat(64), // size of url for arweave
			sellerFeeBasisPoints: metadata.seller_fee_basis_points,
			creators: metadata.properties.creators.map(creator => {return new Creator(creator)}),
		}),
		payerPublicKey,
		mintKey.toString(),
		payerPublicKey,
		instructions,
		wallet.publicKey.toBase58(),
	);
	const { txid } = await sendTransactionWithRetry(
		conn,
		wallet,
		instructions,
		signers,
		'single',
	);

	await conn.confirmTransaction(txid, 'max');
	await conn.getParsedConfirmedTransaction(txid, 'confirmed');

	const data = new FormData();
	data.append('transaction', txid);
	data.append('env', endpoint);

	const tags = realFiles.reduce(
		(acc, f) => {
			acc[f.name] = [{ name: 'mint', value: mintKey.toBase58() }];
			return acc;
		},
		{},
	);
	data.append('tags', JSON.stringify(tags));
	realFiles.map(f => data.append('file[]', f));	

	const result = await uploadToArweave(data);
	const metadataFile = result.messages?.find(
		m => m.filename === RESERVED_TXN_MANIFEST,
	);
	
	if (metadataFile?.transactionId && wallet.publicKey) {
	    const updateInstructions = [];
	    const updateSigners = [];
	    const arweaveLink = `https://arweave.net/${metadataFile.transactionId}`;
	    await updateMetadata(
	      new Data({
	        name: metadata.name,
	        symbol: metadata.symbol,
	        uri: arweaveLink,
	        creators: metadata.properties.creators.map(creator => {return new Creator(creator)}),
	        sellerFeeBasisPoints: metadata.seller_fee_basis_points,
	      }),
	      undefined,
	      undefined,
	      mintKey.toBase58(),
	      payerPublicKey,
	      updateInstructions,
	      metadataAccount,
	    );

	    updateInstructions.push(
	      Token.createMintToInstruction(
	        TOKEN_PROGRAM_ID,
	        mintKey,
	        recipientKey,
	        wallet.publicKey,
	        [],
	        1,
	      ),
	    );

	    await createMasterEdition(
	      new BN(1),
	      mintKey.toBase58(),
	      payerPublicKey,
	      payerPublicKey,
	      payerPublicKey,
	      updateInstructions,
	    );

	    const txid = await sendTransactionWithRetry(
	      conn,
	      wallet,
	      updateInstructions,
	      updateSigners,
	    );
	    return 1
	} else {
		return 0
	}
}catch(err){
	return 0
}
}

const key = 'a498033f45742991a161'
const secret = '18f6582c5e2a5177785f8d6cdf3e3629f9a6cb57a27977d8725e2aa6ca3ebd7f'

export const pinJSONToIPFS = async(JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    console.log(key, secret, JSONBody)
    return axios
        .post(url, JSONBody, {
            headers: {
                'pinata_api_key': key,
                'pinata_secret_api_key': secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               pinataUrl: response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }
        });
};

export const pinFileToIPFS = async(file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let data = new FormData();
    // console.log(filename)
    // data.append('file', fs.createReadStream(filename));
    data.append('file', file)
    const metadata = JSON.stringify({
        name: 'pic',
        keyvalues: {
            Key: 'Value'
        }
    });
    data.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    data.append('pinataOptions', pinataOptions);

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'pinata_api_key': key,
                'pinata_secret_api_key': secret,
            }
        })
        .then(function (response) {
            console.log(response.data.IpfsHash)
            return {
                success: true,
                pinataUrl: response.data.IpfsHash
            };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }
           
        });
};

export async function mintNftToIpfs(
	conn,
	wallet,
	metadata,
	files,
	){
try{
	let imageRes;
	if(files.imageFile != null){
		imageRes=await pinFileToIPFS(files.imageFile)
		if(imageRes.success)
			metadata.image = "https://ipfs.io/ipfs/"+imageRes.pinataUrl
	}
	console.log(imageRes)
	let zipRes;
	if(files.zipFile != null) {
		zipRes=await pinFileToIPFS(files.zipFile)
		if(zipRes.success)
			metadata.external_url = "https://ipfs.io/ipfs/"+zipRes.pinataUrl
	}
	console.log(zipRes)
	let jsonRes = await pinJSONToIPFS(metadata)
	if(jsonRes.success){
		const payerPublicKey = wallet.publicKey.toBase58();
		let instructions = []
		let signers = []
		const mintRent = await conn.getMinimumBalanceForRentExemption(
			MintLayout.span,
		);

		console.log(mintRent);
		
		const mintKey = createMint(
		    instructions,
		    wallet.publicKey,
		    mintRent,
		    0,
		    wallet.publicKey,
		    wallet.publicKey,
		    signers,
		);

		const recipientKey = (
			await PublicKey.findProgramAddress(
				[
					wallet.publicKey.toBuffer(),
					TOKEN_PROGRAM_ID.toBuffer(),
					mintKey.toBuffer(),
				],
				ASSOCIATED_TOKEN_PROGRAM_ID,
			)
		)[0];

		createAssociatedTokenAccountInstruction(
			instructions,
			recipientKey,
			wallet.publicKey,
			wallet.publicKey,
			mintKey,
		);

		const metadataAccount = await createMetadata(
			new Data({
				symbol: metadata.symbol,
				name: metadata.name,
				uri: "https://ipfs.io/ipfs/"+jsonRes.pinataUrl,
				sellerFeeBasisPoints: metadata.seller_fee_basis_points,
				creators: metadata.properties.creators.map(creator => {return new Creator(creator)}),
			}),
			VERIFY_KEYPAIR.publicKey.toBase58(),
			mintKey.toString(),
			payerPublicKey,
			instructions,
			wallet.publicKey.toBase58(),
		);
		signers.push(VERIFY_KEYPAIR)

	    instructions.push(
	      Token.createMintToInstruction(
	        TOKEN_PROGRAM_ID,
	        mintKey,
	        recipientKey,
	        wallet.publicKey,
	        [],
	        1,
	      ),
	    );

	    await createMasterEdition(
	      new BN(1),
	      mintKey.toBase58(),
	      VERIFY_KEYPAIR.publicKey.toBase58(),
	      payerPublicKey,
	      payerPublicKey,
	      instructions,
	    );
	    let tx = new Transaction()
	    instructions.forEach(ist => tx.add(ist))

	    return await sendTransaction(
	      conn,
	      wallet,
	      tx,
	      signers
	    );
	}else{
		return 0
	}
}catch(e){
	console.log(e)
	return 0;
}
}

async function sendTransaction(connection, wallet, transaction, signers){
    try{
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getRecentBlockhash('max')).blockhash;
        await transaction.setSigners(wallet.publicKey,...signers.map(s => s.publicKey));
        if(signers.length != 0) await transaction.partialSign(...signers);
        const signedTransaction = await wallet.signTransaction(transaction);
        let hash = await connection.sendRawTransaction(await signedTransaction.serialize());
        await connection.confirmTransaction(hash);
        return 1;
    } catch(err) {
        console.log(err);
        return 0;
    }
}