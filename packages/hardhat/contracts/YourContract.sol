pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {

  //event SetPurpose(address sender, string purpose);

  string public purpose = "Building Unstoppable Apps!!!";

  address public token0DAI = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;
  address public token1MAI = 0xa3Fa99A148fA48D14Ed51d610c367C61876997F1;
  address public pairDAIMAI = 0x74214F5d8AA71b8dc921D8A963a1Ba3605050781;

  constructor() {
    // what should we do on deploy?
  }

  function setPurpose(string memory newPurpose) public {
      purpose = newPurpose;
      console.log(msg.sender,"set purpose to",purpose);
      //emit SetPurpose(msg.sender, purpose);
  }

  function myName(address addr) external pure returns (string memory) {
    MyPair pair = MyPair(addr);
    return pair.name();
  }
  function getAddrReserves(address addr) external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) {
    MyPair pair = MyPair(addr);
    return pair.getReserves();
  }
  function getDAIMAIReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) {
    MyPair pair = MyPair(pairDAIMAI);
    return pair.getReserves();
  }
}

interface MyPair {
  function name() external pure returns (string memory);
  function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}
