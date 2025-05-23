/*
 * USDH: 基于Sui区块链的算力支持可编程稳定币系统
 * Oracle模块: 实现价格数据和资源估值功能
 */
module usdh::oracle;

use std::option::{Self, Option};
use std::string::{Self, String};
use std::vector;
use sui::dynamic_field;
use sui::event;
use sui::math;
use sui::object::{Self, ID, UID};
use sui::table::{Self, Table};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use sui::vec_map::{Self, VecMap};
use usdh::hashrate_resource::{ComputeResourceCredential, ResourcePerformanceData};

/// Oracle数据结构
public struct OracleData has key {
    id: UID,
    compute_power_price_usd: u64, // 算力价格(USD/单位·小时)
    stable_coin_price_usd: u64, // 稳定币价格
    price_volatility: u16, // 价格波动性(基点)
    market_demand_index: u16, // 市场需求指数(0-10000)
    last_update_time: u64, // 最近更新时间
}

/// Oracle数据源配置
public struct OracleSource has store {
    oracle_address: address, // Oracle提供者地址
    oracle_type: u8, // 0:Pyth, 1:Switchboard, 2:Chainlink, 3:Internal, 4:Custom
    weight: u8, // 权重
    min_confirmations: u8, // 最小确认数
    staleness_threshold: u64, // 数据过期阈值（毫秒）
}

/// 价格历史记录
public struct PriceHistory has store {
    timestamps: vector<u64>, // 时间戳列表
    prices: vector<u64>, // 价格列表
    max_entries: u64, // 最大记录数量
}

/// 网络统计数据
public struct NetworkStats has store {
    global_collateral_ratio: u16, // 全局抵押率(基点)
    supply_growth_rate: u16, // 供应增长率(基点/月)
    compute_utilization_rate: u16, // 算力利用率(基点)
    active_providers_count: u32, // 活跃提供者数量
    total_compute_power: u64, // 总算力
}

/// 全局经济参数
public struct GlobalConfig has key {
    id: UID,
    base_fee_rate: u16, // 基础费率(基点)
    high_demand_threshold: u16, // 高需求阈值
    low_demand_threshold: u16, // 低需求阈值
    demand_fee_multiplier: u16, // 需求调整系数
    min_fee_rate: u16, // 最低费率(基点)
    max_fee_rate: u16, // 最高费率(基点)
    target_collateral_ratio: u16, // 目标抵押率(基点)
    target_supply_growth_rate: u16, // 目标供应增长率(基点/月)
    target_utilization_rate: u16, // 目标利用率(基点)
    minting_cap_factor: u16, // 铸币上限系数
    pending_ratio_proof: Option<vector<u8>>, // 待处理的比率计算证明
}

// Oracle类型常量
const ORACLE_TYPE_PYTH: u8 = 0;
const ORACLE_TYPE_SWITCHBOARD: u8 = 1;
const ORACLE_TYPE_CHAINLINK: u8 = 2;
const ORACLE_TYPE_INTERNAL: u8 = 3;
const ORACLE_TYPE_CUSTOM: u8 = 4;

// 错误常量
const EInvalidAuthority: u64 = 0;
const EInvalidData: u64 = 1;
const EStaleData: u64 = 2;
const EInvalidZkProof: u64 = 3;
const EInvalidParameter: u64 = 4;

// 事件定义
public struct PriceUpdateEvent has copy, drop {
    compute_power_price_usd: u64,
    stable_coin_price_usd: u64,
    market_demand_index: u16,
    timestamp: u64,
    updater: address,
}

public struct CollateralRatioUpdateEvent has copy, drop {
    old_ratio: u16,
    new_ratio: u16,
    market_volatility: u16,
    timestamp: u64,
}

/// 创建Oracle数据对象
public fun initialize_oracle(
    compute_power_price: u64,
    stable_coin_price: u64,
    price_volatility: u16,
    market_demand_index: u16,
    ctx: &mut TxContext,
) {
    let oracle = OracleData {
        id: object::new(ctx),
        compute_power_price_usd: compute_power_price,
        stable_coin_price_usd: stable_coin_price,
        price_volatility,
        market_demand_index,
        last_update_time: tx_context::epoch_timestamp_ms(ctx),
    };

    // 创建全局配置
    let config = GlobalConfig {
        id: object::new(ctx),
        base_fee_rate: 30, // 0.3%
        high_demand_threshold: 7500, // 75%
        low_demand_threshold: 3000, // 30%
        demand_fee_multiplier: 50, // 0.5%
        min_fee_rate: 10, // 0.1%
        max_fee_rate: 200, // 2.0%
        target_collateral_ratio: 15000, // 150%
        target_supply_growth_rate: 500, // 5%
        target_utilization_rate: 8000, // 80%
        minting_cap_factor: 8000, // 80%
        pending_ratio_proof: option::none(),
    };

    // 共享对象
    transfer::share_object(oracle);
    transfer::share_object(config);
}

/// 更新Oracle价格数据
public entry fun update_price_data(
    oracle: &mut OracleData,
    compute_power_price: u64,
    stable_coin_price: u64,
    market_demand_index: u16,
    ctx: &mut TxContext,
) {
    // 在真实实现中，这里应该验证调用者权限

    // 更新数据
    oracle.compute_power_price_usd = compute_power_price;
    oracle.stable_coin_price_usd = stable_coin_price;
    oracle.market_demand_index = market_demand_index;
    oracle.last_update_time = tx_context::epoch_timestamp_ms(ctx);

    // 发出价格更新事件
    event::emit(PriceUpdateEvent {
        compute_power_price_usd: compute_power_price,
        stable_coin_price_usd: stable_coin_price,
        market_demand_index,
        timestamp: oracle.last_update_time,
        updater: tx_context::sender(ctx),
    });
}

/// 调整抵押率
public entry fun adjust_collateral_ratio(
    config: &mut GlobalConfig,
    oracle: &OracleData,
    ctx: &mut TxContext,
) {
    // 获取当前市场数据
    let market_volatility = oracle.price_volatility;
    let target_ratio = calculate_optimal_collateral_ratio(
        market_volatility,
        config.target_collateral_ratio,
        20000, // 最高200%抵押率
        13000, // 最低130%抵押率
    );

    // 在真实实现中，这里应该验证零知识证明
    // assert!(
    //    option::is_some(&config.pending_ratio_proof) &&
    //    verify_ratio_calculation(option::extract(&mut config.pending_ratio_proof), market_volatility, target_ratio),
    //    EInvalidZkProof
    // );

    let old_ratio = config.target_collateral_ratio;

    // 更新抵押率
    config.target_collateral_ratio = target_ratio;

    // 发出抵押率更新事件
    event::emit(CollateralRatioUpdateEvent {
        old_ratio,
        new_ratio: target_ratio,
        market_volatility,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}

/// 计算自适应铸币率
public fun calculate_adaptive_minting_rate(
    config: &GlobalConfig,
    oracle: &OracleData,
    network_stats: &NetworkStats,
): u64 {
    // 基础铸币率基于市场算力价格
    let base_rate = oracle.compute_power_price_usd;

    // 根据系统抵押率调整
    let collateral_adjustment = if (
        network_stats.global_collateral_ratio < config.target_collateral_ratio
    ) {
        // 抵押率低于目标，减少铸币率
        let ratio =
            (network_stats.global_collateral_ratio as u64) * 10000 / 
                       (config.target_collateral_ratio as u64);
        10000 - ((10000 - ratio) * 2000 / 10000) // 调整因子为2000基点
    } else {
        // 抵押率高于目标，增加铸币率
        let ratio =
            (config.target_collateral_ratio as u64) * 10000 / 
                       (network_stats.global_collateral_ratio as u64);
        10000 + ((10000 - ratio) * 1000 / 10000) // 调整因子为1000基点
    };

    // 根据供应量增长率调整
    let supply_adjustment = if (
        network_stats.supply_growth_rate > config.target_supply_growth_rate
    ) {
        // 供应增长过快，减少铸币率
        let ratio =
            (config.target_supply_growth_rate as u64) * 10000 / 
                       (network_stats.supply_growth_rate as u64);
        (ratio * 8000 + (10000 - 8000)) / 10000 // 调整因子为8000基点
    } else {
        // 供应增长过慢，增加铸币率
        10000
    };

    // 根据算力利用率调整
    let utilization_adjustment = if (
        network_stats.compute_utilization_rate < config.target_utilization_rate
    ) {
        // 利用率低，适度减少铸币率
        let ratio =
            (network_stats.compute_utilization_rate as u64) * 10000 / 
                       (config.target_utilization_rate as u64);
        9000 + ratio * 1000 / 10000 // 90%-100%区间调整
    } else {
        10000 // 利用率高，保持铸币率
    };

    // 最终铸币率计算
    let final_rate = (
        base_rate * 
                         collateral_adjustment / 10000 * 
                         supply_adjustment / 10000 * 
                         utilization_adjustment / 10000,
    );

    final_rate
}

/// 计算费率
public fun calculate_fee_rate(config: &GlobalConfig, oracle: &OracleData): u16 {
    // 获取市场指标
    let demand_index = oracle.market_demand_index;

    // 基础费率
    let base_fee = config.base_fee_rate;

    // 市场需求调整
    let demand_adjustment = if (demand_index > config.high_demand_threshold) {
        // 高需求，提高费率以控制供应增长
        let excess = demand_index - config.high_demand_threshold;
        let adjustment = (excess * config.demand_fee_multiplier) / 10000;
        base_fee + adjustment
    } else if (demand_index < config.low_demand_threshold) {
        // 低需求，降低费率以鼓励使用
        let deficit = config.low_demand_threshold - demand_index;
        let adjustment = (deficit * config.demand_fee_multiplier) / 10000;
        if (adjustment >= base_fee) {
            config.min_fee_rate
        } else {
            base_fee - adjustment
        }
    } else {
        // 正常需求区间
        base_fee
    };

    // 确保费率在合理范围内
    let min_fee = config.min_fee_rate;
    let max_fee = config.max_fee_rate;

    if (demand_adjustment < min_fee) {
        min_fee
    } else if (demand_adjustment > max_fee) {
        max_fee
    } else {
        demand_adjustment
    }
}

/// 获取算力资源价值
public fun get_hashrate_value(
    oracle: &OracleData,
    credential: &ComputeResourceCredential,
    duration: u64,
): u64 {
    let value = 0;
    value
}

/// 计算市场波动性
public fun get_market_volatility(oracle: &OracleData): u16 {
    oracle.price_volatility
}

/// 获取市场需求指数
public fun get_market_demand_index(oracle: &OracleData): u16 {
    oracle.market_demand_index
}

/// 检查价格数据是否新鲜
public fun is_data_fresh(oracle: &OracleData, max_staleness: u64, ctx: &TxContext): bool {
    let current_time = tx_context::epoch_timestamp_ms(ctx);
    (current_time - oracle.last_update_time) <= max_staleness
}

/// 计算最优抵押率
fun calculate_optimal_collateral_ratio(
    volatility: u16,
    base_ratio: u16,
    max_ratio: u16,
    min_ratio: u16,
): u16 {
    // 波动性越高，抵押率要求越高
    // 简化公式: base_ratio + (volatility - 500) * 20
    // 这会在波动性为5%时保持基础抵押率，每1%波动性增加或减少20个基点

    let volatility_adjustment = if (volatility > 500) {
        ((volatility - 500) as u64) * 20
    } else if (volatility < 500) {
        0
    } else {
        0
    };

    let new_ratio = base_ratio + (volatility_adjustment as u16);

    // 确保在有效范围内
    if (new_ratio < min_ratio) {
        min_ratio
    } else if (new_ratio > max_ratio) {
        max_ratio
    } else {
        new_ratio
    }
}
