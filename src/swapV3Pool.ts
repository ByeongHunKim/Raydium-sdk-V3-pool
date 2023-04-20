import { AmmV3, ApiAmmV3PoolsItem, buildTransaction, Percent, Token, TokenAmount } from '@raydium-io/raydium-sdk'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { connection, ENDPOINT, RAYDIUM_MAINNET_API, wallet, wantBuildTxVersion } from '../config'
import { getComputeBudgetConfig, getWalletTokenAccount, sendTx } from './util'

// todo 직접 만드신 axios 상대경로로 수정 필요
import axios from "axios";

export async function swapV3Pool(amount : number, baseToken : string, quoteToken : string, poolId : string, slippageNum : number, isOppositeSwap : boolean) {

    let inputToken = new Token(new PublicKey(baseToken), 9) // test1 token
    let outputToken = new Token(new PublicKey(quoteToken), 9) // test2 token

    if(isOppositeSwap){
        inputToken = new Token(new PublicKey(quoteToken), 9) // test1 token
        outputToken = new Token(new PublicKey(baseToken), 9) // test2 token
    }

    const targetPool = poolId // 2G4ZBQ / CfJHKe pool
    const inputTokenAmount = new TokenAmount(inputToken, amount * LAMPORTS_PER_SOL)
    const slippage = new Percent(slippageNum, 100)
    const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)

    const ammV3Pool = (await axios.get(ENDPOINT + RAYDIUM_MAINNET_API.ammV3Pools)).data.data.filter(
        (pool: ApiAmmV3PoolsItem) => pool.id === targetPool
    )
    console.log('ammV3Pool',ammV3Pool)
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
        computeBudgetConfig: await getComputeBudgetConfig() // https://github.com/raydium-io/raydium-frontend/blob/master/src/application/swap/txSwap.ts#L54
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

/*
basic swap baseToken -> quoteToken ( isOppositeSwap = false )
- https://solscan.io/tx/2wTg9rpDgmF66BK3jgUQi8Ubcj9J8YKq3sa89S7Y7XUJBtk23hKgF3B7fFyxdEef5wWXvchbTGsCdz7KGN2FATfR

opposite swap quote Token -> base Token ( isOppositeSwap = true )
- https://solscan.io/tx/2PJYkggjVcersgz6L4VQwVsTfs44zEuj8GL1cbqCcapt8N1CqiCoYe6qZ7qWie9pKSEx61YL8dPxgrXw995uerf5
 */
