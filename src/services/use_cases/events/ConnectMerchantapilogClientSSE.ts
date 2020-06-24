import { Service, Inject } from 'typedi';
import { UseCase } from '../UseCase';
import { UseCaseOutcome } from '../UseCaseOutcome';
import { Response, Request } from 'express';

@Service('ConnectMerchantapilogClientSSE')
export default class ConnectMerchantapilogClientSSE extends UseCase {

  constructor(
    @Inject('eventService') private eventService,
    @Inject('logger') private logger) {
    super();
  }

  public async run(params: {
    channel: string,
    req: Request,
    res: Response
  }): Promise<UseCaseOutcome> {

    const session = this.eventService.handleSSEMerchantapilogEvents(params.req, params.res);

    return {
      success: true,
      result: session
    };
  }
}
