/*
 * USDH: 基于Sui区块链的算力支持可编程稳定币系统
 * 抵押机制模块: 实现多层资产支持模型
 */
module usdh::collateral;

use std::option::{Self, Option};
use std::string::{Self, String};
use std::vector;
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::dynamic_field;
use sui::event;
use sui::math;
use sui::object::{Self, ID, UID};
use sui::table::{Self, Table};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use sui::type_name::{Self, TypeName};
use usdh::usdh::USDH;

/// 抵押记录
struct CollateralRecord has key {
    id: UID,
    user: address,
    stable_amount: u64, // 抵押的稳定币数量
    stable_coin_type: TypeName, // 稳定币类型
    timestamp: u64, // 抵押时间戳
    status: u8, // 0:Locked, 1:Redeemed, 2:Liquidated
    usdh_amount: u64, // 铸造的USDH数量
    collateral_ratio: u16, // 抵押率(基点)
    liquidation_threshold: u16, // 清算阈值(基点)
    last_update_time: u64, // 最后更新时间
    risk_score: u8, // 风险评分(0-100)
    meta_fields: Option<ID>, // 动态字段容器
}

/// 多层资产支持记录
struct AssetBacking has key {
    id: UID,
    batch_id: u64, // 铸造批次唯一标识
    stable_reserve: u64, // 该批次锁定的稳定币数量
    hashrate_resource_ids: vector<ID>, // 对应算力资源的ID列表
    synthetic_asset_ids: vector<ID>, // 关联合成资产ID列表
    cross_chain_collateral: vector<CrossChainAsset>, // 跨链抵押资产
    mint_time: u64, // 铸造时间
    backing_ratio: u16, // 资产覆盖率（基点，10000=100%）
    risk_adjustment_factor: u16, // 风险调整因子
    is_redeemable_for_stable: bool, // 稳定币赎回通道是否开启
    is_redeemable_for_hashrate: bool, // 算力赎回通道是否开启
}

/// 跨链抵押资产记录
struct CrossChainAsset has store {
    chain_id: u16, // 链ID
    asset_type: u8, // 资产类型
    amount: u64, // 资产数量
    address: vector<u8>, // 资产地址
    proof: ID, // 跨链证明
}

// 资产类型常量
const ASSET_TYPE_TOKEN: u8 = 0;
const ASSET_TYPE_NFT: u8 = 1;
const ASSET_TYPE_SYNTHETIC_ASSET: u8 = 2;
const ASSET_TYPE_LIQUIDITY_POSITION: u8 = 3;

// 抵押状态常量
const STATUS_LOCKED: u8 = 0;
const STATUS_REDEEMED: u8 = 1;
const STATUS_LIQUIDATED: u8 = 2;

// 错误常量
const EInvalidAmount: u64 = 0;
const EInsufficientCollateral: u64 = 1;
const EInvalidCollateralRatio: u64 = 2;
const ENotOwner: u64 = 3;
const EInvalidStatus: u64 = 4;
const ERedemptionNotAvailable: u64 = 5;
const EResourceNotFound: u64 = 6;
const EInsufficientFunds: u64 = 7;
const EAssetNotFound: u64 = 8;
const EInvalidProof: u64 = 9;
const ESystemPaused: u64 = 10;

// 事件定义
struct CollateralDepositEvent has copy, drop {
    user: address,
    record_id: ID,
    stable_amount: u64,
    stable_type: TypeName,
    collateral_ratio: u16,
    usdh_amount: u64,
    timestamp: u64,
}

struct RedeemStableEvent has copy, drop {
    user: address,
    usdh_amount: u64,
    stable_type: TypeName,
    timestamp: u64,
}

struct RedeemHashrateEvent has copy, drop {
    user: address,
    resource_id: ID,
    duration: u64,
    usdh_amount: u64,
    timestamp: u64,
}

struct RedeemSyntheticEvent has copy, drop {
    user: address,
    synthetic_id: ID,
    usdh_amount: u64,
    timestamp: u64,
}

struct LiquidationEvent has copy, drop {
    user: address,
    record_id: ID,
    liquidated_amount: u64,
    penalty_amount: u64,
    liquidator: address,
    timestamp: u64,
}

/// 抵押稳定币并铸造USDH
public entry fun deposit_collateral<T>(coin: Coin<T>, collateral_ratio: u16, ctx: &mut TxContext) {
    // 检查抵押参数
    let coin_amount = coin::value(&coin);
    assert!(coin_amount > 0, EInvalidAmount);
    assert!(collateral_ratio >= 13000, EInvalidCollateralRatio); // 至少130%抵押率

    let user = tx_context::sender(ctx);
    let now = tx_context::epoch_timestamp_ms(ctx);

    // 计算可铸造的USDH数量
    // 抵押率 = 抵押物价值 / 铸造USDH价值 * 10000
    // 铸造USDH = 抵押物价值 * 10000 / 抵押率
    let usdh_amount = (coin_amount * 10000) / (collateral_ratio as u64);

    // 创建抵押记录
    let record = CollateralRecord {
        id: object::new(ctx),
        user,
        stable_amount: coin_amount,
        stable_coin_type: type_name::get<T>(),
        timestamp: now,
        status: STATUS_LOCKED,
        usdh_amount,
        collateral_ratio,
        liquidation_threshold: collateral_ratio - 1000, // 清算阈值低于抵押率10%
        last_update_time: now,
        risk_score: 0,
        meta_fields: option::none(),
    };

    let record_id = object::id(&record);

    // 创建资产支持记录
    let asset_backing = AssetBacking {
        id: object::new(ctx),
        batch_id: now, // 使用时间戳作为批次ID
        stable_reserve: coin_amount,
        hashrate_resource_ids: vector::empty(),
        synthetic_asset_ids: vector::empty(),
        cross_chain_collateral: vector::empty(),
        mint_time: now,
        backing_ratio: collateral_ratio,
        risk_adjustment_factor: 10000, // 100%
        is_redeemable_for_stable: true,
        is_redeemable_for_hashrate: false, // 初始不可赎回算力
    };

    // 在真实实现中，这里应该将稳定币存入Treasury并铸造USDH
    // 抵押的稳定币也应该用于购买算力资源

    // 简化实现，只记录事务
    transfer::public_transfer(coin, user); // 实际应转入Treasury

    // 发出事件
    event::emit(CollateralDepositEvent {
        user,
        record_id,
        stable_amount: coin_amount,
        stable_type: type_name::get<T>(),
        collateral_ratio,
        usdh_amount,
        timestamp: now,
    });

    // 共享对象
    transfer::share_object(record);
    transfer::share_object(asset_backing);
}

/// 赎回稳定币
public entry fun redeem_stable<T>(
    asset_backing: &mut AssetBacking,
    usdh_amount: u64,
    ctx: &mut TxContext,
) {
    // 验证参数
    assert!(usdh_amount > 0, EInvalidAmount);
    assert!(asset_backing.is_redeemable_for_stable, ERedemptionNotAvailable);

    // 验证USDH余额（此处简化，实际应验证转入的USDH代币）

    // 在真实实现中，这里应该
    // 1. 销毁USDH
    // 2. 从储备中释放稳定币
    // 3. 将稳定币转给用户

    // 更新资产支持记录
    asset_backing.stable_reserve = asset_backing.stable_reserve - usdh_amount;

    // 发出赎回事件
    event::emit(RedeemStableEvent {
        user: tx_context::sender(ctx),
        usdh_amount,
        stable_type: type_name::get<T>(),
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}

/// 赎回算力资源使用权
public entry fun redeem_hashrate(
    asset_backing: &mut AssetBacking,
    resource_id: ID,
    duration: u64,
    usdh_amount: u64,
    ctx: &mut TxContext,
) {
    // 验证参数
    assert!(asset_backing.is_redeemable_for_hashrate, ERedemptionNotAvailable);
    assert!(
        vector::contains(&asset_backing.hashrate_resource_ids, &resource_id),
        EResourceNotFound,
    );

    // 在真实实现中，这里应该
    // 1. 验证USDH余额
    // 2. 销毁USDH
    // 3. 创建算力使用权凭证
    // 4. 将凭证转给用户

    // 发出赎回事件
    event::emit(RedeemHashrateEvent {
        user: tx_context::sender(ctx),
        resource_id,
        duration,
        usdh_amount,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}

/// 赎回合成资产
public entry fun redeem_synthetic(
    asset_backing: &mut AssetBacking,
    synthetic_id: ID,
    usdh_amount: u64,
    ctx: &mut TxContext,
) {
    // 验证参数
    assert!(vector::contains(&asset_backing.synthetic_asset_ids, &synthetic_id), EAssetNotFound);

    // 在真实实现中，这里应该
    // 1. 获取合成资产价值
    // 2. 验证USDH余额
    // 3. 销毁USDH
    // 4. 转移合成资产所有权

    // 从资产支持中移除合成资产ID
    let (contains, index) = vector::index_of(&asset_backing.synthetic_asset_ids, &synthetic_id);
    if (contains) {
        vector::remove(&mut asset_backing.synthetic_asset_ids, index);
    };

    // 发出赎回事件
    event::emit(RedeemSyntheticEvent {
        user: tx_context::sender(ctx),
        synthetic_id,
        usdh_amount,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}

/// 清算不健康的抵押仓位
public entry fun liquidate_position(
    record: &mut CollateralRecord,
    usdh_amount: u64,
    ctx: &mut TxContext,
) {
    // 在真实实现中，这里应该
    // 1. 检查抵押仓位是否达到清算条件
    // 2. 验证USDH余额
    // 3. 销毁USDH
    // 4. 计算应返还的抵押物（扣除罚金）
    // 5. 将抵押物转给清算人

    // 简化实现
    record.status = STATUS_LIQUIDATED;

    // 发出清算事件
    event::emit(LiquidationEvent {
        user: record.user,
        record_id: object::id(record),
        liquidated_amount: usdh_amount,
        penalty_amount: usdh_amount / 10, // 10%罚金
        liquidator: tx_context::sender(ctx),
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}

/// 添加资产到资产支持记录
public entry fun add_hashrate_resource(
    asset_backing: &mut AssetBacking,
    resource_id: ID,
    ctx: &mut TxContext,
) {
    // 在真实实现中，这里应该验证资源存在且可用

    // 添加算力资源ID
    vector::push_back(&mut asset_backing.hashrate_resource_ids, resource_id);

    // 启用算力赎回通道
    if (vector::length(&asset_backing.hashrate_resource_ids) > 0) {
        asset_backing.is_redeemable_for_hashrate = true;
    };
}

/// 添加跨链抵押资产
public entry fun add_cross_chain_asset(
    asset_backing: &mut AssetBacking,
    chain_id: u16,
    asset_type: u8,
    amount: u64,
    address: vector<u8>,
    proof_id: ID,
    ctx: &mut TxContext,
) {
    // 在真实实现中，这里应该验证跨链证明的有效性

    // 创建跨链资产记录
    let asset = CrossChainAsset {
        chain_id,
        asset_type,
        amount,
        address,
        proof: proof_id,
    };

    // 添加到抵押记录
    vector::push_back(&mut asset_backing.cross_chain_collateral, asset);
}

/// 计算当前抵押率
public fun calculate_current_ratio(record: &CollateralRecord, current_collateral_value: u64): u16 {
    if (record.usdh_amount == 0) {
        return 10000 // 默认100%
    };

    ((current_collateral_value * 10000) / record.usdh_amount) as u16
}

/// 检查抵押仓位是否健康
public fun is_position_healthy(record: &CollateralRecord, current_collateral_value: u64): bool {
    let current_ratio = calculate_current_ratio(record, current_collateral_value);
    current_ratio >= record.liquidation_threshold
}
