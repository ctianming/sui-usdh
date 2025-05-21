/*
 * USDH: 基于Sui区块链的算力支持可编程稳定币系统
 * 资金单元模块: 实现可编程资金管理机制
 */
module usdh::fund_unit;

use std::option::{Self, Option};
use std::string::{Self, String};
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
use sui::type_name::{Self, TypeName};
use sui::vec_map::{Self, VecMap};
use usdh::usdh::USDH;

/// 资金单元对象，实现可编程资金管理
struct FundUnit has key {
    id: UID,
    original_owner: address,
    current_owner: address,
    amount: u64,
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
struct TransactionRecord has store {
    timestamp: u64,
    recipient: Option<address>,
    amount: Option<u64>,
    purpose_tag: Option<String>,
    transaction_digest: vector<u8>,
    zk_compliance_proof: Option<vector<u8>>,
}

/// 多签授权记录
struct Authorization has key, store {
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
struct FundUnitCreateEvent has copy, drop {
    fund_unit_id: ID,
    creator: address,
    amount: u64,
    purpose_tags: vector<String>,
    release_time: u64,
    timestamp: u64,
}

struct FundUnitTransferEvent has copy, drop {
    fund_unit_id: ID,
    from: address,
    to: address,
    amount: u64,
    purpose_tag: Option<String>,
    timestamp: u64,
}

struct FundUnitPrivateTransferEvent has copy, drop {
    fund_unit_id: ID,
    transaction_digest: vector<u8>,
    timestamp: u64,
}

struct FundUnitPropertyAddEvent has copy, drop {
    fund_unit_id: ID,
    property_name: String,
    property_type: TypeName,
    timestamp: u64,
}

struct AuthorizationCreatedEvent has copy, drop {
    authorization_id: ID,
    fund_unit_id: ID,
    creator: address,
    recipient: address,
    amount: u64,
    timestamp: u64,
}

struct AuthorizationApprovedEvent has copy, drop {
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

/// 创建资金单元
public entry fun create_fund_unit<T>(
    coin: Coin<T>,
    purpose_tags: vector<String>,
    release_time: u64,
    transferable: bool,
    white_list: vector<address>,
    black_list: vector<address>,
    daily_limit: u64,
    max_transfer: u64,
    condition_metadata: vector<u8>,
    authorized_signers: vector<address>,
    quorum_threshold: u8,
    expiration_policy: u8,
    privacy_level: u8,
    zk_proof_required: bool,
    ctx: &mut TxContext,
) {
    // 确认金额大于0
    let amount = coin::value(&coin);
    assert!(amount > 0, EInvalidAmount);

    // 创建资金单元对象
    let sender = tx_context::sender(ctx);
    let fund_unit = FundUnit {
        id: object::new(ctx),
        original_owner: sender,
        current_owner: sender,
        amount,
        coin_type: type_name::get<T>(),
        purpose_tags,
        release_time,
        transferable,
        white_list,
        black_list,
        daily_limit,
        max_transfer,
        condition_metadata: string::utf8(condition_metadata),
        is_loan: false,
        is_repaid: false,
        last_update_time: tx_context::epoch_timestamp_ms(ctx),
        authorized_signers,
        quorum_threshold,
        expiration_policy,
        privacy_level,
        usage_audit_trail: vector::empty(),
        meta_fields: option::none(),
        zk_proof_required,
    };

    // 创建动态字段容器
    let dynamic_fields_container = object::new(ctx);
    option::fill(&mut fund_unit.meta_fields, object::id(&dynamic_fields_container));

    // 存储Coin到Treasury中 (实际实现应该调用Treasury模块)
    // 这里简化处理，只是转移代币所有权
    transfer::public_transfer(coin, sender);

    // 发出资金单元创建事件
    event::emit(FundUnitCreateEvent {
        fund_unit_id: object::id(&fund_unit),
        creator: sender,
        amount,
        purpose_tags: purpose_tags,
        release_time,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });

    // 转移资金单元所有权
    transfer::share_object(fund_unit);
}

/// 从资金单元转出资金
public entry fun transfer_from_fund_unit<T>(
    fund_unit: &mut FundUnit,
    recipient: address,
    amount: u64,
    purpose_tag: vector<u8>,
    ctx: &mut TxContext,
) {
    // 检查资金单元当前状态
    let current_time = tx_context::epoch_timestamp_ms(ctx);

    // 验证时间锁
    assert!(current_time >= fund_unit.release_time, ETimeNotReached);

    // 验证金额
    assert!(amount > 0 && amount <= fund_unit.amount, EInvalidAmount);

    // 验证每笔限额
    if (fund_unit.max_transfer > 0) {
        assert!(amount <= fund_unit.max_transfer, EExceedsMaxTransfer);
    };

    // 验证发起者身份
    let sender = tx_context::sender(ctx);
    assert!(sender == fund_unit.current_owner, ENotCurrentOwner);

    // 验证接收者白名单
    if (!vector::is_empty(&fund_unit.white_list)) {
        assert!(vector::contains(&fund_unit.white_list, &recipient), ERecipientNotAllowed);
    };

    // 验证接收者不在黑名单
    if (!vector::is_empty(&fund_unit.black_list)) {
        assert!(!vector::contains(&fund_unit.black_list, &recipient), ERecipientBlacklisted);
    };

    // 验证零知识证明 (在实际实现中应该调用ZK验证器)
    if (fund_unit.zk_proof_required) {};

    // 更新资金单元状态
    fund_unit.amount = fund_unit.amount - amount;

    // 在真实实现中，这里应该从Treasury提取资金并转给接收方
    // let coin = treasury::withdraw_from_fund_unit(treasury, object::id(fund_unit), amount, ctx);
    // transfer::public_transfer(coin, recipient);

    // 记录转账记录
    let purpose_tag_option = if (vector::length(&purpose_tag) > 0) {
        option::some(string::utf8(purpose_tag))
    } else {
        option::none()
    };

    let record = TransactionRecord {
        timestamp: current_time,
        recipient: if (fund_unit.privacy_level >= 2) {
            option::none()
        } else {
            option::some(recipient)
        },
        amount: if (fund_unit.privacy_level == 1 || fund_unit.privacy_level == 3) {
            option::none()
        } else {
            option::some(amount)
        },
        purpose_tag: purpose_tag_option,
        transaction_digest: tx_context::digest(ctx),
        zk_compliance_proof: option::none(),
    };

    vector::push_back(&mut fund_unit.usage_audit_trail, record);
    fund_unit.last_update_time = current_time;

    // 发出转账事件
    if (fund_unit.privacy_level == 0) {
        event::emit(FundUnitTransferEvent {
            fund_unit_id: object::id(fund_unit),
            from: sender,
            to: recipient,
            amount,
            purpose_tag: purpose_tag_option,
            timestamp: current_time,
        });
    } else {
        // 仅发布隐私保护版本的事件
        event::emit(FundUnitPrivateTransferEvent {
            fund_unit_id: object::id(fund_unit),
            transaction_digest: tx_context::digest(ctx),
            timestamp: current_time,
        });
    };
}

/// 为资金单元添加动态属性
public entry fun add_property_to_fund_unit<T: store>(
    fund_unit: &mut FundUnit,
    property_name: vector<u8>,
    property_value: T,
    ctx: &mut TxContext,
) {
    // 验证调用者权限
    let sender = tx_context::sender(ctx);
    assert!(
        sender == fund_unit.original_owner || 
            vector::contains(&fund_unit.authorized_signers, &sender),
        EUnauthorizedModification,
    );

    // 获取动态字段容器ID
    assert!(option::is_some(&fund_unit.meta_fields), EDynamicFieldsNotInitialized);

    // 添加动态字段
    let property_name_str = string::utf8(property_name);
    dynamic_field::add(&mut fund_unit.id, property_name_str, property_value);

    // 发出事件
    event::emit(FundUnitPropertyAddEvent {
        fund_unit_id: object::id(fund_unit),
        property_name: string::utf8(property_name),
        property_type: type_name::get<T>(),
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}

/// 创建多签授权请求
public entry fun create_authorization(
    fund_unit: &mut FundUnit,
    recipient: address,
    amount: u64,
    purpose_tag: vector<u8>,
    expiration_time: u64,
    ctx: &mut TxContext,
) {
    // 验证调用者身份
    let sender = tx_context::sender(ctx);
    assert!(
        sender == fund_unit.current_owner || 
            vector::contains(&fund_unit.authorized_signers, &sender),
        ENotCurrentOwner,
    );

    // 验证金额
    assert!(amount > 0 && amount <= fund_unit.amount, EInvalidAmount);

    // 创建授权请求
    let purpose_tag_option = if (vector::length(&purpose_tag) > 0) {
        option::some(string::utf8(purpose_tag))
    } else {
        option::none()
    };

    let auth = Authorization {
        id: object::new(ctx),
        fund_unit_id: object::id(fund_unit),
        transaction_id: vector::length(&fund_unit.usage_audit_trail) + 1,
        recipient,
        amount,
        purpose_tag: purpose_tag_option,
        authorized_by: vector[sender],
        is_completed: false,
        created_at: tx_context::epoch_timestamp_ms(ctx),
        expires_at: expiration_time,
    };

    // 发出授权创建事件
    event::emit(AuthorizationCreatedEvent {
        authorization_id: object::id(&auth),
        fund_unit_id: object::id(fund_unit),
        creator: sender,
        recipient,
        amount,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });

    // 分享授权对象
    transfer::share_object(auth);
}

/// 审批多签授权
public entry fun approve_authorization(
    fund_unit: &mut FundUnit,
    auth: &mut Authorization,
    ctx: &mut TxContext,
) {
    // 验证授权是否有效
    assert!(!auth.is_completed, EAlreadyComplete);
    assert!(auth.fund_unit_id == object::id(fund_unit), EInvalidOperation);
    assert!(tx_context::epoch_timestamp_ms(ctx) <= auth.expires_at, EAuthorizationExpired);

    // 验证审批者身份
    let sender = tx_context::sender(ctx);
    assert!(vector::contains(&fund_unit.authorized_signers, &sender), EUnauthorizedModification);
    assert!(!vector::contains(&auth.authorized_by, &sender), EAlreadyAuthorized);

    // 添加到已授权列表
    vector::push_back(&mut auth.authorized_by, sender);

    // 发出授权审批事件
    event::emit(AuthorizationApprovedEvent {
        authorization_id: object::id(auth),
        fund_unit_id: object::id(fund_unit),
        approver: sender,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });

    // 检查是否达到多签阈值
    if (vector::length(&auth.authorized_by) >= (fund_unit.quorum_threshold as u64)) {
        // 达到阈值，执行转账
        execute_authorized_transfer(fund_unit, auth, ctx);
    };
}

/// 执行已授权的转账（内部函数）
fun execute_authorized_transfer(
    fund_unit: &mut FundUnit,
    auth: &mut Authorization,
    ctx: &mut TxContext,
) {
    // 标记授权为已完成
    auth.is_completed = true;

    // 更新资金单元状态
    fund_unit.amount = fund_unit.amount - auth.amount;

    // 在真实实现中，这里应该从Treasury提取资金并转给接收方
    // let coin = treasury::withdraw_from_fund_unit(treasury, object::id(fund_unit), auth.amount, ctx);
    // transfer::public_transfer(coin, auth.recipient);

    // 记录转账记录
    let record = TransactionRecord {
        timestamp: tx_context::epoch_timestamp_ms(ctx),
        recipient: if (fund_unit.privacy_level >= 2) {
            option::none()
        } else {
            option::some(auth.recipient)
        },
        amount: if (fund_unit.privacy_level == 1 || fund_unit.privacy_level == 3) {
            option::none()
        } else {
            option::some(auth.amount)
        },
        purpose_tag: auth.purpose_tag,
        transaction_digest: tx_context::digest(ctx),
        zk_compliance_proof: option::none(),
    };

    vector::push_back(&mut fund_unit.usage_audit_trail, record);
    fund_unit.last_update_time = tx_context::epoch_timestamp_ms(ctx);

    // 发出转账事件
    if (fund_unit.privacy_level == 0) {
        event::emit(FundUnitTransferEvent {
            fund_unit_id: object::id(fund_unit),
            from: fund_unit.current_owner,
            to: auth.recipient,
            amount: auth.amount,
            purpose_tag: auth.purpose_tag,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    } else {
        // 仅发布隐私保护版本的事件
        event::emit(FundUnitPrivateTransferEvent {
            fund_unit_id: object::id(fund_unit),
            transaction_digest: tx_context::digest(ctx),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    };
}

// 用于条件付款的功能可以在真实实现中添加
// ...

// 检查日期限额的功能在真实实现中添加
// ...

// 零知识证明验证功能在真实实现中添加
// ...
