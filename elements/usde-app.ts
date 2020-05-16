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
                    <a class="usde-token-card" href="/">
                        <div class="usde-amount-usd-text">${totalResult === 'Loading...' ? 'Loading...' : formatBigNumberUSDForDisplay(totalResult)}</div>
                        <div class="usde-description-text">Total USD on Ethereum</div>
                    </a>
                </div>

                <div class="usde-token-card-container">
                    ${state.usdTokens.map((usdToken: Readonly<USDToken>) => {
                        return html`
                            <a class="usde-token-card" href="${usdToken.href}" target="_blank">
                                <div class="be-amount-usd-text">${usdToken.totalSupply === 'NOT_SET' ? 'Loading...' : formatBigNumberUSDForDisplay(usdToken.totalSupply)}</div>
                                <div class="be-description-text">${usdToken.name}</div>
                            </a>
                        `;
                    })}
                </div>

                <div style="color: grey; display: flex; flex-direction: column; align-items: center; font-size: calc(10px + 1vmin); margin-top: calc(50px + 1vmin);">
                    <div>Feedback: <a href="https://t.me/lastmjs" target="_blank">@lastmjs</a></div>
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