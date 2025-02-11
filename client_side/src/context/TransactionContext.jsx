import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

if (!ethereum) {
  console.error("Ethereum object not found. Please install MetaMask.");
}

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
  return transactionsContract;
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    parseInt(localStorage.getItem("transactionCount")) || 0
  );
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();
        const availableTransactions = await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18),
        }));

        setTransactions(structuredTransactions);
        setError("");
      } else {
        setError("Ethereum is not present. Please install MetaMask.");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch transactions. Please try again.");
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();
        const currentTransactionCount = await transactionsContract.getTransactionCount();
        window.localStorage.setItem("transactionCount", currentTransactionCount);
      }
    } catch (error) {
      console.error(error);
      throw new Error("No ethereum object");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.error(error);
      throw new Error("No ethereum object");
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount("");
    localStorage.removeItem("transactionCount");
    window.location.reload();
  };

  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        const txHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          }],
        });

        setIsLoading(true);
        console.log(`Loading - ${txHash}`);

        const receipt = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
        await receipt.wait();

        console.log(`Success - ${txHash}`);
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();
        setTransactionCount(transactionsCount.toNumber());
        window.location.reload();
      } else {
        setError("Ethereum is not present. Please install MetaMask.");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setError("Transaction failed. Please try again.");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount, currentAccount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        disconnectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
        error,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};