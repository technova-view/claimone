// Plain enums with no TypeORM/decorator dependency, so client components can
// safely import them without pulling in bid.entity.ts's Node-only decorated
// class. Server code may import these from bid.entity.ts's re-export or
// straight from here — both resolve to the same values.

export enum BidScope {
  DAILY = "daily",
  WEEKLY = "weekly",
  ALL_TIME = "all_time",
}

export enum BidStatus {
  PENDING_PAYMENT = "pending_payment",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum PaymentProvider {
  PADDLE = "paddle",
  CRYPTO_DIRECT = "crypto_direct",
  NOWPAYMENTS = "nowpayments",
}
