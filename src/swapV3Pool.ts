import { AmmV3, ApiAmmV3PoolsItem, buildTransaction, Percent, Token, TokenAmount, TxVersion } from '@raydium-io/raydium-sdk'
import {Connection, Keypair, PublicKey} from '@solana/web3.js'
import { connection, owner } from '../config'
import { getComputeBudgetConfig, getWalletTokenAccount, sendTx, isConfimedTx } from './util'
import poolData from './poolData.json'
import { createWrappedSolAccount } from "./findWrappedSol";
import { unWrapSol } from "./unWrappSol"

export async function swapV3Pool(connection: Connection, owner : Keypair, amount : number, baseToken : Token, quoteToken : Token , poolId : string, slippage : Percent, isOppositeSwap : boolean) {

    const { inputToken, outputToken } = isOppositeSwap ? ({ inputToken: quoteToken, outputToken: baseToken }) : ({ inputToken: baseToken, outputToken: quoteToken })

    const wrappedSolAccount =  await createWrappedSolAccount(amount)
    console.log('wrappedSolAccount', wrappedSolAccount)

    const targetPool = poolId

    const inputTokenAmount = new TokenAmount(inputToken, amount * 10**inputToken.decimals)

    const walletTokenAccounts = await getWalletTokenAccount(connection, owner.publicKey)

    const ammV3Pool = poolData as ApiAmmV3PoolsItem[]

    const { [targetPool]: ammV3PoolInfo} = await AmmV3.fetchMultiplePoolInfos({
        connection,
        poolKeys: ammV3Pool,
        chainTime: new Date().getTime() / 1000,
    })

    if (!ammV3PoolInfo) {
        throw new Error(`TargetPool doesn't exist. Check your TargetPool id ${poolId}`)
    }

    const tickCache = await AmmV3.fetchMultiplePoolTickArrays({
        connection,
        poolKeys: [ammV3PoolInfo.state],
        batchRequest: true,
    })

    const { minAmountOut, remainingAccounts } = await AmmV3.computeAmountOutFormat({
        poolInfo: ammV3PoolInfo.state,
        tickArrayCache: tickCache[targetPool],
        amountIn: inputTokenAmount,
        currencyOut: outputToken,
        slippage: slippage,
    })

    const { innerTransactions } = await AmmV3.makeSwapBaseInInstructionSimple({
        connection,
        poolInfo: ammV3PoolInfo.state,
        ownerInfo: {
            feePayer: owner.publicKey,
            wallet: owner.publicKey,
            tokenAccounts: walletTokenAccounts,
        },
        inputMint: inputTokenAmount.token.mint,
        amountIn: inputTokenAmount.raw,
        amountOutMin: minAmountOut.raw,
        remainingAccounts,
        computeBudgetConfig: await getComputeBudgetConfig()
    })

    innerTransactions[0].instructions = [innerTransactions[0].instructions[0], innerTransactions[0].instructions[1], ...wrappedSolAccount, innerTransactions[0].instructions[2]]

    const transactions = await buildTransaction({
        connection,
        txType: TxVersion.LEGACY,
        payer: owner.publicKey,
        innerTransactions: innerTransactions,
    })

    const transactionSignature = await sendTx(connection, owner, TxVersion.LEGACY, transactions)
    console.log('transactionSignature',transactionSignature)
    const transactionId: string = transactionSignature[0];
    const confirmedTx = await isConfimedTx(connection, transactionId)
    const unWrappingSol = await unWrapSol()
    console.log('unWrappingSol',unWrappingSol)
    return { transactionIds: transactionSignature, result: confirmedTx}

}

const slippage = new Percent(1, 1000)

export function idToToken(mintAddress : string, decimal : number) : Token {
    return new Token(new PublicKey(mintAddress), decimal)
}

const baseToken = idToToken("2G4ZBQH8zHVpyo76CZJJVCPJZ1K2XCkvswfzmyvj5mmJ", 9)

const quoteToken = idToToken("CfJHKeQgNQUrscsNmCL27Vfeh3YVZrSY3rcGhGMc9wcJ", 9)

const solToken = idToToken("So11111111111111111111111111111111111111112", 9)
console.log('solToken',solToken)

swapV3Pool(connection, owner, 0.0001, solToken, baseToken, "99xdHQhPF5qwHh8kvWY71DU78en2aXGBMRto5t9dXZWq", slippage ,false)

