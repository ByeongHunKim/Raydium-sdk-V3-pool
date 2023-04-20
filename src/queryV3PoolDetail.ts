import { AmmV3, ApiAmmV3PoolsItem, ENDPOINT } from '@raydium-io/raydium-sdk'
import { connection, RAYDIUM_MAINNET_API, TEST_TARGET_POOL, wallet } from '../config'
import fetch from 'isomorphic-fetch';
import { getWalletTokenAccount } from "./util";

async function queryTestV3Pool()  {
    const ammV3Pools = (await fetch(ENDPOINT + RAYDIUM_MAINNET_API.ammV3Pools).then((res) => res.json())).data
    const ammV3Pool = ammV3Pools.find((pool: ApiAmmV3PoolsItem) => pool.id === TEST_TARGET_POOL)

    // -------- step 1: ammV3 info and ammV3 position --------
    const { [ammV3Pool.id]: sdkParsedAmmV3Info } = await AmmV3.fetchMultiplePoolInfos({
        connection,
        poolKeys: [ammV3Pool],
        chainTime: new Date().getTime() / 1000,
        ownerInfo: {
            wallet: wallet.publicKey,
            tokenAccounts: await getWalletTokenAccount(connection, wallet.publicKey),
        },
    })
    console.log('sdkParsedAmmV3Info',sdkParsedAmmV3Info)
}

queryTestV3Pool()

/*
sdkParsedAmmV3Info {
  state: {
    id: PublicKey [PublicKey(3nXE3jHLcxAV4cH2n7S7zfe7MtGL77ftWknP8oNUsjNE)] {
      _bn: <BN: 2960af8b598257a48bf11eff217faa66a373f59f257e9031ec6a50db27af0457>
    },
    mintA: {
      mint: [PublicKey [PublicKey(2G4ZBQH8zHVpyo76CZJJVCPJZ1K2XCkvswfzmyvj5mmJ)]],
      vault: [PublicKey [PublicKey(53p4jGSNKQJQUuHbHbowPwjbf11RC8qhncMVVzV34Sd)]],
      decimals: 9
    },
    mintB: {
      mint: [PublicKey [PublicKey(CfJHKeQgNQUrscsNmCL27Vfeh3YVZrSY3rcGhGMc9wcJ)]],
      vault: [PublicKey [PublicKey(9Ncn9Vx9uEhGR8BodX5BeCuCjHLL4wQSfE1g3eoUoKve)]],
      decimals: 9
    },
    observationId: PublicKey [PublicKey(8bAccJ4ot8YiYpfamBUWoPzPmYp1ApZcFPQf9QcxTuS6)] {
      _bn: <BN: 70c26d2fbca50802e419a9a36add4dfcd770c79ed9164dcd0aa3318c82f0f41f>
    },
    ammConfig: {
      id: [PublicKey [PublicKey(4BLNHtVe942GSs4teSZqGX24xwKNkqU7bGgNn3iUiUpw)]],
      index: 0,
      protocolFeeRate: 120000,
      tradeFeeRate: 100,
      tickSpacing: 10,
      fundFeeRate: 40000,
      fundOwner: 'FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4',
      description: 'Best for very stable pairs'
    },
    creator: PublicKey [PublicKey(5FWMRjwN8suRhq4Ak9gKnKxxFw4c75T9y6rjdayHnKbJ)] {
      _bn: <BN: 3f2611518a92bfb063692d2f62b330f38f1ae1b2219a9f7b8d9139220d00d995>
    },
    programId: PublicKey [PublicKey(CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK)] {
      _bn: <BN: a5d5ca9e04cf5db590b714ba2fe32cb159133fc1c192b72257fd07d39cb0401e>
    },
    version: 6,
    tickSpacing: 10,
    liquidity: <BN: 1748a724ba>,
    sqrtPriceX64: <BN: f239a4ecc2e0bc64>,
    currentPrice: 0.8952794546459013196,
    tickCurrent: -1107,
    observationIndex: 40,
    observationUpdateDuration: 15,
    feeGrowthGlobalX64A: <BN: 5616b7f9c032>,
    feeGrowthGlobalX64B: <BN: 5a3103a79c4>,
    protocolFeesTokenA: <BN: 12393>,
    protocolFeesTokenB: <BN: 12c0>,
    swapInAmountTokenA: <BN: 172c26d0e>,
    swapOutAmountTokenB: <BN: 15f14e41c>,
    swapInAmountTokenB: <BN: 17d78400>,
    swapOutAmountTokenA: <BN: 191c0d8f>,
    tickArrayBitmap: [
      <BN: 0>,       <BN: 0>,
      <BN: 0>,       <BN: 0>,
      <BN: 2000000>, <BN: 0>,
      <BN: 0>,       <BN: 0>,
      <BN: 0>,       <BN: 0>,
      <BN: 0>,       <BN: 0>,
      <BN: 0>,       <BN: 2000000>,
      <BN: 0>,       <BN: 0>
    ],
    rewardInfos: [],
    day: {
      volume: 0,
      volumeFee: 0,
      feeA: 0.000431776953048,
      feeB: 0.0000336,
      feeApr: 0,
      rewardApr: [Object],
      apr: 0,
      priceMin: 0.89603763,
      priceMax: 0.9800817
    },
    week: {
      volume: 0,
      volumeFee: 0,
      feeA: 0.000522506193048,
      feeB: 0.0000336,
      feeApr: 0,
      rewardApr: [Object],
      apr: 0,
      priceMin: 0.89603763,
      priceMax: 0.99000129
    },
    month: {
      volume: 0,
      volumeFee: 0,
      feeA: 0.000522506193048,
      feeB: 0.0000336,
      feeApr: 0,
      rewardApr: [Object],
      apr: 0,
      priceMin: 0.89603763,
      priceMax: 0.99000129
    },
    tvl: 0,
    lookupTableAccount: PublicKey [PublicKey(9ME1QHmCANRZCZayoNDcprUm4Rm7dMTVH97W7voM6WUH)] {
      _bn: <BN: 7c0bd18d9c3c243910d63f6deec6477e6d6ae1cec5b76e0f5b651414618f314a>
    }
  }
}

 */