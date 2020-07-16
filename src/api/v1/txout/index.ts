import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { path } from './../index';
import GetTxout from '../../../services/use_cases/spends/GetTxout';
import GetTxoutsByScriptHash from '../../../services/use_cases/spends/GetTxoutsByScriptHash';
import GetTxoutsByAddress from '../../../services/use_cases/spends/GetTxoutsByAddress';
import GetUtxosByAddress from '../../../services/use_cases/spends/GetUtxosByAddress';
import GetUtxosByScriptHash from '../../../services/use_cases/spends/GetUtxosByScriptHash';
import ResourceNotFoundError from '../../../services/error/ResourceNotFoundError';
import { sendResponseWrapper } from '../../../util/sendResponseWrapper';
import { sendErrorWrapper } from '../../../util/sendErrorWrapper';
import GetTxoutsByOutpointArray from '../../../services/use_cases/spends/GetTxoutsByOutpointArray';
import GetTxoutsByGroup from '../../../services/use_cases/spends/GetTxoutsByGroup';
import GetUtxosByGroup from '../../../services/use_cases/spends/GetUtxosByGroup';

export default [
  {
    path: `${path}/txout/txid/:txid/:index`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getTxout = Container.get(GetTxout);
          let data = await getTxout.run({
            txid: Req.params.txid,
            index: Req.params.index,
            script: Req.query.script === '0' ? false : true,
          });

          sendResponseWrapper(Req, res, 200, data.result);

        } catch (error) {
          if (error instanceof ResourceNotFoundError) {
            sendErrorWrapper(res, 404, error.toString());
            return;
          }
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/txout/txid/:txOutpoints`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getTxout = Container.get(GetTxoutsByOutpointArray);
          let data = await getTxout.run({
            txOutpoints: Req.params.txOutpoints,
            script: Req.query.script === '0' ? false : true,
          });
          sendResponseWrapper(Req, res, 200, data.result);

        } catch (error) {
          if (error instanceof ResourceNotFoundError) {
            sendErrorWrapper(res, 404, error.toString());
            return;
          }
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/txout/scripthash/:scripthash`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getTxoutsByScriptHash = Container.get(GetTxoutsByScriptHash);
          let data = await getTxoutsByScriptHash.run({
            scripthash: Req.params.scripthash,
            script: Req.query.script === '0' ? false : true,
            limit: Req.query.limit ? Req.query.limit : 1000,
            offset: Req.query.offset ? Req.query.offset : 0,
            unspent: Req.query.unspent === '1' ? true : true
          });
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/txout/scripthash/:scripthash/utxo`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getUtxosByScriptHash = Container.get(GetUtxosByScriptHash);
          let data = await getUtxosByScriptHash.run({
            scripthash: Req.params.scripthash,
            limit: Req.query.limit ? Req.query.limit : 1000,
            offset: Req.query.offset ? Req.query.offset : 0,
          });

          sendResponseWrapper(Req, res, 200, data.result);

        } catch (error) {
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/txout/address/:address`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getTxoutsByAddress = Container.get(GetTxoutsByAddress);
          let data = await getTxoutsByAddress.run({
            address: Req.params.address,
            script: Req.query.script === '0' ? false : true,
            limit: Req.query.limit ? Req.query.limit : 1000,
            offset: Req.query.offset ? Req.query.offset : 0,
            unspent: Req.query.unspent === '1' ? true : false
          });

          sendResponseWrapper(Req, res, 200, data.result);

        } catch (error) {
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/txout/address/:address/utxo`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let getUtxosByAddress = Container.get(GetUtxosByAddress);
          let data = await getUtxosByAddress.run({
            address: Req.params.address,
            limit: Req.query.limit ? Req.query.limit : 1000,
            script: Req.query.script === '0' ? false : true,
            offset: Req.query.offset ? Req.query.offset : 0
          });

          sendResponseWrapper(Req, res, 200, data.result);

        } catch (error) {
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/txout/groupby/:groupname`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let uc = Container.get(GetTxoutsByGroup);
          let data = await uc.run({
            groupname: Req.params.groupname,
            limit: Req.query.limit ? Req.query.limit : 1000,
            script: Req.query.script === '0' ? false : true,
            offset: Req.query.offset ? Req.query.offset : 0
          });
          sendResponseWrapper(Req, res, 200, data.result);

        } catch (error) {
          next(error);
        }
      },
    ],
  },
  {
    path: `${path}/txout/group/:groupname/utxo`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let uc = Container.get(GetUtxosByGroup);
          let data = await uc.run({
            groupname: Req.params.groupname,
            limit: Req.query.limit ? Req.query.limit : 1000,
            script: Req.query.script === '0' ? false : true,
            offset: Req.query.offset ? Req.query.offset : 0
          });
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          next(error);
        }
      },
    ],
  },/*
  {
    path: `${path}/txout/group/:groupname/utxo/balance`,
    method: 'get',
    handler: [
      async (Req: Request, res: Response, next: NextFunction) => {
        try {
          let uc = Container.get(GetUtxosBalanceByGroupsArray);
          let data = await uc.run({
            address: Req.params.address,
            limit: Req.query.limit ? Req.query.limit : 1000,
            script: Req.query.script === '0' ? false : true,
            offset: Req.query.offset ? Req.query.offset : 0
          });
          sendResponseWrapper(Req, res, 200, data.result);
        } catch (error) {
          next(error);
        }
      },
    ],
  },*/
];
