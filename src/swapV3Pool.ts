import { AmmV3, ApiAmmV3PoolsItem, buildTransaction, Percent, Token, TokenAmount } from '@raydium-io/raydium-sdk'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { connection, ENDPOINT, RAYDIUM_MAINNET_API, wallet, wantBuildTxVersion } from '../config'
import { getComputeBudgetConfig, getWalletTokenAccount, sendTx, isConfimedTx } from './util'

// todo 직접 만드신 axios 상대경로로 수정 필요
import axios from "axios";

export async function swapV3Pool(amount : number, baseToken : string, quoteToken : string, poolId : string, slippageNumerator : number, slippageDenominator : number, isOppositeSwap : boolean) {

    let inputToken = new Token(new PublicKey(baseToken), 9) // test1 token
    let outputToken = new Token(new PublicKey(quoteToken), 9) // test2 token

    if(isOppositeSwap){
        inputToken = new Token(new PublicKey(quoteToken), 9) // test2 token
        outputToken = new Token(new PublicKey(baseToken), 9) // test1 token
    }

    const targetPool = poolId // 2G4ZBQ / CfJHKe pool
    const inputTokenAmount = new TokenAmount(inputToken, amount * LAMPORTS_PER_SOL)
    const slippage = new Percent(slippageNumerator, slippageDenominator) // 분자 numerator, 분모 denominator 1, 1000 -> 0.1%

    try {
        // todo raydium backend로 요청 보내는 것은 지양해야 하는데,, 작업 필요
        const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)
        const ammV3Pool = (await axios.get(ENDPOINT + RAYDIUM_MAINNET_API.ammV3Pools)).data.data.filter(
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
                feePayer: wallet.publicKey,
                wallet: wallet.publicKey,
                tokenAccounts: walletTokenAccounts,
            },
            inputMint: inputTokenAmount.token.mint,
            amountIn: inputTokenAmount.raw,
            amountOutMin: minAmountOut.raw, // 교환 후 최소한으로 얻어야 하는 출력 토큰의 양
            remainingAccounts,
            computeBudgetConfig: await getComputeBudgetConfig() // https://github.com/raydium-io/raydium-frontend/blob/master/src/application/swap/txSwap.ts#L54
        })

        const transactions = await buildTransaction({
            connection,
            txType: wantBuildTxVersion,
            payer: wallet.publicKey,
            innerTransactions: innerTransactions,
        })

        const transactionSignature = await sendTx(connection, wallet, wantBuildTxVersion, transactions)
        const transactionId: string = transactionSignature[0];
        const confirmedTx = await isConfimedTx(connection, transactionId)
        console.log('Transaction result >>', transactionSignature, confirmedTx)
        return { transactionIds: transactionSignature, result: confirmedTx}
    } catch (err) {
        console.error(err)
        return { transactionIds: [], result: false }
    }
}


/*
basic swap baseToken -> quoteToken ( isOppositeSwap = false )
- https://solscan.io/tx/2wTg9rpDgmF66BK3jgUQi8Ubcj9J8YKq3sa89S7Y7XUJBtk23hKgF3B7fFyxdEef5wWXvchbTGsCdz7KGN2FATfR

opposite swap quote Token -> base Token ( isOppositeSwap = true )
- https://solscan.io/tx/2PJYkggjVcersgz6L4VQwVsTfs44zEuj8GL1cbqCcapt8N1CqiCoYe6qZ7qWie9pKSEx61YL8dPxgrXw995uerf5
 */
