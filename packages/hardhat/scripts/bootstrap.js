// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
//
// Thanks Phil
const hre = require("hardhat");
//const erc20Abi = require("../abis/erc20.json");
const externalABIs = require('../../react-app/src/contracts/external_contracts.js');
const tokenABI = externalABIs['137'].contracts.ProxiedDAI.abi;

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Polygon (PoS) DAI, USDC
  const daiContract = new hre.ethers.Contract(
    "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    tokenABI
  );
  const usdcContract = new hre.ethers.Contract(
    "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    tokenABI
  );

  // INSUR whale with a lot of MATIC, USDC, DAI
  const insurWhaleAddress = "0xd2171abb60d2994cf9acb767f2116cf47bbf596f";
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [insurWhaleAddress],
  });

  const recipient = "0x7212f07cc038cC838B0B7F7AE236bf98dae221d4"; // tomo - set your own here
  // XXX nope: const recipientSigner = await hre.ethers.getSigner(recipient);

  // Get the impersonated signer
  const whaleSigner = await hre.ethers.getSigner(insurWhaleAddress);
  const recipientSigner = await hre.ethers.getSigner(recipient);

  // Get the connected versions of the Ethers Contract objects
  const whaleDai = await daiContract.connect(whaleSigner);
  const whaleUsdc = await usdcContract.connect(whaleSigner);

  const ercBal = async (c, addr, dec) => hre.ethers.utils.formatUnits(await c.balanceOf(addr), dec);
  const ethBal = async (signer, addr) => hre.ethers.utils.formatEther(await signer.getBalance(addr));
   
  // The Balance we're gonna steal
  console.log("whale USDC balance is", await ercBal(whaleUsdc, insurWhaleAddress, 6));
  console.log("whale DAI balance is", await ercBal(whaleDai, insurWhaleAddress, 18));

  console.log("whale MATIC balance is", hre.ethers.utils.formatUnits(await whaleSigner.getBalance(), 18));

  //  console.log("whale MATIC ", await ethBal(insurWhaleAddress));
  //XXX  console.log("my MATIC ", await ethBal(recipient));
  // const provider = await hre.ethers.getDefaultProvider()
  // 0 console.log('matics ', await provider.getBalance(recipient));
   //console.log('matics ', await ethBal(recipientSigner, recipientSigner));//recipientSigner.getBalance(recipient));
//XXX   console.log('matics ', await recipientSigner.getBalance(recipient));
   //XXX console.log('matics ', await whaleSigner.getBalance(recipient));

  // using the whaleUsdc Contract object because I'm lazy, but I just need a way to do a read only call. sorry for the confusion
  console.log("recipient USDC balance is", await ercBal(whaleUsdc, recipient, 6));
  console.log("recipient DAI balance is", await ercBal(whaleDai, recipient, 18));

  await whaleUsdc.transfer(recipient, '1234567890' + '00');

  await whaleDai.transfer(recipient, '1234567890' + '000000000000');

  await whaleSigner.sendTransaction({to: recipient.toString(), value: hre.ethers.utils.parseEther("60000")});

  console.log("new USDC balance is", await ercBal(whaleUsdc, recipient, 6));
  console.log("new DAI balance is", await ercBal(whaleDai, recipient, 18));

  const balanceAfterEth = await whaleSigner.getBalance();
  console.log("whale ETH balance is", balanceAfterEth.toString());
  console.log(
    "Congrats! You have successfully transferred tokens to yourself!"
  );


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
