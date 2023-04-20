# RAYDIUM SDK demo

## About the project
 [Reference](https://github.com/raydium-io/raydium-sdk) make swap transaction on V3(concentrate pool) pool  

## Getting Started
### Installation

`yarn install`

### Prerequisites
Modify `config.ts.template` to fit your configuration, and rename it to `config.ts`

- `<YOUR_WALLET_SECRET_KEY>`: replace to wallet private key ( i used solFlare wallet )
- `<YOUR_RPC_URL>`: replace to your prefer one ( default : https://api.mainnet-beta.solana.com)
- `<TEST_TARGET_POOL>` : replace to pool id that you want to test target
- `<TARGET_POOL>` : replace to pool id that you want to main target


## about code
### AmmV3.fetchMultiplePoolTickArrays()
- AmmV3 프로토콜에서 사용되는 fetchMultiplePoolTickArrays 메서드를 사용하여 여러 AMM 풀의 Tick 배열을 가져오는 기능. 여기서 tick은 AMM 풀에서 가격을 결정하는 구간을 나타내는 것으로, 가격이 범위 내에 있을 때 AMM 풀에서 일정한 비율로 자산을 교환
이 코드에서 fetchMultiplePoolTickArrays 메서드는 poolKeys 배열에 지정된 각 AMM 풀에 대한 Tick 배열을 가져와서 tickCache 변수에 저장. batchRequest 옵션은 여러 AMM 풀에 대한 Tick 배열을 한 번에 가져오기 위해 사용됩니다. 결과적으로 여러 AMM 풀에 대한 Tick 배열을 일괄적으로 가져와서 캐시에 저장하는 기능을 수행
### AmmV3.computeAmountOutFormat()
- Tick 배열과 함께 사용되는 결과 값
  - minAmountOut: 출력 토큰의 최소 양 
    - minAmountOut은 AMM 풀에서 거래할 때 출력 토큰의 최소 양을 나타내며, 이 값은 거래를 실행하기 전에 계산. 만약 실제 거래 가격이 minAmountOut보다 작아서 출력 토큰을 충분히 받을 수 없는 경우, 거래는 실패하고 트랜잭션이 실행되지 않음.
만약 minAmountOut이 100이고 실제 거래에서 출력 토큰을 90밖에 받지 못하는 경우, 거래는 실패. 이는 AMM 풀에서 거래 가격을 산출할 때, slippage 값과 함께 minAmountOut 값이 사용되기 때문입니다.
    - V3 Pool swap트랜잭션에서는 `OtherAmountThreshold` 값이 `minAmountOut` 값을 의미한다
  - remainingAccounts: 거래를 수행할 때 필요한 송신자와 수신자의 계정
- computeAmountOutFormat() 매개변수
  - poolInfo: AMM 풀에 대한 정보
  - tickArrayCache: AMM 풀에서 사용되는 Tick 배열
  - amountIn: 입력 토큰의 양
  - currencyOut: 출력 토큰
  - slippage: 슬리피지 (거래 가격의 허용 오차)
- 결과
  - AMM 풀에서 입력 토큰을 주어졌을 때, 출력 토큰의 최소 양과 거래를 수행할 때 필요한 계정 정보를 계산하고 이후에 이 값을 사용하여 실제 거래를 수행
