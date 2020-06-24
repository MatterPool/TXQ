import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import ResourceNotFoundError from '../../error/ResourceNotFoundError';

@Service('getTx')
export default class GetTx extends UseCase {

  constructor(
    @Inject('txService') private txService,
    @Inject('txmetaService') private txmetaService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { txid: string, channel?: string, rawtx?: boolean}): Promise<UseCaseOutcome> {
    let tx = await this.txService.getTx(params.txid, params.rawtx);
    if (!tx) {
      throw new ResourceNotFoundError();
    }

    let txmeta = await this.txmetaService.getTxmeta(params.txid, params.channel);

    // Cannot find second part (ie: not for channel)
    if (!txmeta) {
      throw new ResourceNotFoundError();
    }

    return {
      success: true,
      result: {
        ...tx,
        ...txmeta,
      }
    };
  }
}
