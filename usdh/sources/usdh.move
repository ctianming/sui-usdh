module usdh::usdh;

use std::option::{Self, Option, some, none};
use std::string::{Self, String};
use sui::coin::{Self, Coin, TreasuryCap, DenyCapV2, CoinMetadata};
use sui::deny_list::DenyList;
use sui::event;
use sui::object::{Self, ID, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use sui::url;

// USDH Coin Definition
public struct USDH has drop {}

// Admin Capability
public struct AdminCap has key {
    id: UID,
}

// Shared Configuration Object for USDH
public struct USDHConfig has key {
    id: UID,
    owner: address, // Address of the admin/owner
    treasury_cap: TreasuryCap<USDH>,
    deny_cap: DenyCapV2<USDH>,
    coin_metadata_id: ID, // Store the ID of the frozen CoinMetadata object
    total_supply: u64, // Explicitly track total supply, though TreasuryCap also has it.
    paused: bool, // To pause minting/burning operations (local pause)
    // global_pause_allowed is implicitly true due to is_member_governance in create_regulated_currency_v2
}

// Constants for USDH coin
const USDH_DECIMALS: u8 = 6; // Example: 6 decimals like USDC/USDT
const USDH_SYMBOL: vector<u8> = b"USDH";
const USDH_NAME: vector<u8> = b"USDH Stablecoin";
const USDH_DESCRIPTION: vector<u8> =
    b"A regulated stablecoin backed by hashrate and other assets, part of the USDH ecosystem.";
// Replace with your actual icon URL if available
const USDH_ICON_URL_STRING: vector<u8> = b"https://usdh.network/usdh_icon.png"; // Example URL

// Event Structs
public struct MintEvent has copy, drop {
    amount_minted: u64,
    recipient: address,
    new_total_supply: u64,
}

public struct BurnEvent has copy, drop {
    amount_burned: u64,
    new_total_supply: u64,
}

public struct LocalPauseStateChanged has copy, drop {
    paused: bool,
}

public struct GlobalPauseStateChanged has copy, drop {
    enabled: bool, // true if global pause is enabled, false if disabled
}

public struct OwnershipTransferred has copy, drop {
    old_owner: address,
    new_owner: address,
}

// Error constants
const ENotAdmin: u64 = 1;
const ELocalPaused: u64 = 2;
const EAlreadyLocalPaused: u64 = 3;
const ENotLocalPaused: u64 = 4;
const EBurnAmountExceedsSupply: u64 = 5;
const EGlobalPauseNotAllowedByCoin: u64 = 6; // Although we set it to true

// Module initializer to create the regulated currency
fun init(otw: USDH, ctx: &mut TxContext) {
    let icon_url_obj = url::new_unsafe_from_bytes(copy USDH_ICON_URL_STRING);

    let (treasury_cap_val, deny_cap_val, metadata_obj): (
        TreasuryCap<USDH>,
        DenyCapV2<USDH>,
        CoinMetadata<USDH>,
    ) = coin::create_regulated_currency_v2(
        otw,
        USDH_DECIMALS,
        USDH_SYMBOL,
        USDH_NAME,
        USDH_DESCRIPTION,
        some(icon_url_obj), // Use the created URL object
        true, // is_member_governance set to true
        ctx,
    );

    let sender = tx_context::sender(ctx);
    // Get the ID before metadata_obj is moved by public_freeze_object
    let coin_metadata_id_val = object::id(&metadata_obj);
    transfer::public_freeze_object(metadata_obj); // Freeze the metadata to make it immutable

    let config = USDHConfig {
        id: object::new(ctx),
        owner: sender,
        treasury_cap: treasury_cap_val,
        deny_cap: deny_cap_val,
        coin_metadata_id: coin_metadata_id_val,
        total_supply: 0, // Initial supply is 0, mint as needed
        paused: false,
    };

    transfer::share_object(config);
    transfer::transfer(AdminCap { id: object::new(ctx) }, sender);
}

/// Mints new USDH coins. Requires AdminCap.
public entry fun mint(
    admin_cap: &AdminCap,
    config: &mut USDHConfig,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == config.owner, ENotAdmin); // Check if caller is owner via AdminCap presence
    assert!(!config.paused, ELocalPaused);

    let new_coin = coin::mint(&mut config.treasury_cap, amount, ctx);
    transfer::public_transfer(new_coin, recipient);
    config.total_supply = config.total_supply + amount;

    event::emit(MintEvent {
        amount_minted: amount,
        recipient: recipient,
        new_total_supply: config.total_supply,
    });
}

/// Burns USDH coins. Requires AdminCap.
public entry fun burn(
    admin_cap: &AdminCap,
    config: &mut USDHConfig,
    coin_to_burn: Coin<USDH>,
    _ctx: &mut TxContext, // Context might be used for events or future logic
) {
    assert!(!config.paused, ELocalPaused);

    let amount_to_burn = coin::value(&coin_to_burn);
    assert!(config.total_supply >= amount_to_burn, EBurnAmountExceedsSupply);

    coin::burn(&mut config.treasury_cap, coin_to_burn);
    config.total_supply = config.total_supply - amount_to_burn;

    event::emit(BurnEvent {
        amount_burned: amount_to_burn,
        new_total_supply: config.total_supply,
    });
}

/// Adds an address to the deny list for USDH. Requires AdminCap.
public entry fun add_to_deny_list(
    admin_cap: &AdminCap,
    config: &mut USDHConfig, // Changed to &mut to allow mutable borrow of deny_cap
    deny_list_shared_object: &mut DenyList,
    address_to_deny: address,
    ctx: &mut TxContext, // Added ctx as it is required by deny_list_v2_add
) {
    assert!(tx_context::sender(ctx) == config.owner, ENotAdmin);
    coin::deny_list_v2_add<USDH>(
        deny_list_shared_object,
        &mut config.deny_cap,
        address_to_deny,
        ctx,
    );
}

/// Removes an address from the deny list for USDH. Requires AdminCap.
public entry fun remove_from_deny_list(
    admin_cap: &AdminCap,
    config: &mut USDHConfig, // Changed to &mut to allow mutable borrow of deny_cap
    deny_list_shared_object: &mut DenyList,
    address_to_remove: address,
    ctx: &mut TxContext, // Added ctx as it is required by deny_list_v2_remove
) {
    assert!(tx_context::sender(ctx) == config.owner, ENotAdmin);
    coin::deny_list_v2_remove<USDH>(
        deny_list_shared_object,
        &mut config.deny_cap,
        address_to_remove,
        ctx,
    );
}

/// Pauses minting and burning operations. Requires AdminCap.
public entry fun local_pause_operations(
    admin_cap: &AdminCap,
    config: &mut USDHConfig,
    _ctx: &mut TxContext,
) {
    assert!(tx_context::sender(_ctx) == config.owner, ENotAdmin);
    assert!(!config.paused, EAlreadyLocalPaused);
    config.paused = true;
    event::emit(LocalPauseStateChanged { paused: true });
}

/// Unpauses minting and burning operations. Requires AdminCap.
public entry fun local_unpause_operations(
    admin_cap: &AdminCap,
    config: &mut USDHConfig,
    _ctx: &mut TxContext,
) {
    assert!(tx_context::sender(_ctx) == config.owner, ENotAdmin);
    assert!(config.paused, ENotLocalPaused);
    config.paused = false;
    event::emit(LocalPauseStateChanged { paused: false });
}

/// Enables global pause for the USDH. Requires AdminCap.
public entry fun global_pause_enable(
    admin_cap: &AdminCap,
    config: &mut USDHConfig,
    deny_list_shared_object: &mut DenyList,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == config.owner, ENotAdmin);
    coin::deny_list_v2_enable_global_pause<USDH>(
        deny_list_shared_object,
        &mut config.deny_cap,
        ctx,
    );
    event::emit(GlobalPauseStateChanged { enabled: true });
}

/// Disables global pause for the USDH. Requires AdminCap.
public entry fun global_pause_disable(
    admin_cap: &AdminCap,
    config: &mut USDHConfig,
    deny_list_shared_object: &mut DenyList,
    ctx: &mut TxContext,
) {
    assert!(tx_context::sender(ctx) == config.owner, ENotAdmin);
    coin::deny_list_v2_disable_global_pause<USDH>(
        deny_list_shared_object,
        &mut config.deny_cap,
        ctx,
    );
    event::emit(GlobalPauseStateChanged { enabled: false });
}

/// Transfers ownership of the USDHConfig and implicitly the AdminCap's authority.
public entry fun transfer_ownership(
    admin_cap: &AdminCap,
    new_owner_admin_cap: AdminCap,
    new_owner_address: address,
    config: &mut USDHConfig,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    assert!(sender == config.owner, ENotAdmin);
    let old_owner = config.owner;
    config.owner = new_owner_address;
    transfer::transfer(new_owner_admin_cap, new_owner_address);
    event::emit(OwnershipTransferred {
        old_owner: old_owner,
        new_owner: new_owner_address,
    });
    // The old admin_cap (held by `sender`) is implicitly consumed/invalidated by transferring ownership.
    // The sender should destroy or securely store their old AdminCap object.
    // For this function, we only care about transferring the new one.
}

// View Functions (Re-added)

public fun total_supply(config: &USDHConfig): u64 {
    config.total_supply
}

public fun coin_metadata_id(config: &USDHConfig): ID {
    config.coin_metadata_id
}

public fun is_local_paused(config: &USDHConfig): bool {
    config.paused
}

public fun owner(config: &USDHConfig): address {
    config.owner
}
