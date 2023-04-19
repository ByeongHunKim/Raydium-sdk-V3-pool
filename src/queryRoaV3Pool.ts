import {
  ApiAmmV3PoolsItem,
  ENDPOINT,
} from '@raydium-io/raydium-sdk'
import { RAYDIUM_MAINNET_API, TARGET_POOL } from '../config'
import fetch from 'isomorphic-fetch';

async function queryRoaV3Pool()  {
  const ammV3Pools = (await fetch(ENDPOINT + RAYDIUM_MAINNET_API.ammV3Pools).then((res) => res.json())).data
  const ammV3Pool = ammV3Pools.find((pool: ApiAmmV3PoolsItem) => pool.id === TARGET_POOL)
  console.log('ammV3Pool',ammV3Pool)
}

queryRoaV3Pool()