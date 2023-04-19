import {
    SPL_ACCOUNT_LAYOUT,
    TOKEN_PROGRAM_ID,
    TxVersion,
} from '@raydium-io/raydium-sdk';
import {
    Connection,
    Keypair,
    PublicKey,
    SendOptions,
    Transaction,
    VersionedTransaction,
} from '@solana/web3.js';


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
};


export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey) {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
}
