import { AmmV3, ApiAmmV3PoolsItem, buildTransaction, Percent, Token, TokenAmount } from '@raydium-io/raydium-sdk'
import { PublicKey } from '@solana/web3.js'

import {
    connection,
    ENDPOINT,
    RAYDIUM_MAINNET_API,
    TEST_BASE_TOKEN,
    TEST_QUOTE_TOKEN, TEST_TARGET_POOL,
    wallet,
    wantBuildTxVersion
} from '../config'
import { getWalletTokenAccount, sendTx } from './util'
import fetch from 'isomorphic-fetch';

export async function swapV3Pool(amount : number, isTest : boolean) {

    const inputToken = new Token(new PublicKey(TEST_BASE_TOKEN), 9) // test1
    const outputToken = new Token(new PublicKey(TEST_QUOTE_TOKEN), 9) // test2
    const targetPool = TEST_TARGET_POOL // 2G4ZBQ / CfJHKe pool
    const inputTokenAmount = new TokenAmount(inputToken, amount * 10**9)
    const slippage = new Percent(1, 100)
    const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)

    if(!isTest){
        console.log('in progress to swap in ROA/SOL v3 POOL')
        /*
        const inputToken = new Token(new PublicKey(TEST_BASE_TOKEN), 9, 'Unrecognized Token', 'Unrecognized Token') // test1
        const outputToken = new Token(new PublicKey(TEST_QUOTE_TOKEN), 9, 'Unrecognized Token', 'Unrecognized Token') // test2
        const targetPool = TEST_TARGET_POOL // 2G4ZBQ / CfJHKe pool
        이 세 가지가 ROA/SOL 용으로 바뀌어야 한다
        그러면 저 세 가지 변수는 let 으로 ?
         */
        return [];
    }

    const ammV3Pool = (await (await fetch(ENDPOINT + RAYDIUM_MAINNET_API.ammV3Pools)).json()).data.filter(
        (pool: ApiAmmV3PoolsItem) => pool.id === targetPool
    )
    const { [targetPool]: ammV3PoolInfo } = await AmmV3.fetchMultiplePoolInfos({
        connection,
        poolKeys: ammV3Pool,
        chainTime: new Date().getTime() / 1000,
    })

    const tickCache = await AmmV3.fetchMultiplePoolTickArrays({
        connection,
        poolKeys: [ammV3PoolInfo.state],
        batchRequest: true,
    })
    console.log('tickCache', tickCache)


    const { minAmountOut, remainingAccounts } = AmmV3.computeAmountOutFormat({
        poolInfo: ammV3PoolInfo.state,
        tickArrayCache: tickCache[targetPool],
        amountIn: inputTokenAmount,
        currencyOut: outputToken,
        slippage: slippage,
    })
    console.log('minAmountOut', minAmountOut)
    console.log('remainingAccounts',remainingAccounts)

    const { innerTransactions } = await AmmV3.makeSwapBaseInInstructionSimple({
        connection,
        poolInfo: ammV3PoolInfo.state,
        ownerInfo: {
            feePayer: wallet.publicKey,
            wallet: wallet.publicKey,
            tokenAccounts: walletTokenAccounts,
        },
        inputMint: inputTokenAmount.token.mint,
        amountIn: inputTokenAmount.raw,
        amountOutMin: minAmountOut.raw,
        remainingAccounts,
        computeBudgetConfig: {units: 400000, microLamports: 25000} // https://github.com/raydium-io/raydium-frontend/blob/master/src/application/swap/txSwap.ts#L54
    })
    console.log('innerTransactions',innerTransactions)

    const transactions = await buildTransaction({
        connection,
        txType: wantBuildTxVersion,
        payer: wallet.publicKey,
        innerTransactions: innerTransactions,
    })
    console.log('transactions', transactions)

    const transactionSignature = await sendTx(connection, wallet, wantBuildTxVersion, transactions)
    console.log('transactionIds',transactionSignature)
    return { transactionIds: transactionSignature }
}


