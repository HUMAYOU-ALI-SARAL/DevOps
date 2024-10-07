import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';

@Injectable()
export class NodeCacheService {
  private readonly otpRequestCounter: NodeCache;
  private readonly otpRequestCounterTTL: number = 2000;

  private readonly otpResend: NodeCache;
  private readonly otpResendTTL: number = 20;

  private readonly acceptBid: NodeCache;
  private readonly acceptBidTTL: number = 20;

  constructor() {
    this.otpRequestCounter = new NodeCache();
    this.otpResend = new NodeCache({deleteOnExpire: true});
    this.acceptBid = new NodeCache({deleteOnExpire: true});
  }

  setOtpRequestCounter(userId: number, requestCount: number) {
    this.otpRequestCounter.set(userId, requestCount, this.otpRequestCounterTTL);
  }

  getOtpRequestCounter(userId: number): number {
    return this.otpRequestCounter.get(userId);
  }

  setTimeoutOtpResend(userId: number) {
    this.otpResend.set(userId, true, this.otpResendTTL);
  }

  checkTimeoutOtpResend(userId: number): boolean {
    return this.otpResend.get(userId);
  }

  setAcceptBidTimeout(userId: number) {
    this.acceptBid.set(userId, true, this.acceptBidTTL);
  }

  checkAcceptBidTimeout(userId: number): boolean {
    return this.acceptBid.get(userId);
  }
}