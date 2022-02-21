import {
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  PublicKey,
} from '@solana/web3.js';

import { deserializeUnchecked, serialize, BinaryReader, BinaryWriter } from 'borsh';
import base58 from 'bs58';
import BN from 'bn.js';

const PubKeysInternedMap = new Map();

export const toPublicKey = (key) => {
  if (typeof key !== 'string') {
    return key;
  }

  let result = PubKeysInternedMap.get(key);
  if (!result) {
    result = new PublicKey(key);
    PubKeysInternedMap.set(key, result);
  }

  return result;
};

export const pubkeyToString = (key = '') => {
  return typeof key === 'string' ? key : key?.toBase58() || '';
};

export const programIds = () => {
  return {
    token: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    metadata: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  };
};

export const extendBorsh = () => {
  (BinaryReader.prototype).readPubkey = function () {
    const reader = this;
    const array = reader.readFixedArray(32);
    return new PublicKey(array);
  };

  (BinaryWriter.prototype).writePubkey = function (value) {
    const writer = this;
    writer.writeFixedArray(value.toBuffer());
  };

  (BinaryReader.prototype).readPubkeyAsString = function () {
    const reader = this;
    const array = reader.readFixedArray(32);
    return base58.encode(array);
  };

  (BinaryWriter.prototype).writePubkeyAsString = function (
    value,
  ) {
    const writer = this;
    writer.writeFixedArray(base58.decode(value));
  };

  // BTreeMap<u32, u32>
  (BinaryReader.prototype).readMap32 = function () {
    const reader = this;
    const map = new Map();
    const length = reader.readU32();
    for (let i = 0; i < length; i++) {
      const key = reader.readU32();
      const val = reader.readU32();
      map.set(key, val);
    }
    return map;
  };

  // BTreeMap<u32, u32>
  (BinaryWriter.prototype).writeMap32 = function (
    value,
  ) {
    const writer = this;
    value.forEach((val, key) => {
      writer.writeU32(key);
      writer.writeU32(val);
    });
  };
};

extendBorsh();

export const METADATA_PREFIX = 'metadata';
export const EDITION = 'edition';
export const RESERVATION = 'reservation';

export const findProgramAddress = async(
  seeds,
  programId,
) => {
  const result = await PublicKey.findProgramAddress(seeds, programId);
  return [result[0].toBase58(), result[1]]
}

export const MAX_NAME_LENGTH = 32;

export const MAX_SYMBOL_LENGTH = 10;

export const MAX_URI_LENGTH = 200;

export const MAX_CREATOR_LIMIT = 5;

export const MAX_CREATOR_LEN = 32 + 1 + 1;
export const MAX_METADATA_LEN =
  1 +
  32 +
  32 +
  MAX_NAME_LENGTH +
  MAX_SYMBOL_LENGTH +
  MAX_URI_LENGTH +
  MAX_CREATOR_LIMIT * MAX_CREATOR_LEN +
  2 +
  1 +
  1 +
  198;

export const MAX_EDITION_LEN = 1 + 32 + 8 + 200;

export const EDITION_MARKER_BIT_SIZE = 248;


export const MetadataKey = {
  Uninitialized: 0,
  MetadataV1: 4,
  EditionV1: 1,
  MasterEditionV1: 2,
  MasterEditionV2: 6,
  EditionMarker: 7,
}


export class MasterEditionV1 {
  key;
  supply;
  maxSupply;
  /// Can be used to mint tokens that give one-time permission to mint a single limited edition.
  printingMint;
  /// If you don't know how many printing tokens you are going to need, but you do know
  /// you are going to need some amount in the future, you can use a token from this mint.
  /// Coming back to token metadata with one of these tokens allows you to mint (one time)
  /// any number of printing tokens you want. This is used for instance by Auction Manager
  /// with participation NFTs, where we dont know how many people will bid and need participation
  /// printing tokens to redeem, so we give it ONE of these tokens to use after the auction is over,
  /// because when the auction begins we just dont know how many printing tokens we will need,
  /// but at the end we will. At the end it then burns this token with token-metadata to
  /// get the printing tokens it needs to give to bidders. Each bidder then redeems a printing token
  /// to get their limited editions.
  oneTimePrintingAuthorizationMint;

  constructor(args) {
    this.key = MetadataKey.MasterEditionV1;
    this.supply = args.supply;
    this.maxSupply = args.maxSupply;
    this.printingMint = args.printingMint;
    this.oneTimePrintingAuthorizationMint =
      args.oneTimePrintingAuthorizationMint;
  }
}

export class MasterEditionV2 {
  key;
  supply;
  maxSupply;

  constructor(args) {
    this.key = MetadataKey.MasterEditionV2;
    this.supply = args.supply;
    this.maxSupply = args.maxSupply;
  }
}

export class EditionMarker {
  key;
  ledger;

  constructor(args) {
    this.key = MetadataKey.EditionMarker;
    this.ledger = args.ledger;
  }

  editionTaken(edition) {
    const editionOffset = edition % EDITION_MARKER_BIT_SIZE;
    const indexOffset = Math.floor(editionOffset / 8);

    if (indexOffset > 30) {
      throw Error('bad index for edition');
    }

    const positionInBitsetFromRight = 7 - (editionOffset % 8);

    const mask = Math.pow(2, positionInBitsetFromRight);

    const appliedMask = this.ledger[indexOffset] & mask;

    return appliedMask != 0;
  }
}

export class Edition {
  key;
  /// Points at MasterEdition struct
  parent;
  /// Starting at 0 for master record, this is incremented for each edition minted.
  edition;

  constructor(args) {
    this.key = MetadataKey.EditionV1;
    this.parent = args.parent;
    this.edition = args.edition;
  }
}
export class Creator {
  address;
  verified;
  share;

  constructor(args) {
    this.address = args.address;
    this.verified = args.verified;
    this.share = args.share;
  }
}

export class Data {
  name;
  symbol;
  uri;
  sellerFeeBasisPoints;
  creators;
  constructor(args) {
    this.name = args.name;
    this.symbol = args.symbol;
    this.uri = args.uri;
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
    this.creators = args.creators;
  }
}

export class Metadata {
  key;
  updateAuthority;
  mint;
  data;
  primarySaleHappened;
  isMutable;
  editionNonce;

  // set lazy
  masterEdition;
  edition;

  constructor(args) {
    this.key = MetadataKey.MetadataV1;
    this.updateAuthority = args.updateAuthority;
    this.mint = args.mint;
    this.data = args.data;
    this.primarySaleHappened = args.primarySaleHappened;
    this.isMutable = args.isMutable;
    this.editionNonce = args.editionNonce ?? null;
  }

  async init() {
    //const metadata = toPublicKey(programIds().metadata);
    /*
    This nonce stuff doesnt work - we are doing something wrong here. TODO fix.
    if (this.editionNonce !== null) {
      this.edition = (
        await PublicKey.createProgramAddress(
          [
            Buffer.from(METADATA_PREFIX),
            metadata.toBuffer(),
            toPublicKey(this.mint).toBuffer(),
            new Uint8Array([this.editionNonce || 0]),
          ],
          metadata,
        )
      ).toBase58();
    } else {*/
    this.edition = await getEdition(this.mint);
    //}
    this.masterEdition = this.edition;
  }
}

class CreateMetadataArgs {
  instruction = 0;
  data;
  isMutable;

  constructor(args) {
    this.data = args.data;
    this.isMutable = args.isMutable;
  }
}
class UpdateMetadataArgs {
  instruction = 1;
  data;
  // Not used by this app, just required for instruction
  updateAuthority;
  primarySaleHappened;
  constructor(args) {
    this.data = args.data ? args.data : null;
    this.updateAuthority = args.updateAuthority ? args.updateAuthority : null;
    this.primarySaleHappened = args.primarySaleHappened;
  }
}

class CreateMasterEditionArgs {
  instruction = 10;
  maxSupply;
  constructor(args) {
    this.maxSupply = args.maxSupply;
  }
}

class MintPrintingTokensArgs {
  instruction = 9;
  supply;

  constructor(args) {
    this.supply = args.supply;
  }
}

export const METADATA_SCHEMA = new Map([
  [
    CreateMetadataArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['data', Data],
        ['isMutable', 'u8'], // bool
      ],
    },
  ],
  [
    UpdateMetadataArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['data', { kind: 'option', type: Data }],
        ['updateAuthority', { kind: 'option', type: 'pubkeyAsString' }],
        ['primarySaleHappened', { kind: 'option', type: 'u8' }],
      ],
    },
  ],

  [
    CreateMasterEditionArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['maxSupply', { kind: 'option', type: 'u64' }],
      ],
    },
  ],
  [
    MintPrintingTokensArgs,
    {
      kind: 'struct',
      fields: [
        ['instruction', 'u8'],
        ['supply', 'u64'],
      ],
    },
  ],
  [
    MasterEditionV1,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['supply', 'u64'],
        ['maxSupply', { kind: 'option', type: 'u64' }],
        ['printingMint', 'pubkeyAsString'],
        ['oneTimePrintingAuthorizationMint', 'pubkeyAsString'],
      ],
    },
  ],
  [
    MasterEditionV2,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['supply', 'u64'],
        ['maxSupply', { kind: 'option', type: 'u64' }],
      ],
    },
  ],
  [
    Edition,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['parent', 'pubkeyAsString'],
        ['edition', 'u64'],
      ],
    },
  ],
  [
    Data,
    {
      kind: 'struct',
      fields: [
        ['name', 'string'],
        ['symbol', 'string'],
        ['uri', 'string'],
        ['sellerFeeBasisPoints', 'u16'],
        ['creators', { kind: 'option', type: [Creator] }],
      ],
    },
  ],
  [
    Creator,
    {
      kind: 'struct',
      fields: [
        ['address', 'pubkeyAsString'],
        ['verified', 'u8'],
        ['share', 'u8'],
      ],
    },
  ],
  [
    Metadata,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['updateAuthority', 'pubkeyAsString'],
        ['mint', 'pubkeyAsString'],
        ['data', Data],
        ['primarySaleHappened', 'u8'], // bool
        ['isMutable', 'u8'], // bool
        ['editionNonce', { kind: 'option', type: 'u8' }],
      ],
    },
  ],
  [
    EditionMarker,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['ledger', [31]],
      ],
    },
  ],
]);

// eslint-disable-next-line no-control-regex
const METADATA_REPLACE = new RegExp('\u0000', 'g');

export const decodeMetadata = (buffer) => {
  const metadata = deserializeUnchecked(
    METADATA_SCHEMA,
    Metadata,
    buffer,
  );
  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '');
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '');
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '');
  return metadata;
};

export const decodeEditionMarker = (buffer) => {
  const editionMarker = deserializeUnchecked(
    METADATA_SCHEMA,
    EditionMarker,
    buffer,
  );
  return editionMarker;
};

export const decodeEdition = (buffer) => {
  return deserializeUnchecked(METADATA_SCHEMA, Edition, buffer);
};

export const decodeMasterEdition = (
  buffer,
) => {
  if (buffer[0] == MetadataKey.MasterEditionV1) {
    return deserializeUnchecked(
      METADATA_SCHEMA,
      MasterEditionV1,
      buffer,
    );
  } else {
    return deserializeUnchecked(
      METADATA_SCHEMA,
      MasterEditionV2,
      buffer,
    ) ;
  }
};

export async function updateMetadata(
  data,
  newUpdateAuthority,
  primarySaleHappened,
  mintKey,
  updateAuthority,
  instructions,
  metadataAccount,
) {
  const metadataProgramId = programIds().metadata;

  metadataAccount =
    metadataAccount ||
    (
      await findProgramAddress(
        [
          Buffer.from('metadata'),
          toPublicKey(metadataProgramId).toBuffer(),
          toPublicKey(mintKey).toBuffer(),
        ],
        toPublicKey(metadataProgramId),
      )
    )[0];

  const value = new UpdateMetadataArgs({
    data,
    updateAuthority: !newUpdateAuthority ? undefined : newUpdateAuthority,
    primarySaleHappened:
      primarySaleHappened === null || primarySaleHappened === undefined
        ? null
        : primarySaleHappened,
  });
  const txnData = Buffer.from(serialize(METADATA_SCHEMA, value));
  const keys = [
    {
      pubkey: toPublicKey(metadataAccount),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(updateAuthority),
      isSigner: true,
      isWritable: false,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data: txnData,
    }),
  );

  return metadataAccount;
}

export async function createMetadata(
  data,
  updateAuthority,
  mintKey,
  mintAuthorityKey,
  instructions,
  payer,
) {
  const metadataProgramId = programIds().metadata;

  const metadataAccount = (
    await findProgramAddress(
      [
        Buffer.from('metadata'),
        toPublicKey(metadataProgramId).toBuffer(),
        toPublicKey(mintKey).toBuffer(),
      ],
      toPublicKey(metadataProgramId),
    )
  )[0];
  console.log('Data', data);
  const value = new CreateMetadataArgs({ data, isMutable: true });
  const txnData = Buffer.from(serialize(METADATA_SCHEMA, value));

  const keys = [
    {
      pubkey: toPublicKey(metadataAccount),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(mintKey),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(mintAuthorityKey),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(payer),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(updateAuthority),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data: txnData,
    }),
  );

  return metadataAccount;
}

export async function createMasterEdition(
  maxSupply,
  mintKey,
  updateAuthorityKey,
  mintAuthorityKey,
  payer,
  instructions,
) {
  const metadataProgramId = programIds().metadata;

  const metadataAccount = (
    await findProgramAddress(
      [
        Buffer.from(METADATA_PREFIX),
        toPublicKey(metadataProgramId).toBuffer(),
        toPublicKey(mintKey).toBuffer(),
      ],
      toPublicKey(metadataProgramId),
    )
  )[0];

  const editionAccount = (
    await findProgramAddress(
      [
        Buffer.from(METADATA_PREFIX),
        toPublicKey(metadataProgramId).toBuffer(),
        toPublicKey(mintKey).toBuffer(),
        Buffer.from(EDITION),
      ],
      toPublicKey(metadataProgramId),
    )
  )[0];

  const value = new CreateMasterEditionArgs({ maxSupply: maxSupply || null });
  const data = Buffer.from(serialize(METADATA_SCHEMA, value));

  const keys = [
    {
      pubkey: toPublicKey(editionAccount),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(mintKey),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(updateAuthorityKey),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(mintAuthorityKey),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(payer),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(metadataAccount),
      isSigner: false,
      isWritable: false,
    },

    {
      pubkey: programIds().token,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];

  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data,
    }),
  );
}

export async function deprecatedMintNewEditionFromMasterEditionViaPrintingToken(
  newMint,
  tokenMint,
  newMintAuthority,
  printingMint,
  authorizationTokenHoldingAccount,
  burnAuthority,
  updateAuthorityOfMaster,
  reservationList,
  instructions,
  payer,
) {
  const metadataProgramId = programIds().metadata;

  const newMetadataKey = await getMetadata(newMint);
  const masterMetadataKey = await getMetadata(tokenMint);
  const newEdition = await getEdition(newMint);
  const masterEdition = await getEdition(tokenMint);

  const data = Buffer.from([3]);

  const keys = [
    {
      pubkey: toPublicKey(newMetadataKey),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(newEdition),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(masterEdition),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(newMint),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(newMintAuthority),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(printingMint),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(authorizationTokenHoldingAccount),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(burnAuthority),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(payer),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(updateAuthorityOfMaster),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(masterMetadataKey),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: programIds().token,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];

  if (reservationList) {
    keys.push({
      pubkey: toPublicKey(reservationList),
      isSigner: false,
      isWritable: true,
    });
  }
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data,
    }),
  );
}

export async function mintNewEditionFromMasterEditionViaToken(
  newMint,
  tokenMint,
  newMintAuthority,
  newUpdateAuthority,
  tokenOwner,
  tokenAccount,
  instructions,
  payer,
  edition,
) {
  const metadataProgramId = programIds().metadata;

  const newMetadataKey = await getMetadata(newMint);
  const masterMetadataKey = await getMetadata(tokenMint);
  const newEdition = await getEdition(newMint);
  const masterEdition = await getEdition(tokenMint);
  const editionMarkPda = await getEditionMarkPda(tokenMint, edition);

  const data = Buffer.from([11, ...edition.toArray('le', 8)]);

  const keys = [
    {
      pubkey: toPublicKey(newMetadataKey),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(newEdition),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(masterEdition),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(newMint),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(editionMarkPda),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(newMintAuthority),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(payer),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(tokenOwner),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(tokenAccount),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(newUpdateAuthority),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(masterMetadataKey),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: programIds().token,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];

  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data,
    }),
  );
}

export async function updatePrimarySaleHappenedViaToken(
  metadata,
  owner,
  tokenAccount,
  instructions,
) {
  const metadataProgramId = programIds().metadata;

  const data = Buffer.from([4]);

  const keys = [
    {
      pubkey: toPublicKey(metadata),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(owner),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(tokenAccount),
      isSigner: false,
      isWritable: false,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data,
    }),
  );
}

export async function deprecatedCreateReservationList(
  metadata,
  masterEdition,
  resource,
  updateAuthority,
  payer,
  instructions,
) {
  const metadataProgramId = programIds().metadata;

  const reservationList = await deprecatedGetReservationList(
    masterEdition,
    resource,
  );
  const data = Buffer.from([6]);

  const keys = [
    {
      pubkey: toPublicKey(reservationList),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(payer),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(updateAuthority),
      isSigner: true,
      isWritable: false,
    },

    {
      pubkey: toPublicKey(masterEdition),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(resource),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(metadata),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data,
    }),
  );
}

export async function signMetadata(
  metadata,
  creator,
  instructions,
) {
  const metadataProgramId = programIds().metadata;

  const data = Buffer.from([7]);

  const keys = [
    {
      pubkey: toPublicKey(metadata),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(creator),
      isSigner: true,
      isWritable: false,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data,
    }),
  );
}

export async function deprecatedMintPrintingTokens(
  destination,
  printingMint,
  updateAuthority,
  metadata,
  masterEdition,
  supply,
  instructions,
) {
  const PROGRAM_IDS = programIds();
  const metadataProgramId = PROGRAM_IDS.metadata;

  const value = new MintPrintingTokensArgs({ supply });
  const data = Buffer.from(serialize(METADATA_SCHEMA, value));

  const keys = [
    {
      pubkey: toPublicKey(destination),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(printingMint),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(updateAuthority),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(metadata),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: toPublicKey(masterEdition),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: PROGRAM_IDS.token,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data,
    }),
  );
}

export async function convertMasterEditionV1ToV2(
  masterEdition,
  oneTimeAuthMint,
  printingMint,
  instructions,
) {
  const metadataProgramId = programIds().metadata;

  const data = Buffer.from([12]);

  const keys = [
    {
      pubkey: toPublicKey(masterEdition),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(oneTimeAuthMint),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: toPublicKey(printingMint),
      isSigner: false,
      isWritable: true,
    },
  ];
  instructions.push(
    new TransactionInstruction({
      keys,
      programId: toPublicKey(metadataProgramId),
      data,
    }),
  );
}

export async function getEdition(
  tokenMint,
) {
  const PROGRAM_IDS = programIds();

  return (
    await findProgramAddress(
      [
        Buffer.from(METADATA_PREFIX),
        toPublicKey(PROGRAM_IDS.metadata).toBuffer(),
        toPublicKey(tokenMint).toBuffer(),
        Buffer.from(EDITION),
      ],
      toPublicKey(PROGRAM_IDS.metadata),
    )
  )[0];
}

export async function getMetadata(
  tokenMint,
) {
  const PROGRAM_IDS = programIds();

  return (
    await findProgramAddress(
      [
        Buffer.from(METADATA_PREFIX),
        toPublicKey(PROGRAM_IDS.metadata).toBuffer(),
        toPublicKey(tokenMint).toBuffer(),
      ],
      toPublicKey(PROGRAM_IDS.metadata),
    )
  )[0];
}

export async function deprecatedGetReservationList(
  masterEdition,
  resource,
) {
  const PROGRAM_IDS = programIds();

  return (
    await findProgramAddress(
      [
        Buffer.from(METADATA_PREFIX),
        toPublicKey(PROGRAM_IDS.metadata).toBuffer(),
        toPublicKey(masterEdition).toBuffer(),
        Buffer.from(RESERVATION),
        toPublicKey(resource).toBuffer(),
      ],
      toPublicKey(PROGRAM_IDS.metadata),
    )
  )[0];
}

export async function getEditionMarkPda(
  mint,
  edition,
){
  const PROGRAM_IDS = programIds();
  const editionNumber = Math.floor(edition.toNumber() / 248);

  return (
    await findProgramAddress(
      [
        Buffer.from(METADATA_PREFIX),
        toPublicKey(PROGRAM_IDS.metadata).toBuffer(),
        toPublicKey(mint).toBuffer(),
        Buffer.from(EDITION),
        Buffer.from(editionNumber.toString()),
      ],
      toPublicKey(PROGRAM_IDS.metadata),
    )
  )[0];
}
