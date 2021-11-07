import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance, Events } from "../components";
import {
  useContractLoader,
  useContractReader,
} from "eth-hooks";

function Allowance({
  address,
  readContracts,
}) {
  const myPoSDAIAllowance = useContractReader(readContracts, "ProxiedDAI", "allowance", [address, readContracts.YourContract.address]);
  return (<div>Allowance {myPoSDAIAllowance ? utils.formatEther(myPoSDAIAllowance) : '...'}</div>);
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
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
                console.log(mainnetContracts);
             // const result = await mainnetContracts.ProxiedDAI.approve("0x2B8F5e69C35c1Aff4CCc71458CA26c2F313c3ed3", "0x100000000000")
              const deployedYourContract = "0x9A8Ec3B44ee760b629e204900c86d67414a67e8f";//"0x2B8F5e69C35c1Aff4CCc71458CA26c2F313c3ed3";
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
            Approve !
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

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <Events
        contracts={readContracts}
        contractName="YourContract"
        eventName="SetPurpose"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />

    </div>
  );
}
