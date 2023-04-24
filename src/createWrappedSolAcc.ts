import { connection, owner } from '../config'

import { createWrappedNativeAccount } from "@solana/spl-token";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";

export async function createWrappedSolAccount(amount : number) {
    const wrappedSOLMintAcc = await createWrappedNativeAccount(connection, owner, owner.publicKey, amount * LAMPORTS_PER_SOL)
    console.log(wrappedSOLMintAcc)
    return wrappedSOLMintAcc
}
createWrappedSolAccount(0.0001)