module usdh::treasury;

use sui::coin::{Self, Coin};
use sui::object::{Self, ID, UID};
use sui::table::{Self, Table};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use usdh::usdh::USDH;

// Error constants
const EInsufficientFundsInFundUnit: u64 = 101;
const EFundUnitNotRegistered: u64 = 102;

/// Treasury object to hold coins for FundUnits
public struct Treasury has key {
    id: UID,
    // Mapping from FundUnit ID to its coin balance
    fund_unit_balances: Table<ID, Coin<USDH>>,
}

/// Initialize the Treasury shared object
fun init(ctx: &mut TxContext) {
    let treasury = Treasury {
        id: object::new(ctx),
        fund_unit_balances: table::new<ID, Coin<USDH>>(ctx),
    };
    transfer::share_object(treasury);
}

/// Deposits a coin into the treasury for a specific FundUnit.
public fun deposit_to_fund_unit(
    treasury: &mut Treasury,
    coin_to_deposit: Coin<USDH>,
    fund_unit_id: ID,
    ctx: &mut TxContext,
) {
    if (table::contains(&treasury.fund_unit_balances, fund_unit_id)) {
        let existing_balance_coin = table::borrow_mut(
            &mut treasury.fund_unit_balances,
            fund_unit_id,
        );
        coin::join(existing_balance_coin, coin_to_deposit);
    } else {
        table::add(&mut treasury.fund_unit_balances, fund_unit_id, coin_to_deposit);
    };
}

/// Withdraws a specific amount from a FundUnit's balance in the treasury.
public fun withdraw_from_fund_unit(
    treasury: &mut Treasury,
    fund_unit_id: ID,
    amount: u64,
    ctx: &mut TxContext,
): Coin<USDH> {
    assert!(table::contains(&treasury.fund_unit_balances, fund_unit_id), EFundUnitNotRegistered);

    let fund_unit_coin = table::borrow_mut(&mut treasury.fund_unit_balances, fund_unit_id);
    assert!(coin::value(fund_unit_coin) >= amount, EInsufficientFundsInFundUnit);

    coin::split(fund_unit_coin, amount, ctx)
}

/// Allows the original owner/admin to withdraw all funds from a FundUnit if necessary (e.g., expiration).
/// This function needs proper access control based on who can call it.
public fun admin_withdraw_all_from_fund_unit(
    treasury: &mut Treasury,
    fund_unit_id: ID,
    ctx: &mut TxContext,
): Coin<USDH> {
    assert!(table::contains(&treasury.fund_unit_balances, fund_unit_id), EFundUnitNotRegistered);
    // Add access control: Only admin or original owner of the FundUnit should be able to call this.
    // This requires knowing the TreasuryCap holder or similar admin capabilities.

    table::remove(&mut treasury.fund_unit_balances, fund_unit_id)
}

/// Gets the balance of a specific FundUnit.
public fun get_fund_unit_balance(treasury: &Treasury, fund_unit_id: ID): u64 {
    if (table::contains(&treasury.fund_unit_balances, fund_unit_id)) {
        coin::value(table::borrow(&treasury.fund_unit_balances, fund_unit_id))
    } else {
        0
    }
}
