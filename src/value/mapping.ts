import {FaaSPoolLite, Transfer} from '../../generated/ValueBFactory/FaaSPoolLite'
import {Address, log} from "@graphprotocol/graph-ts";
import {LOG_NEW_POOL} from "../../generated/ValueBFactory/BFactory";
import {ValueBPool as BPoolTemplate} from '../../generated/templates'
import {
  ADDRESS_ZERO,
  createException,
  createOrUpdate,
  MINUS_ONE,
  updateDayData,
  ZERO_BI
} from "../util";

let PROVIDER_NAME = "VALUE"

export function handleNewPool(event: LOG_NEW_POOL): void {
  let poolAddress = event.params.pool;
  log.warning("[VALUE] Creating factory tracking for pair address: {}", [poolAddress.toHexString()])
  BPoolTemplate.create(poolAddress);
}

export function handleTransfer(event: Transfer): void {
  let poolAddress = event.address;
  let to = event.params.dst as Address;
  let from = event.params.src;
  let initiator = event.transaction.from;

  if (to.toHexString() == ADDRESS_ZERO) { // BURN
    let lp = createOrUpdate(PROVIDER_NAME, poolAddress, initiator, event.params.amt.times(MINUS_ONE));
    updateDayData(lp, initiator, event);
  } else if (from.toHexString() == ADDRESS_ZERO) { // MINT
    let lp = createOrUpdate(PROVIDER_NAME, poolAddress, initiator, event.params.amt);
    updateDayData(lp, initiator, event);
  } else { // TRANSFER
    if (initiator == to) {
      let lp = createOrUpdate(PROVIDER_NAME, poolAddress, to, ZERO_BI);
      updateDayData(lp, to, event);
    }
    if (initiator == from) {
      let lpFrom = createOrUpdate(PROVIDER_NAME, poolAddress, from, ZERO_BI);
      updateDayData(lpFrom, from, event);
    }
  }

}