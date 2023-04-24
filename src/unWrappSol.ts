import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAccount, closeAccount }  from "@solana/spl-token";
import { owner } from "../config"
import { getWalletTokenAccount } from "./util"

const connection = new Connection('https://api.mainnet-beta.solana.com');
const wSoltokenAccount = new PublicKey("3TgkCiyqrZP8BfbfV2HJDMp1uLA3rgyv5P2Nfiemuzii");


export async function unWrapSol() {

    const allAccounts = await getWalletTokenAccount(connection, owner.publicKey)

    let testToken1Address: PublicKey;
    allAccounts.filter(acc => acc.accountInfo.mint.toBase58() === "So11111111111111111111111111111111111111112").map(async (acc) => {
        testToken1Address = acc.pubkey;
        console.log('testToken1Address',testToken1Address)
        const accBalance = await connection.getTokenAccountBalance(testToken1Address);
        const tokenBal = accBalance.value.uiAmount || 0;
        const closeWSOLAccount = await closeAccount(connection, owner, testToken1Address, owner.publicKey, owner);
    });
}
