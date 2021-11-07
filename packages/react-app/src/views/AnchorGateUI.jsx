import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance, Events } from "../components";
import {
  useContractLoader,
  useContractReader,
} from "eth-hooks";

function PoolInfo({
  address,
  readContracts,
}) {
  const reserves = useContractReader(readContracts, "YourContract", "getAddrReserves", [readContracts.UniswapV2Pair.address]);
  const daiIn = utils.parseEther("1000"); // DAI
  // (reserves[0] + daiIn) * (reserves[1] - maiOut) = (reserves[0] * reserves[1])
  // (reserves[0] * reserves[1]) / (reserves[0] + daiIn) = reserves[1] - maiOut
  // maiOut = reserves[1] - (reserves[0] * reserves[1]) / (reserves[0] + daiIn)
  const maiOut = reserves ? reserves[1].sub(reserves[0].mul(reserves[1]).div(reserves[0].add(daiIn))) : 0;
  return (<div>
      <div>DAI/MAI Pool Reserves: 
        <div>DAI: {reserves ? utils.formatEther(reserves[0]): '...'}</div>
        <div>MAI: {reserves ? utils.formatEther(reserves[1]): '...'}</div>
        <div>MAI(Out) given 1000 DAI(In): {reserves ? utils.formatEther(maiOut): '...'}</div>
        <div>Premium: {maiOut ? maiOut.mul(1e6).div(daiIn).sub(1e6).toNumber() / 1e4: 0}%</div>
      </div>
  </div>);
}
function Allowance({
  address,
  readContracts,
}) {
  const reserves = useContractReader(readContracts, "YourContract", "getAddrReserves", [readContracts.UniswapV2Pair.address]);
  const myPoSDAIAllowance = useContractReader(readContracts, "ProxiedDAI", "allowance", [address, readContracts.YourContract.address]);
  const pairAllowance = useContractReader(readContracts, "ProxiedDAI", "allowance", [readContracts.YourContract.address, readContracts.UniswapV2Pair.address]);
  return (<div>
      <div>User allowance for YourContract {myPoSDAIAllowance ? utils.formatEther(myPoSDAIAllowance) : '...'}</div>
      <div>Allowance of YourContract for pair pool {pairAllowance ? utils.formatEther(pairAllowance) : '...'}</div>
  </div>);
}

export default function AnchorGateUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  mainnetContracts,
}) {
  const [newDaiSpendAmount, setNewDaiSpendAmount] = useState("loading...");

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>AnchorGate UI:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          {readContracts.YourContract && readContracts.YourContract.address ? (<PoolInfo address={address} readContracts={readContracts} />) : ''}
        <Divider />
          How much DAI to spend to get MAI
          <Input
            onChange={e => {
              setNewDaiSpendAmount(e.target.value);
            }}
          />
          {readContracts.YourContract && readContracts.YourContract.address ? (<Allowance address={address} readContracts={readContracts} />) : ''}

          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.YourContract.swapping(utils.parseEther(newDaiSpendAmount)), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Swap DAI for MAI !
          </Button>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
                console.log(mainnetContracts);
             // const result = await mainnetContracts.ProxiedDAI.approve("0x2B8F5e69C35c1Aff4CCc71458CA26c2F313c3ed3", "0x100000000000")
              const deployedYourContract = readContracts.YourContract.address;
              const pairDAIMAI = "0x74214F5d8AA71b8dc921D8A963a1Ba3605050781";
              const contractAddr = deployedYourContract;
              const result = tx(mainnetContracts.ProxiedDAI.approve(contractAddr, utils.parseEther("1000")), update => {
              //const result = tx(mainnetContracts.UChildDAI.approve(contractAddr, "0x10000000000000000000"), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Approve DAI 1st !
          </Button>
        </div>
        <Divider />
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        Your Contract Address:
        <Address
          address={readContracts && readContracts.YourContract ? readContracts.YourContract.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider />
      </div>

    </div>
  );
}
