import {useEffect, useState} from "react";
import {Web3AuthNoModal as Web3Auth} from "@web3auth/no-modal";
import {CHAIN_NAMESPACES, SafeEventEmitterProvider, WALLET_ADAPTERS} from "@web3auth/base";
import {OpenloginAdapter} from "@web3auth/openlogin-adapter";
import "./App.css";
import CosmosRPC from "./cosmosRPC";

const clientId =
    "BEWE6XW4hc0zKA6X7_jLBm2ZkZmLtgTmSGS0JZbiFxBnHk3jaDnuO1zr5c-8s8eIqM3X_7ZS9E1aaQLvqTDa7OM";

function App() {
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
        null
    );

    useEffect(() => {
        const init = async () => {
            try {
                const web3auth = new Web3Auth({
                    clientId,
                    chainConfig: {
                        chainNamespace: CHAIN_NAMESPACES.OTHER,
                    },
                    web3AuthNetwork: "testnet"
                });

                const openloginAdapter = new OpenloginAdapter({
                    adapterSettings: {
                        clientId,
                        uxMode: "popup",
                        loginConfig: {
                            jwt: {
                                verifier: "cosmos-auth0-project",
                                typeOfLogin: "jwt",
                                clientId: "m78IMc6Ne3oCSA7Avus3YBpsbeFgN4Ep",
                            },
                        },
                    },
                });
                web3auth.configureAdapter(openloginAdapter);
                setWeb3auth(web3auth);

                await web3auth.init();
                if (web3auth.provider) {
                    setProvider(web3auth.provider);
                }
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, []);

    const login = async () => {
        if (!web3auth) {
            uiConsole("web3auth not initialized yet");
            return;
        }
        const web3authProvider = await web3auth.connectTo(
            WALLET_ADAPTERS.OPENLOGIN,
            {
                loginProvider: "jwt",
                extraLoginOptions: {
                    domain: "https://dev-s0yj54vl8xxv0lzo.us.auth0.com",
                    verifierIdField: "sub",
                },
            }
        );
        setProvider(web3authProvider);
    };

    const authenticateUser = async () => {
        if (!web3auth) {
            uiConsole("web3auth not initialized yet");
            return;
        }
        const idToken = await web3auth.authenticateUser();
        uiConsole(idToken);
    };

    const getUserInfo = async () => {
        if (!web3auth) {
            uiConsole("web3auth not initialized yet");
            return;
        }
        const user = await web3auth.getUserInfo();
        uiConsole(user);
    };

    const logout = async () => {
        if (!web3auth) {
            uiConsole("web3auth not initialized yet");
            return;
        }
        await web3auth.logout();
        setProvider(null);
    };

    const getChainId = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        const rpc = new CosmosRPC(provider);
        const chainId = await rpc.getChainId();
        uiConsole(chainId);
    };
    const getAccounts = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        const rpc = new CosmosRPC(provider);
        const address = await rpc.getAccounts();
        uiConsole(address);
    };

    const getBalance = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        const rpc = new CosmosRPC(provider);
        const balance = await rpc.getBalance();
        uiConsole(balance);
    };

    const sendTransaction = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        const rpc = new CosmosRPC(provider);
        const {transactionHash, height} = await rpc.sendTransaction();
        const blockExplorerURL = "https://explorer.theta-testnet.polypore.xyz/transactions/" + transactionHash;
        const txString = "Follow this transaction at " + blockExplorerURL;
        uiConsole("TxHash: " + transactionHash, "Block Height: " + height, txString);
    };

    function uiConsole(...args: any[]): void {
        const el = document.querySelector("#console>p");
        if (el) {
            el.innerHTML = JSON.stringify(args || {}, null, 2);
        }
    }

    const getPrivateKey = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        const rpc = new CosmosRPC(provider);
        const privateKey = await rpc.getPrivateKey();
        uiConsole(privateKey);
    };

    const loggedInView = (
        <>
            <div className="flex-container">
                <div>
                    <button onClick={getUserInfo} className="card">
                        Get User Info
                    </button>
                </div>
                <div>
                    <button onClick={authenticateUser} className="card">
                        Get ID Token
                    </button>
                </div>
                <div>
                    <button onClick={getChainId} className="card">
                        Get Chain ID
                    </button>
                </div>
                <div>
                    <button onClick={getAccounts} className="card">
                        Get Accounts
                    </button>
                </div>
                <div>
                    <button onClick={getBalance} className="card">
                        Get Balance
                    </button>
                </div>
                <div>
                    <button onClick={sendTransaction} className="card">
                        Send Transaction
                    </button>
                </div>
                <div>
                    <button onClick={getPrivateKey} className="card">
                        Get Private Key
                    </button>
                </div>
                <div>
                    <button onClick={logout} className="card">
                        Log Out
                    </button>
                </div>
            </div>
            <div id="console" style={{whiteSpace: "pre-line"}}>
                <p style={{whiteSpace: "pre-line"}}>Logged in Successfully!</p>
            </div>
        </>
    );

    const unloggedInView = (
        <button onClick={login} className="card">
            Login
        </button>
    );

    return (
        <div className="container">
            <h1 className="title">
                ReactJS Example using Twitter Auth0 login
            </h1>

            <div className="grid">{provider ? loggedInView : unloggedInView}</div>

            <footer className="footer">
                <a
                    href="https://github.com/ihsraham/auth0-react-cosmos"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Source code
                </a>
            </footer>
        </div>
    );
}

export default App;
