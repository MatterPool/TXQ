import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import ResourceNotFoundError from '../../error/ResourceNotFoundError';
@Service('getTxout')
export default class GetTxout extends UseCase {

  constructor(
    @Inject('txoutService') private txoutService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: { txid: string, index: any, script?: boolean}): Promise<UseCaseOutcome> {
    let entity = await this.txoutService.getTxout(params.txid, params.index, params.script);
    if (!entity) {
      throw new ResourceNotFoundError();
    }
    return {
      success: true,
      result: {
        ...entity
      }
    };
  }
}
