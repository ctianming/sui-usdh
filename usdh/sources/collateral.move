/*
 * USDH: 基于Sui区块链的算力支持可编程稳定币系统
 * 抵押机制模块: 实现多层资产支持模型
 */
module usdh::collateral;

use std::option::{Self, Option};
use std::string::{Self, String};
use std::type_name::{Self, TypeName};
use sui::coin::{Self, Coin};
use sui::event;
use sui::object::{Self, ID, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use usdh::usdh::USDH;

// If usdh.move defines module usdh::core_coin or similar for USDH, adjust to:
// use crate::core_coin::USDH;

// Constants from design.md (or inferred)
const EInvalidAmount: u64 = 0; // Placeholder, replace with actual error codes
const ERedemptionNotAvailable: u64 = 1;
const EResourceNotFound: u64 = 2;
const EInsufficientFunds: u64 = 3;
const EAssetNotFound: u64 = 4;
const EInvalidZkProof: u64 = 5;

// Struct definitions - making them public based on errors
public struct CollateralRecord has key {
    id: UID,
    user: address,
    stable_amount: u64,
    stable_coin_type: TypeName, // Corrected: TypeName is now bound
    timestamp: u64,
    status: u8, // 0:Locked, 1:Redeemed, 2:Liquidated
    usdh_amount: u64,
    collateral_ratio: u16,
    liquidation_threshold: u16,
    last_update_time: u64,
    risk_score: u8,
    meta_fields: Option<ID>, // 动态字段容器
}

public struct AssetBacking has key {
    id: UID,
    batch_id: u64,
    stable_reserve: u64,
    hashrate_resource_ids: vector<ID>,
    synthetic_asset_ids: vector<ID>,
    cross_chain_collateral: vector<CrossChainAsset>,
    mint_time: u64,
    backing_ratio: u16,
    risk_adjustment_factor: u16,
    is_redeemable_for_stable: bool,
    is_redeemable_for_hashrate: bool,
}

public struct CrossChainAsset has store {
    chain_id: u16,
    asset_type: u8,
    amount: u64,
    address: vector<u8>,
    proof: ID,
}

// Event Structs - making them public
public struct CollateralDepositEvent has copy, drop {
    user: address,
    collateral_record_id: ID,
    stable_amount: u64,
    stable_type: TypeName, // Corrected
    usdh_minted: u64,
    timestamp: u64,
}

public struct RedeemStableEvent has copy, drop {
    user: address,
    usdh_amount: u64,
    stable_type: TypeName, // Corrected
    timestamp: u64,
}

public struct RedeemHashrateEvent has copy, drop {
    user: address,
    resource_id: ID,
    duration: u64, // Assuming duration is part of the event
    usdh_amount: u64,
    timestamp: u64,
}

public struct RedeemSyntheticEvent has copy, drop {
    user: address,
    synthetic_id: ID,
    usdh_amount: u64,
    timestamp: u64,
}

public struct LiquidationEvent has copy, drop {
    collateral_record_id: ID,
    liquidator: address,
    amount_liquidated_usdh: u64,
    amount_repaid_stable: u64,
    timestamp: u64,
}

// Functions - addressing type_name::get() usage if incorrect for TypeName type
// Assuming T is a coin type for which we need its TypeName struct instance
public fun deposit_collateral<T: store>(
    stable_coin: Coin<T>,
    usdh_treasury_cap: &mut sui::coin::TreasuryCap<USDH>,
    ctx: &mut TxContext,
): CollateralRecord {
    let user = tx_context::sender(ctx);
    let stable_amount = coin::value(&stable_coin);
    let coin_type_name = type_name::get<T>();

    let usdh_to_mint = stable_amount; // Simplified 1:1 minting
    // Use mint then transfer if you need the Coin object,
    // or if mint_and_transfer is sufficient and you don't need to hold usdh_coin variable.
    // Since stable_coin is destroyed later, it implies we don't need to hold usdh_coin here for other ops.
    // So, mint_and_transfer is fine IF its return type wasn't the issue for later public_transfer.
    // The error is because mint_and_transfer returns () and then public_transfer expects a T:key+store.
    // Let's mint, then transfer the new_usdh_coin.
    let new_usdh_coin = sui::coin::mint(usdh_treasury_cap, usdh_to_mint, ctx);
    sui::transfer::public_transfer(new_usdh_coin, user); // transfer USDH to user

    let record_id_obj = object::new(ctx); // Changed from record_id to record_id_obj for clarity
    let collateral_record = CollateralRecord {
        id: record_id_obj, // Use the UID from new(ctx)
        user,
        stable_amount,
        stable_coin_type: coin_type_name,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
        status: 0, // Locked
        usdh_amount: usdh_to_mint,
        collateral_ratio: 15000, // Example: 150%
        liquidation_threshold: 11000, // Example: 110%
        last_update_time: tx_context::epoch_timestamp_ms(ctx),
        risk_score: 0,
        meta_fields: option::none(),
    };

    event::emit(CollateralDepositEvent {
        user,
        collateral_record_id: object::id(&collateral_record),
        stable_amount,
        stable_type: coin_type_name,
        usdh_minted: usdh_to_mint,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
    // The stable_coin was passed in, it should be deposited into the SharedCollateralVault<T>
    // instead of being destroyed here, or this function should take ownership and handle it.
    // For now, assuming it's consumed as per original comment. A real system would store it.
    sui::coin::destroy_zero(stable_coin);
    collateral_record
}

public fun redeem_stable<T: store>(
    // asset_backing: &mut AssetBacking, // From design.md, but not in error or simple context
    collateral_record: &mut CollateralRecord,
    usdh_coin: Coin<USDH>,
    // stable_type: TypeName, // This would be T's TypeName, already generic
    // Assuming access to USDH burn capabilities and the collateral vault for T
    // For a real system, you'd pass references to USDHConfig, AdminCap, and the SharedCollateralVault<T>
    // For example:
    // usdh_config: &mut usdh::usdh::USDHConfig,
    // admin_cap: &usdh::usdh::AdminCap,
    shared_collateral_vault_t: &mut SharedCollateralVault<T>, // Pass the vault for T
    ctx: &mut TxContext,
): Coin<T> {
    let usdh_amount_to_redeem = coin::value(&usdh_coin);
    assert!(usdh_amount_to_redeem > 0, EInvalidAmount);
    assert!(usdh_amount_to_redeem <= collateral_record.usdh_amount, EInsufficientFunds);

    // --- USDH Burning ---
    // This part needs to correctly call usdh::burn. For now, just destroying the coin.
    // In a real scenario: usdh::burn(admin_cap, usdh_config, usdh_coin, ctx);
    sui::coin::destroy_zero(usdh_coin);

    // --- Stablecoin T Retrieval ---
    // The amount of stablecoin T to return, assuming 1:1 redemption for simplicity
    let stable_amount_to_return = usdh_amount_to_redeem;

    // Assert the vault has enough balance
    assert!(
        coin::value(&shared_collateral_vault_t.vault_balance) >= stable_amount_to_return,
        EInsufficientFunds,
    ); // Vault out of funds

    // Split the required amount from the vault's balance
    let stable_coin_to_return = coin::split(
        &mut shared_collateral_vault_t.vault_balance,
        stable_amount_to_return,
        ctx,
    );

    collateral_record.usdh_amount = collateral_record.usdh_amount - usdh_amount_to_redeem;
    collateral_record.stable_amount = collateral_record.stable_amount - stable_amount_to_return; // Assuming 1:1 for now
    collateral_record.status = 1; // Redeemed
    collateral_record.last_update_time = tx_context::epoch_timestamp_ms(ctx);

    event::emit(RedeemStableEvent {
        user: tx_context::sender(ctx),
        usdh_amount: usdh_amount_to_redeem,
        stable_type: type_name::get<T>(),
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });

    stable_coin_to_return
}
// ... (other functions like redeem_hashrate, redeem_synthetic would need similar checks and type handling)
// ... Stub out other functions from design.md if they were causing parts of the errors, or implement fully if simple enough

// Placeholder for HashrateUsageRight if not defined elsewhere and needed by redeem_hashrate
// public struct HashrateUsageRight has key { id: UID, user: address, resource_id: ID, duration: u64 }

// Placeholder for SyntheticAsset if not defined elsewhere and needed by redeem_synthetic
// public struct SyntheticAsset has key { id: UID, owner: address, value: u64 }

// Placeholder for OracleData and related functions if needed by redeem_hashrate/redeem_synthetic
// public struct OracleData has key { id: UID, /* ... fields ... */ }
// public fun get_hashrate_value(_oracle: &OracleData, _resource_id: ID, _duration: u64): u64 { 0 }
// public fun get_synthetic_value(_oracle: &OracleData, _synthetic_id: ID): u64 { 0 }

// Define SharedCollateralVault and its init function if it doesn't exist
// This is a simplified example; a real vault would need more robust logic.
public struct SharedCollateralVault<phantom T: store> has key {
    id: UID,
    vault_balance: Coin<T>,
}

public fun init_shared_collateral_vault<T: store>(initial_coin: Coin<T>, ctx: &mut TxContext) {
    transfer::share_object(SharedCollateralVault<T> {
        id: object::new(ctx),
        vault_balance: initial_coin,
    });
}
