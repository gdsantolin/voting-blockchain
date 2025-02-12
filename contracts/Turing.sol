// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Turing is ERC20 {
    mapping(string => address) public codinomes;
    mapping(address => mapping(string => bool)) public votos;
    address public deployer;
    address public professora = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    bool public votacaoAtiva = true;

    constructor() ERC20("Turing", "TUR") {
        deployer = msg.sender;

        codinomes["nome0"] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        codinomes["nome1"] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        codinomes["nome2"] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        codinomes["nome3"] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        codinomes["nome4"] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        codinomes["nome5"] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
        codinomes["nome6"] = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        codinomes["nome7"] = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        codinomes["nome8"] = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        codinomes["nome9"] = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
        codinomes["nome10"] = 0xBcd4042DE499D14e55001CcbB24a551F3b954096;
        codinomes["nome11"] = 0x71bE63f3384f5fb98995898A86B02Fb2426c5788;
        codinomes["nome12"] = 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a;
        codinomes["nome13"] = 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec;
        codinomes["nome14"] = 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097;
        codinomes["nome15"] = 0xcd3B766CCDd6AE721141F452C550Ca635964ce71;
        codinomes["nome16"] = 0x2546BcD3c84621e976D8185a91A922aE77ECEc30;
        codinomes["nome17"] = 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E;
        codinomes["nome18"] = 0xdD2FD4581271e230360230F9337D5c0430Bf44C0;
        codinomes["nome19"] = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;
    }

    modifier isOwnerOuProfessora() {
        require(msg.sender == deployer || msg.sender == professora, "Nao autorizado");
        _;
    }

    modifier votacaoLigada() {
        require(votacaoAtiva, "Votacao desligada");
        _;
    }

    modifier isAutorizado(string memory codinome) {
        require(codinomes[codinome] != address(0), "Codinome invalido");
        _;
    }

    function issueToken(string memory codinome, uint256 quantidade) public isOwnerOuProfessora isAutorizado(codinome) {
        _mint(codinomes[codinome], quantidade);
    }

    function vote(string memory codinome, uint256 quantidade) public votacaoLigada isAutorizado(codinome) {
        address votoAddress = codinomes[codinome];
        
        require(quantidade <= 2 * 10**18, "Quantidade invalida");
        require(!votos[msg.sender][codinome], "Voto ja realizado");
        require(votoAddress != msg.sender, "Nao pode votar em si mesmo");

        _mint(votoAddress, quantidade);
        _mint(msg.sender, 0.2 * 10**18);

        votos[msg.sender][codinome] = true;
    }

    function votingOn() public isOwnerOuProfessora {
        votacaoAtiva = true;
    }

    function votingOff() public isOwnerOuProfessora {
        votacaoAtiva = false;
    }

    function getNames() public pure returns (string[] memory) {
        string[] memory names = new string[](20);
        names[0] = "nome0";
        names[1] = "nome1";
        names[2] = "nome2";
        names[3] = "nome3";
        names[4] = "nome4";
        names[5] = "nome5";
        names[6] = "nome6";
        names[7] = "nome7";
        names[8] = "nome8";
        names[9] = "nome9";
        names[10] = "nome10";
        names[11] = "nome11";
        names[12] = "nome12";
        names[13] = "nome13";
        names[14] = "nome14";
        names[15] = "nome15";
        names[16] = "nome16";
        names[17] = "nome17";
        names[18] = "nome18";
        names[19] = "nome19";
        return names;
    }
}