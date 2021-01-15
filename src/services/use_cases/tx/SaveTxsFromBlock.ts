import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import { ITransactionData, ITxEntityWithMetadata } from '../../../interfaces/ITransactionData';
import { EventTypes } from '../../../services/event';
import { IAccountContext } from '@interfaces/IAccountContext';
import contextFactory from '../../../bootstrap/middleware/di/diContextFactory';
import { ITXOutput } from '@interfaces/ITxOutput';
import * as bsv from 'bsv';

@Service('saveTxsFromBlock')
export default class SaveTxsFromBlock extends UseCase {
  constructor(
    @Inject('eventService') private eventService,
    @Inject('updatelogService') private updatelogService,
    @Inject('txModel') private txModel,
    @Inject('logger') private logger
  ) {
    super();
  }

  public async run(params: {
    channel?: string,
    set: {
      [key: string]: ITransactionData
    },
    newOutpointMonitorRecords:  {
      [outpoint: string]:  {
        txid: string,  
        index: number,
        // It could be spent in the same block
        spend_height?: number,
        spend_blockhash?: string,
        spend_txid?: string,
        spend_index?: number
      }
    },
    block: bsv.Block,
    height: number,
    accountContext?: IAccountContext
  }): Promise<UseCaseOutcome> {
    const start = (new Date()).getTime();
    try {
      // Force permissions check
      contextFactory.getNetwork(params.accountContext);
      let cleanedChannel = params.channel ? params.channel : '';
      const persistResult: {
        txEvents: ITxEntityWithMetadata[],
        savedTxs: string[],
        txoutEvents: ITXOutput[]
      } = await this.txModel.saveTxsForBlock(params.accountContext, params);
 
      this.eventService.pushTxEvents(params.accountContext, cleanedChannel, persistResult.txEvents);
      this.eventService.pushTxEvents(params.accountContext, 'updatelogs-', persistResult.txEvents);
      this.eventService.pushTxoutEvents(params.accountContext, persistResult.txoutEvents);

      /**
       * Heavy operation, do not perform.
       * Consider if it's needed at all
       */
      /* for (const item of persistResult.txEvents) {
        await this.updatelogService.save(params.accountContext, EventTypes.newtx, cleanedChannel, { ...item, entity: item, eventType: 'newtx'}, item.txid);
      }
      */
      const end = (new Date()).getTime();
      this.logger.info('saveTxsFromBlock', {
        projectId: params.accountContext.projectId,
        txids: persistResult.savedTxs,
        status: 'Saved',
        height: params.height,
        blockhash: params.block.hash,
        duration: (end - start) / 1000
      });
      return {
        success: true,
        result: persistResult.savedTxs
      };
    } catch (exception) {
      const end = (new Date()).getTime();
      this.logger.error('saveTxsFromBlock', {
        projectId: params.accountContext.projectId,
        exception,
        stack: exception.stack,
        height: params.height,
        blockhash: params.block.hash,
        channel: params.channel,
        duration: (end - start) / 1000
      });
      throw exception;
    }
  }
}