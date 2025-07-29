import {
  Keypair,
  Operation,
  OperationOptions,
  SorobanDataBuilder,
  TransactionBuilder,
  xdr,
} from "stellar-sdk";
import { config, rpc } from "../config/config.ts";
import { Api } from "stellar-sdk/rpc";

export const restore = async (args: { keys: xdr.LedgerKey[] }) => {
  const sorobanData = new SorobanDataBuilder().setReadWrite(args.keys).build();

  const options: OperationOptions.RestoreFootprint = {};

  const restoreFootprintOperation = Operation.restoreFootprint(options);

  return await executeTransaction({
    sourceKeypair: config.accountKeypair,
    operation: restoreFootprintOperation,
    sorobanData,
  });
};

export const extendTtl = async (args: {
  keys: xdr.LedgerKey[];
  extendTo: number;
}) => {
  const options: OperationOptions.ExtendFootprintTTL = {
    extendTo: args.extendTo,
  };

  const sorobanData = new SorobanDataBuilder().setReadOnly(args.keys).build();

  const extendFootprintOperation = Operation.extendFootprintTtl(options);

  return await executeTransaction({
    sourceKeypair: config.accountKeypair,
    operation: extendFootprintOperation,
    sorobanData,
  });
};

const executeTransaction = async ({
  sourceKeypair,
  operation,
  sorobanData,
}: {
  sourceKeypair: Keypair;
  operation: xdr.Operation;
  sorobanData?: xdr.SorobanTransactionData;
}) => {
  const sourceAccount = await rpc.getAccount(sourceKeypair.publicKey());

  let txEnvelope: TransactionBuilder;
  try {
    txEnvelope = new TransactionBuilder(sourceAccount, {
      fee: config.fee,
      networkPassphrase: config.stellarNetwork,
    });
  } catch (e) {
    throw new Error(`Failed to create transaction builder: ${e}`);
  }

  if (sorobanData) {
    try {
      txEnvelope.setSorobanData(sorobanData);
    } catch (e) {
      throw new Error(`Failed to set Soroban data: ${e}`);
    }
  }

  txEnvelope.addOperation(operation);
  const builtTx = txEnvelope.setTimeout(300).build();

  let simulatedTx;
  try {
    simulatedTx = await rpc.prepareTransaction(builtTx);
  } catch (error) {
    throw new Error(`Failed to prepare transaction: ${error}`);
  }

  simulatedTx.sign(sourceKeypair);

  try {
    const response = await rpc.sendTransaction(simulatedTx);
    const status = await rpc.pollTransaction(response.hash, {
      attempts: 10,
    });

    return { hash: response.hash, status: status.status };
  } catch (error) {
    throw new Error(`Failed to send transaction: ${error}`);
  }
};
