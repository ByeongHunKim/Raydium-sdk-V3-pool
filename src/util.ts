import { SPL_ACCOUNT_LAYOUT, TOKEN_PROGRAM_ID, TxVersion, ComputeBudgetConfig } from '@raydium-io/raydium-sdk';
import { Connection, Keypair, PublicKey, SendOptions, Transaction } from '@solana/web3.js'; // if not use Txversion.LEGACY, have to use VersionedTransaction intead of Transaction above
import axios from "axios";

export async function sendTx(
    connection: Connection,
    payer: Keypair,
    txVersion: TxVersion.LEGACY,
    txs: Transaction[],
    options?: SendOptions
): Promise<string[]>{
    const txids: string[] = [];
    for (const iTx of txs) {
        txids.push(await connection.sendTransaction(iTx as Transaction, [payer], options));
    }
    return txids;
}


export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey) {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
}

export async function getComputeBudgetConfig(): Promise<ComputeBudgetConfig | undefined> {
    const res = await axios.get('https://solanacompass.com/api/fees')
    const json = res.data
    const { avg } = json?.[15] ?? {}
    if (!avg) return undefined // fetch error
    return {
        units: 400000,
        microLamports: Math.min(Math.ceil((avg * 1000000) / 400000), 25000)
    } as ComputeBudgetConfig
}

export async function isConfimedTx(connection: Connection, transactionSignature: string) {
    const confirmation = await connection.confirmTransaction(transactionSignature, "confirmed");
    return confirmation
}
