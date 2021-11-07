pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourContract {

  //event SetPurpose(address sender, string purpose);

  string public purpose = "Building Unstoppable Apps!!!";

  address public token0DAI = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;
  address public token1MAI = 0xa3Fa99A148fA48D14Ed51d610c367C61876997F1;
  address public pairDAIMAI = 0x74214F5d8AA71b8dc921D8A963a1Ba3605050781;

  struct UniVars {
    address sellToken;
    uint amount;
  }

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

  function myDaiBalance(address addr) external view returns (uint) {
    IERC20 token = IERC20(token0DAI);
    return token.balanceOf(addr);
  }

  function approval() public {
    uint256 MAX_INT = 2**256 - 1;
    IERC20 token = IERC20(token0DAI);
    token.approve(address(pairDAIMAI), MAX_INT);
  }

  function approval2() public {
    uint256 MAX_INT = 2**256 - 1;
    IERC20 token = IERC20(token0DAI);
    token.approve(address(this), MAX_INT);
  }

  function allowanceMai() external view returns (uint256) {
    IERC20 token = IERC20(token0DAI);
    return token.allowance(address(this), address(pairDAIMAI));
  }

  function allowanceMai2() external view returns (uint256) {
    IERC20 token = IERC20(token0DAI);
    return token.allowance(address(this), msg.sender);
  }

  function allowanceMai3() external view returns (uint256) {
    IERC20 token = IERC20(token0DAI);
    return token.allowance(msg.sender, address(this));
  }

  function swapping(uint256 sellAmount) public {
    // UniVars memory uniVars = UniVars({
    //     sellToken : token0DAI,
    //     amount : sellAmount
    // });
   
    console.log(address(this));
    console.log(msg.sender);
    // MyPair(pairDAIMAI).swap(1000, 0, address(this), abi.encode(uniVars));
    // ERC20(token0DAI).approve(address(this), sellAmount);
    IERC20 token = IERC20(token0DAI);
    // uint256 MAX_INT = 2**256 - 1;
    token.transferFrom(msg.sender, address(pairDAIMAI), sellAmount);
    

  }
}

interface MyPair {
  function token0() external view returns (address);
  function token1() external view returns (address);
  function name() external pure returns (string memory);
  function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
  function mint(address to) external returns (uint liquidity);
  function swap(
    uint256 amount0Out,
    uint256 amount1Out,
    address to,
    bytes calldata data
  ) external;
}

interface ERC20 {
  function balanceOf(address owner) external view returns (uint);
  function transferFrom(
        address sender,
        address recipient,
        uint amount
  ) external returns (bool);
  function approve(address spender, uint256 amount) external returns (bool);
  function allowance(address owner, address spender) external view returns (uint256);
}
