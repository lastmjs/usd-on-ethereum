import { html, render as litRender } from 'lit-html';
import { createObjectStore } from 'reduxular';
import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';

type State = {
    readonly usdTokens: ReadonlyArray<USDToken>;
};

type USDToken = {
    readonly name: string;
    readonly decimals: number;
    readonly totalSupply: BigNumber | 'NOT_SET';
    readonly contractAddress: string;
    readonly abi: Array<string>;
    readonly functionName: string;
    readonly href: string | 'NOT_SET';
};

const InitialState: Readonly<State> = {
    usdTokens: [
        {
            name: 'USDC',
            decimals: 6,
            totalSupply: 'NOT_SET',
            contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
        },
        {
            name: 'DAI',
            decimals: 18,
            totalSupply: 'NOT_SET',
            contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f'
        },
        {
            name: 'USDT',
            decimals: 6,
            totalSupply: 'NOT_SET',
            contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7'
        },
        {
            name: 'TUSD',
            decimals: 18,
            totalSupply: 'NOT_SET',
            contractAddress: '0x0000000000085d4780B73119b644AE5ecd22b376',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x0000000000085d4780B73119b644AE5ecd22b376'
        },
        {
            name: 'BUSD',
            decimals: 18,
            totalSupply: 'NOT_SET',
            contractAddress: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x4Fabb145d64652a948d72533023f6E7A623C7C53'
        },
        {
            name: 'GUSD',
            decimals: 2,
            totalSupply: 'NOT_SET',
            contractAddress: '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x056fd409e1d7a124bd7017459dfea2f387b6d5cd'
        },
        {
            name: 'PAX',
            decimals: 18,
            totalSupply: 'NOT_SET',
            contractAddress: '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x8e870d67f660d95d5be530380d0ec0bd388289e1'
        },
        {
            name: 'HUSD',
            decimals: 8,
            totalSupply: 'NOT_SET',
            contractAddress: '0xdf574c24545e5ffecb9a659c229253d4111d87e1',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0xdf574c24545e5ffecb9a659c229253d4111d87e1?a=0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2'
        },
        {
            name: 'sUSD',
            decimals: 18,
            totalSupply: 'NOT_SET',
            contractAddress: '0x57ab1e02fee23774580c119740129eac7081e9d3',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x57ab1e02fee23774580c119740129eac7081e9d3'
        },
        {
            name: 'USDK',
            decimals: 18,
            totalSupply: 'NOT_SET',
            contractAddress: '0x1c48f86ae57291f7686349f12601910bd8d470bb',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x1c48f86ae57291f7686349f12601910bd8d470bb'
        },
        {
            name: 'USDQ',
            decimals: 18,
            totalSupply: 'NOT_SET',
            contractAddress: '0x4954db6391f4feb5468b6b943d4935353596aec9',
            abi: [
                'function totalSupply() public view returns (uint256 supply)'
            ],
            functionName: 'totalSupply',
            href: 'https://etherscan.io/token/0x4954db6391f4feb5468b6b943d4935353596aec9'
        }
    ]
};

class USDEApp extends HTMLElement {
    readonly store = createObjectStore(InitialState, (state: Readonly<State>) => litRender(this.render(state), this), this);

    constructor() {
        super();

        const provider: Readonly<ethers.providers.BaseProvider> = ethers.getDefaultProvider('homestead');

        (async () => {

            // TODO I am trying to get the events that I need to get historical minting of USD tokens on Ethereum
            // const logs = await provider.getLogs({
            //     fromBlock: 0,
            //     topics: []
            // });

            const usdTokensUnsorted: ReadonlyArray<USDToken> = await Promise.all(this.store.usdTokens.map(async (usdToken: Readonly<USDToken>) => {

                const totalSupply: BigNumber = (await getTotalSupply(usdToken, provider)).div(10 ** usdToken.decimals);

                return {
                    ...usdToken,
                    totalSupply
                };
            }));

            const usdTokensSorted: ReadonlyArray<USDToken> = [...usdTokensUnsorted].sort((a, b) => {

                if (
                    a.totalSupply === 'NOT_SET' ||
                    b.totalSupply === 'NOT_SET'
                ) {
                    return 0;
                }

                if (a.totalSupply.lt(b.totalSupply)) {
                    return 1;
                }

                if (a.totalSupply.gt(b.totalSupply)) {
                    return -1;
                }

                return 0;
            });

            this.store.usdTokens = usdTokensSorted;
        })();
    }

    render(state: Readonly<State>) {

        const totalResult: BigNumber | 'Loading...' = state.usdTokens.reduce((result: BigNumber | 'Loading...', usdToken: Readonly<USDToken>) => {
            if (result === 'Loading...') {
                return result;
            }

            if (usdToken.totalSupply === 'NOT_SET') {
                return 'Loading...';
            }

            return result.plus(usdToken.totalSupply);
        }, new BigNumber(0));

        const hoverText: string = 'The USD amount shown represents the total token supply, and may not reflect the true market price';

        return html`
            <style>
                body {
                    background-color: white;
                    font-family: sans-serif;
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                }

                .usde-token-main-container {
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    padding: calc(50px + 1vmin);
                }

                .usde-token-card-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .usde-token-card {
                    color: orange;
                    border: solid 5px grey;
                    padding: calc(25px + 1vmin);
                    margin: calc(5px + 1vmin);
                    border-radius: calc(5px + 1vmin);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    text-decoration: none;
                }

                .usde-amount-usd-text {
                    color: green;
                    font-size: calc(50px + 1vmin);
                }

                .usde-description-text {
                    color: grey;
                    font-size: calc(25px + 1vmin);
                }
            </style>

            <div style="position: fixed; opacity: .25; right: 25px; bottom: 25px">
                <img src="dollar.jpg" style="max-height: 10vh">
            </div>

            <div style="position: fixed; opacity: .25; left: 25px; top: 25px">
                <img src="ethereum.png" style="max-height: 10vh">
            </div>

            <div class="usde-token-main-container">
                <div style="display: flex; justify-content: center">
                    <a class="usde-token-card" href="/" title="${hoverText}">
                        <div class="usde-amount-usd-text">${totalResult === 'Loading...' ? 'Loading...' : formatBigNumberUSDForDisplay(totalResult)}</div>
                        <div class="usde-description-text">Total USD on Ethereum</div>
                    </a>
                </div>

                <div class="usde-token-card-container">
                    ${state.usdTokens.map((usdToken: Readonly<USDToken>) => {
                        return html`
                            <a class="usde-token-card" href="${usdToken.href}" target="_blank" title="${hoverText}">
                                <div class="usde-amount-usd-text">${usdToken.totalSupply === 'NOT_SET' ? 'Loading...' : formatBigNumberUSDForDisplay(usdToken.totalSupply)}</div>
                                <div class="usde-description-text">${usdToken.name}</div>
                            </a>
                        `;
                    })}
                </div>

                <div style="color: grey; display: flex; flex-direction: column; align-items: center; font-size: calc(10px + 1vmin); margin-top: calc(50px + 1vmin);">
                    <div>Feedback (especially any missed tokens): <a href="https://twitter.com/lastmjs" target="_blank">Twitter</a>,<a href="https://t.me/lastmjs" target="_blank">Telegram</a>,<a href="mailto:jordan.michael.last@gmail.com">Email</a></div>
                    <div><a href="privacy.html">Privacy</a></div>
                    <div><a href="oss-attribution/attribution.txt">Open Source</a></div>
                </div>
            </div>
        `;
    }
}

window.customElements.define('usde-app', USDEApp);

async function getTotalSupply(usdToken: Readonly<USDToken>, provider: Readonly<ethers.providers.BaseProvider>): Promise<BigNumber> {
    const contract = new ethers.Contract(usdToken.contractAddress, usdToken.abi, provider);
    return new BigNumber((await contract[usdToken.functionName]()).toString());
}

function formatBigNumberUSDForDisplay(bigNumber: BigNumber): string {
    return bigNumber.toFormat(2, {
        groupSize: 3,
        groupSeparator: ',',
        decimalSeparator: '.',
        prefix: '$'
    });
}