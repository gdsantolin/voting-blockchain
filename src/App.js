import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import TuringArtifact from './artifacts/contracts/Turing.sol/Turing.json';
import './App.css';

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Substituir pelo endereço do contrato

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [selectedCodinome, setSelectedCodinome] = useState('');
  const [amount, setAmount] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [votingEnabled, setVotingEnabled] = useState(true);

  // Lista de codinomes
  const listCodinomes = [
    "nome1", "nome2", "nome3", "nome4", "nome5", "nome6", "nome7", "nome8", "nome9", "nome10",
    "nome11", "nome12", "nome13", "nome14", "nome15", "nome16", "nome17", "nome18", "nome19"
  ];

  // Inicializa o provider, contrato e conta
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

        // Carrega o ranking inicial
        loadRanking(contract);
      }
    }
    init();
  }, []);
  

  const loadRanking = async (contract) => {
    try {
      const ranking = await Promise.all(listCodinomes.map(async (codinome) => {
        try {
          const address = await contract.codinomes(codinome);
          if (address === ethers.constants.AddressZero) {
            // Se o endereço for 0x0, o codinome não existe no contrato
            return null;
          }
          const balance = await contract.balanceOf(address);
          return { codinome, balance: ethers.utils.formatEther(balance) };
        } catch (err) {
          console.error(`Erro ao acessar o codinome ${codinome}:`, err);
          return null;
        }
      }));
      
      // Filtra valores nulos (caso algum codinome não tenha sido encontrado)
      const validRanking = ranking.filter(item => item !== null);
      validRanking.sort((a, b) => b.balance - a.balance); // Ordena pelo saldo
      setRanking(validRanking); // Atualiza o estado do ranking
    } catch (error) {
      console.error("Erro ao carregar o ranking:", error);
    }
  };

  const handleIssueToken = async () => {
    try {
      const amountInSaTurings = ethers.utils.parseEther(amount.toString());
      const tx = await contract.issueToken(selectedCodinome, amountInSaTurings);
      await tx.wait();
      alert('Tokens emitidos com sucesso!');
      loadRanking(contract); // Atualiza o ranking após emitir tokens
    } catch (error) {
      console.error("Erro ao emitir tokens:", error);
      alert('Erro ao emitir tokens. Verifique o console para mais detalhes.');
    }
  };

  const handleVote = async () => {
    try {
      const amountInSaTurings = ethers.utils.parseEther(amount.toString());
      const tx = await contract.vote(selectedCodinome, amountInSaTurings);
      await tx.wait();
      alert('Voto registrado com sucesso!');
      loadRanking(contract); // Atualiza o ranking após votar
    } catch (error) {
      console.error("Erro ao votar:", error);
      alert('Erro ao votar. Verifique o console para mais detalhes.');
    }
  };

  const handleToggleVoting = async () => {
    try {
      const tx = votingEnabled ? await contract.votingOff() : await contract.votingOn();
      await tx.wait();
      setVotingEnabled(!votingEnabled);
      alert(`Votação ${votingEnabled ? 'desativada' : 'ativada'}!`);
    } catch (error) {
      console.error("Erro ao alterar votação:", error);
      alert('Erro ao alterar votação. Verifique o console para mais detalhes.');
    }
  };

  return (
    <div className="container">
      <h1>DApp Turing</h1>
      <div className="section">
        <h2>Emitir Tokens</h2>
        <select onChange={(e) => setSelectedCodinome(e.target.value)}>
          <option value="">Selecione um codinome</option>
          {listCodinomes.map((codinome, index) => (
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
        <select onChange={(e) => setSelectedCodinome(e.target.value)}>
          <option value="">Selecione um codinome</option>
          {listCodinomes.map((codinome, index) => (
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
        <h2>Controle de Votação</h2>
        <button onClick={handleToggleVoting}>
          {votingEnabled ? 'Desativar Votação' : 'Ativar Votação'}
        </button>
      </div>
      <div className="section">
        <h2>Ranking</h2>
        <ul>
          {ranking.length > 0 ? (
            ranking.map((item, index) => (
              <li key={index}>
                {item.codinome}: {item.balance} TUR
              </li>
            ))
          ) : (
            <p>Carregando ranking...</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
