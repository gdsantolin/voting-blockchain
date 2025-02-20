import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import TuringArtifact from './artifacts/contracts/Turing.sol/Turing.json';
import './App.css';

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [codinome, setCodinome] = useState('');
  const [amount, setAmount] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [votingEnabled, setVotingEnabled] = useState(true);

  const names = ["nome1", "nome2", "nome3", "nome4", "nome5", "nome6", "nome7", "nome8", "nome9",
    "nome10", "nome11", "nome12", "nome13", "nome14", "nome15", "nome16", "nome17", "nome18", "nome19"];

  useEffect(() => {
    async function init() {
      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });

        const web3Provider = new ethers.providers.Web3Provider(provider);
        setProvider(web3Provider);

        const signer = web3Provider.getSigner();

        const contract = new ethers.Contract(contractAddress, TuringArtifact.abi, signer);
        setContract(contract);

        const account = await signer.getAddress();
        setAccount(account);
        
        const votingEnabled = await contract.votacaoAtiva();
        setVotingEnabled(votingEnabled);

        loadRanking(contract);

        const handleVoteCast = (voter, event) => {
          loadRanking(contract);
          console.log("Event");
        };

        contract.on("VoteCast", handleVoteCast);

        return () => {
          contract.removeListener("VoteCast", handleVoteCast);
        };
      }
    }
    init();
  }, []);

  const loadRanking = async (contract) => {
    try {
      const ranking = await Promise.all(names.map(async (codinome) => {
        try {
          const address = await contract.codinomes(codinome);
          if (address === ethers.constants.AddressZero) 
            return null;
          
          const balance = await contract.balanceOf(address);
          return { codinome, balance: ethers.utils.formatEther(balance) };
        } catch (err) {
          console.error(`Erro ao acessar o codinome ${codinome}:`, err);
          return null;
        }
      }));
      
      const validRanking = ranking.filter(item => item !== null);
      validRanking.sort((a, b) => b.balance - a.balance);
      setRanking(validRanking);
    } catch (error) {
      alert('Erro ao carregar ranking');
    }
  };

  const handleVote = async () => {
    try {
      const parsedAmount = ethers.utils.parseEther(amount.toString());
      const tx = await contract.vote(codinome, parsedAmount);
      await tx.wait();
      alert('Voto registrado com sucesso!');
      
    } catch (error) {
      alert('Erro ao votar');
    }
  };

  const handleIssueToken = async () => {
    try {
      const amountInSaTurings = ethers.utils.parseEther(amount.toString());
      const tx = await contract.issueToken(codinome, amountInSaTurings);
      await tx.wait();
      alert('Tokens emitidos com sucesso!');
      loadRanking(contract); // Atualiza o ranking após emitir tokens
    } catch (error) {
      alert('Erro ao emitir tokens');
    }
  };

  const handleToggleVoting = async () => {
    try {
      const tx = votingEnabled ? await contract.votingOff() : await contract.votingOn();
      await tx.wait();
      setVotingEnabled(!votingEnabled);
      alert(`Votação ${votingEnabled ? 'desativada' : 'ativada'}!`);
    } catch (error) {
      alert('Erro ao alterar status da votação');
    }
  };



  return (
    <div className="container">
      <h1>Votação - Turing Dapp</h1>
      <div className="section">
        <h2>Emitir Tokens</h2>
        <select onChange={(e) => setCodinome(e.target.value)}>
          <option value="">Selecione um codinome</option>
          {names.map((codinome, index) => (
            <option key={index} value={codinome}>{codinome}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantidade de Turings"
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleIssueToken}>Emitir Tokens</button>
      </div>
      <div className="section">
        <h2>Votar</h2>
        <select onChange={(e) => setCodinome(e.target.value)}>
          <option value="">Selecione um codinome</option>
          {names.map((codinome, index) => (
            <option key={index} value={codinome}>{codinome}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantidade de Turings"
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleVote} disabled={!votingEnabled}>Votar</button>
      </div>
      <div className="section">
        <h2>Votação está {votingEnabled ? 'ativada' : 'desativada'}</h2>
        <button onClick={handleToggleVoting}>
          {votingEnabled ? 'Desativar Votação' : 'Ativar Votação'}
        </button>
      </div>
      <div className="section">
        <h2>Ranking</h2>
        <ul>
          {ranking.length > 0 ? (
            ranking.map((item, index) => (
              <li key={index} className={`rank-${index + 1}`}>
                {item.codinome} - {item.balance} TUR
                <span className="position">
                  {index + 1}º
                </span>
              </li>
            ))
          ) : (
            <p>Ranking indisponível - conecte o Metamask à rede e/ou atualize a página</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
