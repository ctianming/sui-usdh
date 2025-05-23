/*
 * USDH: 基于Sui区块链的算力支持可编程稳定币系统
 * 资金单元模块: 实现可编程资金管理机制
 */
module usdh::fund_unit;

use std::option::{Self, Option, some, none, is_some, extract};
use std::string::{Self, String};
use std::type_name::{Self, TypeName};
use std::vector;
use sui::bag::{Self, Bag};
use sui::bcs;
use sui::coin::{Self, Coin};
use sui::dynamic_field;
use sui::event;
use sui::hash;
use sui::object::{Self, ID, UID};
use sui::table::{Self, Table};
use sui::table_vec::{Self, TableVec};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use sui::vec_map::{Self, VecMap};
use usdh::treasury::{Self, Treasury};
use usdh::usdh::USDH;

/// A simple bag structure to hold dynamic fields for a FundUnit.
public struct FieldBag has key, store {
    id: UID,
    items: Bag,
}

/// 资金单元对象，实现可编程资金管理
public struct FundUnit has key, store {
    id: UID,
    original_owner: address,
    current_owner: address,
    coin_type: TypeName,
    purpose_tags: vector<String>,
    release_time: u64,
    transferable: bool,
    white_list: vector<address>,
    black_list: vector<address>,
    daily_limit: u64,
    max_transfer: u64,
    condition_metadata: String,
    is_loan: bool,
    is_repaid: bool,
    last_update_time: u64,
    authorized_signers: vector<address>,
    quorum_threshold: u8,
    expiration_policy: u8,
    privacy_level: u8,
    usage_audit_trail: vector<TransactionRecord>,
    meta_fields: Option<ID>,
    zk_proof_required: bool,
}

/// 交易记录，用于审计
public struct TransactionRecord has drop, store {
    timestamp: u64,
    recipient: Option<address>,
    amount: Option<u64>,
    purpose_tag: Option<String>,
    transaction_digest: vector<u8>,
    zk_compliance_proof: Option<vector<u8>>,
}

/// 多签授权记录
public struct Authorization has key, store {
    id: UID,
    fund_unit_id: ID,
    transaction_id: u64,
    recipient: address,
    amount: u64,
    purpose_tag: Option<String>,
    authorized_by: vector<address>,
    is_completed: bool,
    created_at: u64,
    expires_at: u64,
}

// 资金单元事件定义
public struct FundUnitCreateEvent has copy, drop {
    fund_unit_id: ID,
    creator: address,
    amount_deposited: u64,
    purpose_tags: vector<String>,
    release_time: u64,
    timestamp: u64,
}

public struct FundUnitTransferEvent has copy, drop {
    fund_unit_id: ID,
    from: address,
    to: address,
    amount_transferred: u64,
    purpose_tag: Option<String>,
    timestamp: u64,
}

public struct FundUnitPrivateTransferEvent has copy, drop {
    fund_unit_id: ID,
    transaction_digest: vector<u8>,
    timestamp: u64,
}

public struct FundUnitPropertyAddEvent has copy, drop {
    fund_unit_id: ID,
    property_name: String,
    property_type: TypeName,
    timestamp: u64,
}

public struct AuthorizationCreatedEvent has copy, drop {
    authorization_id: ID,
    fund_unit_id: ID,
    creator: address,
    recipient: address,
    amount: u64,
    timestamp: u64,
}

public struct AuthorizationApprovedEvent has copy, drop {
    authorization_id: ID,
    fund_unit_id: ID,
    approver: address,
    timestamp: u64,
}

// 错误常量
const ENotCurrentOwner: u64 = 0;
const ETimeNotReached: u64 = 1;
const EInvalidAmount: u64 = 2;
const ERecipientNotAllowed: u64 = 3;
const ERecipientBlacklisted: u64 = 4;
const EUnauthorizedModification: u64 = 5;
const EZkProofRequired: u64 = 6;
const EInvalidZkProof: u64 = 7;
const EDynamicFieldsNotInitialized: u64 = 8;
const EExceedsMaxTransfer: u64 = 9;
const EExceedsDailyLimit: u64 = 10;
const EInsufficientFunds: u64 = 11;
const EInvalidOperation: u64 = 12;
const EAuthorizationNotFound: u64 = 13;
const EAlreadyAuthorized: u64 = 14;
const EAuthorizationExpired: u64 = 15;
const EQuorumNotReached: u64 = 16;
const EAlreadyComplete: u64 = 17;
const ESharedTreasuryNotProvided: u64 = 211;

/// 创建资金单元
public entry fun create_fund_unit(
    treasury_obj: &mut Treasury,
    coin_to_deposit: Coin<USDH>,
    purpose_tags: vector<String>,
    release_time: u64,
    transferable: bool,
    white_list: vector<address>,
    black_list: vector<address>,
    daily_limit: u64,
    max_transfer: u64,
    condition_metadata: String,
    authorized_signers: vector<address>,
    quorum_threshold: u8,
    expiration_policy: u8,
    privacy_level: u8,
    zk_proof_required: bool,
    ctx: &mut TxContext,
) {
    let amount_deposited = coin::value(&coin_to_deposit);
    assert!(amount_deposited > 0, EInvalidAmount);

    let sender = tx_context::sender(ctx);
    let new_fund_unit_id_obj = object::new(ctx);

    let fund_unit = FundUnit {
        id: new_fund_unit_id_obj,
        original_owner: sender,
        current_owner: sender,
        coin_type: type_name::get<USDH>(),
        purpose_tags: purpose_tags,
        release_time: release_time,
        transferable: transferable,
        white_list: white_list,
        black_list: black_list,
        daily_limit: daily_limit,
        max_transfer: max_transfer,
        condition_metadata: condition_metadata,
        is_loan: false,
        is_repaid: false,
        last_update_time: tx_context::epoch_timestamp_ms(ctx),
        authorized_signers: authorized_signers,
        quorum_threshold: quorum_threshold,
        expiration_policy: expiration_policy,
        privacy_level: privacy_level,
        usage_audit_trail: vector::empty<TransactionRecord>(),
        meta_fields: none<ID>(),
        zk_proof_required: zk_proof_required,
    };

    let fund_unit_actual_id = object::id(&fund_unit);
    treasury::deposit_to_fund_unit(treasury_obj, coin_to_deposit, fund_unit_actual_id, ctx);

    event::emit(FundUnitCreateEvent {
        fund_unit_id: fund_unit_actual_id,
        creator: sender,
        amount_deposited: amount_deposited,
        purpose_tags: copy fund_unit.purpose_tags,
        release_time: fund_unit.release_time,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });

    transfer::public_transfer(fund_unit, sender);
}

/// 从资金单元转出资金
public entry fun transfer_from_fund_unit(
    treasury_obj: &mut Treasury,
    fund_unit: &mut FundUnit,
    recipient: address,
    amount_to_transfer: u64,
    purpose_tag: Option<String>,
    zk_proof: Option<vector<u8>>,
    ctx: &mut TxContext,
) {
    let current_time = tx_context::epoch_timestamp_ms(ctx);
    assert!(current_time >= fund_unit.release_time, ETimeNotReached);

    let current_balance = treasury::get_fund_unit_balance(treasury_obj, object::id(fund_unit));
    assert!(amount_to_transfer > 0 && amount_to_transfer <= current_balance, EInvalidAmount);

    if (fund_unit.max_transfer > 0) {
        assert!(amount_to_transfer <= fund_unit.max_transfer, EExceedsMaxTransfer);
    };

    let sender = tx_context::sender(ctx);
    assert!(sender == fund_unit.current_owner, ENotCurrentOwner);

    if (!vector::is_empty(&fund_unit.white_list)) {
        assert!(vector::contains(&fund_unit.white_list, &recipient), ERecipientNotAllowed);
    };

    if (!vector::is_empty(&fund_unit.black_list)) {
        assert!(!vector::contains(&fund_unit.black_list, &recipient), ERecipientBlacklisted);
    };

    if (fund_unit.zk_proof_required) {
        assert!(option::is_some(&zk_proof), EZkProofRequired);
        let _proof_data = option::extract(&mut zk_proof);
    };

    let coin_transferred = treasury::withdraw_from_fund_unit(
        treasury_obj,
        object::id(fund_unit),
        amount_to_transfer,
        ctx,
    );

    let record = TransactionRecord {
        timestamp: current_time,
        recipient: if (fund_unit.privacy_level >= 2) { option::none() } else {
            option::some(recipient)
        },
        amount: if (fund_unit.privacy_level == 1 || fund_unit.privacy_level == 3) { option::none() }
        else { option::some(amount_to_transfer) },
        purpose_tag,
        transaction_digest: *tx_context::digest(ctx),
        zk_compliance_proof: option::none(),
    };
    vector::push_back(&mut fund_unit.usage_audit_trail, record);

    if (fund_unit.privacy_level == 0) {
        event::emit(FundUnitTransferEvent {
            fund_unit_id: object::id(fund_unit),
            from: sender,
            to: recipient,
            amount_transferred: amount_to_transfer,
            purpose_tag: copy purpose_tag,
            timestamp: current_time,
        });
    } else {
        event::emit(FundUnitPrivateTransferEvent {
            fund_unit_id: object::id(fund_unit),
            transaction_digest: *tx_context::digest(ctx),
            timestamp: current_time,
        });
    };
    transfer::public_transfer(coin_transferred, recipient);
}

/// 为资金单元添加动态属性
public entry fun add_property_to_fund_unit<T: store>(
    fund_unit: &mut FundUnit,
    property_name: String,
    property_value: T,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    assert!(
        sender == fund_unit.original_owner || vector::contains(&fund_unit.authorized_signers, &sender),
        EUnauthorizedModification,
    );

    if (is_none(&fund_unit.meta_fields)) {
        abort (EDynamicFieldsNotInitialized);
    };

    dynamic_field::add(&mut fund_unit.id, property_name, property_value);

    event::emit(FundUnitPropertyAddEvent {
        fund_unit_id: object::id(fund_unit),
        property_name: property_name,
        property_type: type_name::get<T>(),
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}

/// 创建多签授权请求
public entry fun create_authorization(
    fund_unit: &FundUnit,
    treasury_obj: &Treasury,
    recipient_addr: address,
    amount_val: u64,
    purpose_tag_opt_bytes: vector<u8>,
    expiration_time_ms: u64,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    assert!(
        sender == fund_unit.current_owner || vector::contains(&fund_unit.authorized_signers, &sender),
        ENotCurrentOwner,
    );
    let current_balance = treasury::get_fund_unit_balance(treasury_obj, object::id(fund_unit));
    assert!(amount_val > 0 && amount_val <= current_balance, EInvalidAmount);

    let purpose_tag_opt_str = if (vector::length(&purpose_tag_opt_bytes) > 0) {
        some(string::utf8(purpose_tag_opt_bytes))
    } else {
        none<String>()
    };

    let auth_id_obj = object::new(ctx);
    let auth = Authorization {
        id: auth_id_obj,
        fund_unit_id: object::id(fund_unit),
        transaction_id: vector::length(&fund_unit.usage_audit_trail) + 1,
        recipient: recipient_addr,
        amount: amount_val,
        purpose_tag: purpose_tag_opt_str,
        authorized_by: vector[sender],
        is_completed: false,
        created_at: tx_context::epoch_timestamp_ms(ctx),
        expires_at: expiration_time_ms,
    };

    event::emit(AuthorizationCreatedEvent {
        authorization_id: object::id(&auth),
        fund_unit_id: object::id(fund_unit),
        creator: sender,
        recipient: recipient_addr,
        amount: amount_val,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
    transfer::share_object(auth);
}

/// 审批多签授权
public entry fun approve_authorization(
    fund_unit: &mut FundUnit,
    auth: &mut Authorization,
    _ctx: &mut TxContext,
) {
    assert!(!auth.is_completed, EAlreadyComplete);
    assert!(auth.fund_unit_id == object::id(fund_unit), EInvalidOperation);
    assert!(tx_context::epoch_timestamp_ms(_ctx) <= auth.expires_at, EAuthorizationExpired);

    let sender = tx_context::sender(_ctx);
    assert!(vector::contains(&fund_unit.authorized_signers, &sender), EUnauthorizedModification);
    assert!(!vector::contains(&auth.authorized_by, &sender), EAlreadyAuthorized);

    vector::push_back(&mut auth.authorized_by, sender);

    event::emit(AuthorizationApprovedEvent {
        authorization_id: object::id(auth),
        fund_unit_id: object::id(fund_unit),
        approver: sender,
        timestamp: tx_context::epoch_timestamp_ms(_ctx),
    });
}

/// 执行已授权的转账（可以是一个新的 entry function）
public entry fun execute_authorized_transfer(
    treasury_obj: &mut Treasury,
    fund_unit: &mut FundUnit,
    auth: &mut Authorization,
    ctx: &mut TxContext,
) {
    assert!(auth.is_completed == false, EAlreadyComplete);
    assert!(auth.fund_unit_id == object::id(fund_unit), EInvalidOperation);
    assert!(tx_context::epoch_timestamp_ms(ctx) <= auth.expires_at, EAuthorizationExpired);
    assert!(
        vector::length(&auth.authorized_by) >= (fund_unit.quorum_threshold as u64),
        EQuorumNotReached,
    );

    auth.is_completed = true;

    let current_balance = treasury::get_fund_unit_balance(treasury_obj, object::id(fund_unit));
    assert!(auth.amount > 0 && auth.amount <= current_balance, EInsufficientFunds);

    let coin_to_transfer = treasury::withdraw_from_fund_unit(
        treasury_obj,
        object::id(fund_unit),
        auth.amount,
        ctx,
    );

    let record = TransactionRecord {
        timestamp: tx_context::epoch_timestamp_ms(ctx),
        recipient: if (fund_unit.privacy_level >= 2) { none<address>() } else {
            some(auth.recipient)
        },
        amount: if (fund_unit.privacy_level == 1 || fund_unit.privacy_level == 3) { none<u64>() }
        else { some(auth.amount) },
        purpose_tag: copy auth.purpose_tag,
        transaction_digest: *tx_context::digest(ctx),
        zk_compliance_proof: none<vector<u8>>(),
    };
    vector::push_back(&mut fund_unit.usage_audit_trail, record);
    fund_unit.last_update_time = tx_context::epoch_timestamp_ms(ctx);

    if (fund_unit.privacy_level == 0) {
        event::emit(FundUnitTransferEvent {
            fund_unit_id: object::id(fund_unit),
            from: fund_unit.current_owner,
            to: auth.recipient,
            amount_transferred: auth.amount,
            purpose_tag: copy auth.purpose_tag,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    } else {
        event::emit(FundUnitPrivateTransferEvent {
            fund_unit_id: object::id(fund_unit),
            transaction_digest: *tx_context::digest(ctx),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    };
    transfer::public_transfer(coin_to_transfer, auth.recipient);
}

fun is_none<T>(opt: &Option<T>): bool {
    !option::is_some(opt)
}
