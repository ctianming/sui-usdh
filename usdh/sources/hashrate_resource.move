/*
 * USDH: 基于Sui区块链的算力支持可编程稳定币系统
 * 算力资源模块: 实现算力资源的注册、验证和管理功能
 */
module usdh::hashrate_resource;

use std::option::{Self, Option, some, none};
use std::string::{Self, String};
use std::type_name::{Self, TypeName};
use std::vector;
use sui::coin::{Self, Coin};
use sui::dynamic_field;
use sui::dynamic_object_field as dof;
use sui::event;
use sui::hash;
use sui::object::{Self, ID, UID};
use sui::package;
use sui::table::{Self, Table};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use usdh::usdh::USDH;

/// 算力资源类型常量
const RESOURCE_TYPE_GPU: u8 = 0;
const RESOURCE_TYPE_CPU: u8 = 1;
const RESOURCE_TYPE_TPU: u8 = 2;
const RESOURCE_TYPE_FPGA: u8 = 3;
const RESOURCE_TYPE_ASIC: u8 = 4;
const RESOURCE_TYPE_HYBRID_COMPUTE: u8 = 5;
const RESOURCE_TYPE_CUSTOM: u8 = 7;

/// 存储类型常量
const STORAGE_TYPE_SSD: u8 = 0;
const STORAGE_TYPE_NVME: u8 = 1;
const STORAGE_TYPE_HDD: u8 = 2;
const STORAGE_TYPE_DISTRIBUTED_STORAGE: u8 = 3;

/// 资源状态常量
const STATUS_ACTIVE: u8 = 0;
const STATUS_PENDING: u8 = 1;
const STATUS_MAINTENANCE: u8 = 2;
const STATUS_SUSPENDED: u8 = 3;
const STATUS_TERMINATED: u8 = 4;

/// 验证结果常量
const VERIFICATION_SUCCESS: u8 = 0;
const VERIFICATION_PARTIAL_SUCCESS: u8 = 1;
const VERIFICATION_FAILURE: u8 = 2;

// 性能等级常量
const RESOURCE_TIER_ENTRY: u8 = 0;
const RESOURCE_TIER_BASIC: u8 = 1;
const RESOURCE_TIER_STANDARD: u8 = 2;
const RESOURCE_TIER_PREMIUM: u8 = 3;

// 错误常量
const ENotAuthorizedVerifier: u64 = 0;
const EResourceNotActive: u64 = 1;
const ELowCredibilityScore: u64 = 2;
const EInvalidProof: u64 = 3;
const EResourceNotFound: u64 = 4;
const EInsufficientStaking: u64 = 5;
const ECommitmentTooShort: u64 = 6;
const EUnauthorizedRewardDistributor: u64 = 7;
const ERewardEpochNotCompleted: u64 = 8;
const EInvalidResourceType: u64 = 9;
const EInvalidZkProof: u64 = 10;

// 关键参数和阈值
const MIN_CREDIBILITY_SCORE: u16 = 5000;
const INITIAL_CREDIBILITY_SCORE: u16 = 6000;
const DEFAULT_NFT_VALIDITY_PERIOD: u64 = 31536000000; // 365天（毫秒）
const REWARD_EPOCH_DURATION_MS: u64 = 86400000; // 24小时（毫秒）
const VERIFICATION_SAMPLE_SIZE: u64 = 10; // For schedule_random_verification

/// 算力资源结构
public struct HashrateResource has key {
    id: UID, // 对象唯一ID
    collateral_record_id: ID, // 对应抵押记录ID
    provider: address, // 提供者地址
    resource_type: u8, // 资源类型(GPU/CPU等)
    performance_metrics: PerformanceMetrics, // 性能指标
    availability_proof: vector<u8>, // 可用性证明序列化数据
    initial_value_usd: u64, // 初始估值(USD厘，即0.001美元)
    current_value_usd: u64, // 当前估值(USD厘)
    last_price_update: u64, // 最后价格更新时间
    utilization_rate: u16, // 使用率(基点，10000=100%)
    resource_uri: String, // 资源元数据URI
    zk_verification_proof: vector<u8>, // 零知识验证证明
    carbon_footprint: u64, // 碳足迹(克CO2当量)
    meta_fields: Option<ID>, // 动态字段容器
}

/// 算力资源性能指标
public struct PerformanceMetrics has store {
    flops: u64, // 浮点运算性能(GFLOPS)
    memory_bandwidth: u64, // 内存带宽(GB/s乘以100)
    latency_ms: u16, // 响应延迟(ms)
    energy_efficiency: u16, // 能源效率(GFLOPS/W乘以100)
}

/// 算力资源性能记录
public struct PerformanceRecord has store {
    timestamp: u64, // 记录时间戳
    successful_operations: u64, // 成功操作数
    failed_operations: u64, // 失败操作数
    average_response_time: u16, // 平均响应时间(ms)
    verification_proof: vector<u8>, // 验证证明
}

/// 算力资源使用权凭证
public struct HashrateUsageRight has key {
    id: UID, // 对象唯一ID
    resource_id: ID, // 对应资源ID
    user: address, // 使用者地址
    start_time: u64, // 开始时间
    duration: u64, // 使用时长(毫秒)
    compute_power_unit: u64, // 计算能力单位
    is_active: bool, // 是否处于活跃状态
    performance_tier: u8, // 性能等级(1-5)
    usage_conditions: String, // 使用条件
    meta_fields: Option<ID>, // 动态字段容器
}

/// 算力资源身份凭证
public struct ComputeResourceCredential has key, store {
    id: UID,
    resource_id: ID,
    provider_id: address,
    resource_type: u8,
    specs: ResourceSpecification,
    performance_baseline: ResourcePerformance,
    verification_proofs: vector<ID>,
    registration_time: u64,
    last_verification_time: u64,
    credibility_score: u16, // Made public for oracle.move access
    status: u8,
    nft_mint: Option<ID>,
}

/// 资源规格详情
public struct ResourceSpecification has store {
    // GPU资源规格
    gpu_model: Option<String>, // GPU型号
    gpu_count: Option<u8>, // GPU数量
    vram_gb: Option<u16>, // 显存大小(GB)
    cuda_cores: Option<u32>, // CUDA核心数
    tensor_cores: Option<u32>, // Tensor核心数
    // CPU资源规格
    cpu_model: Option<String>, // CPU型号
    cpu_cores: Option<u16>, // CPU核心数
    cpu_threads: Option<u16>, // CPU线程数
    cpu_frequency_mhz: Option<u32>, // CPU频率(MHz)
    // 内存与存储规格
    ram_gb: Option<u16>, // 内存大小(GB)
    storage_gb: Option<u32>, // 存储大小(GB)
    storage_type: Option<u8>, // 存储类型
    // 网络规格
    network_bandwidth_mbps: Option<u32>, // 网络带宽(Mbps)
    // 其他规格拓展
    additional_specs: Option<String>, // JSON格式的附加规格
}

/// 资源性能指标
public struct ResourcePerformance has store {
    flops: Option<u64>, // 浮点运算性能(FLOPS)
    ai_ops: Option<u64>, // AI运算性能
    bandwidth_gbps: Option<u32>, // 内存带宽(GBps)
    latency_ms: Option<u16>, // 响应延迟(ms)
    energy_efficiency: Option<u16>, // 能效比(FLOPS/W)
    benchmark_scores: Table<String, u32>, // 各类基准测试分数
}

/// 验证记录结构
public struct VerificationRecord has drop, store {
    timestamp: u64,
    verifier: address,
    proof_hash: vector<u8>,
    result: u8,
    details: Option<String>,
}

/// 验证证明对象
public struct VerificationProof has key {
    id: UID,
    resource_id: ID,
    verifier: address,
    timestamp: u64,
    result: u8,
    proof_data: vector<u8>,
    details: Option<String>,
}

/// 资源聚合池
public struct DissipativeComputePool has key {
    id: UID, // 对象唯一ID
    pool_id: ID, // 池唯一标识
    resource_type: u8, // 资源类型
    total_compute_power: u64, // 总计算能力
    active_compute_power: u64, // 当前活跃计算能力
    utilization_rate: u16, // 使用率(基点)
    providers_count: u32, // 提供者数量
    min_performance_tier: u8, // 最低性能等级要求
    fee_rate: u16, // 池手续费率(基点)
    reward_per_compute_unit: u64, // 每计算单位奖励
    dissipation_rate: u16, // 耗散率(基点/小时)
    last_update_time: u64, // 最近更新时间
    cumulative_rewards: u64, // 累计发放奖励
    resources: vector<ID>, // 池中资源列表
    alpha: u64, // 质押费率
    beta: u64, // 维护燃烧率
    gamma: u64, // 奖励率
    min_stake_period: u64, // 最小质押周期
}

/// 资源性能数据
public struct ResourcePerformanceData has store {
    uptime_percentage: u16, // 在线率(基点)
    utilization_rate: u16, // 使用率(基点)
    performance_efficiency: u16, // 性能效率(基点)
    task_success_rate: u16, // 任务成功率(基点)
    average_response_time: u32, // 平均响应时间(ms)
    energy_consumption: u64, // 能源消耗(Wh)
}

/// 算力资源NFT
public struct ComputeResourceNFT has key, store {
    id: UID, // 对象唯一ID
    resource_id: ID, // 对应算力资源ID
    provider: address, // 提供者地址
    resource_type: u8, // 资源类型
    performance_tier: u8, // 性能等级(1-5)
    issuance_time: u64, // 发行时间戳
    expiration_time: u64, // 到期时间戳
    uri: String, // 元数据URI
    compute_power_unit: u64, // 计算能力单位
    verification_history: vector<VerificationRecord>, // 验证历史
    name: String, // NFT名称
    description: String, // NFT描述
    image_url: String, // NFT图像URL
}

/// 全局经济参数
public struct GlobalEconomicParams has key {
    id: UID,
    staking_requirement: u64, // α: 初始资源注册所需质押代币数量
    maintenance_rate: u64, // β: 资源在线维护成本，每月消耗代币数
    reward_rate: u64, // γ: 资源满负荷使用时每月奖励代币数
    min_staking_period: u64, // Tmin: 最小资源承诺时间
    reputation_factor_min: u16, // λ最小值: 信誉系数下限
    reputation_factor_max: u16, // λ最大值: 信誉系数上限
    dissipation_rate: u16, // δ: 未使用算力资源的耗散速率
    minting_cap_factor: u16, // μ: 全网算力价值铸币上限系数
    target_collateral_ratio: u16, // 目标抵押率(基点)
    target_supply_growth_rate: u16, // 目标供应增长率(基点/月)
    target_utilization_rate: u16, // 目标算力利用率(基点)
    last_update_time: u64, // 最近参数更新时间
}

// 事件定义
public struct ResourceRegistrationEvent has copy, drop {
    resource_id: ID,
    provider: address,
    resource_type: u8,
    registration_time: u64,
    staking_amount: u64,
    commitment_period: u64,
}

public struct ResourceVerificationEvent has copy, drop {
    resource_id: ID,
    verifier: address,
    result: u8,
    timestamp: u64,
}

public struct ResourceActivationEvent has copy, drop {
    resource_id: ID,
    activation_time: u64,
    compute_power: u64,
}

public struct ResourceNFTMintEvent has copy, drop {
    resource_id: ID,
    nft_id: ID,
    provider: address,
    performance_tier: u8,
    compute_power: u64,
    timestamp: u64,
}

public struct PoolDissipationEvent has copy, drop {
    pool_id: ID,
    dissipated_power: u64,
    new_active_power: u64,
    timestamp: u64,
}

public struct RewardDistributionEvent has copy, drop {
    resource_id: ID,
    provider: address,
    epoch_id: u64,
    reward_amount: u64,
    performance_score: u16,
    distribution_time: u64,
}

public struct VerificationScheduleEvent has copy, drop {
    pool_id: ID,
    selected_resources: vector<ID>,
    sample_size: u64,
    timestamp: u64,
}

/// 注册算力资源
public entry fun register_compute_resource(
    _pool: &mut DissipativeComputePool, // Added to match design.md, though unused in this snippet version
    stake_coin: Coin<USDH>,
    resource_type: u8,
    model_name: vector<u8>,
    cores: u16,
    memory_gb: u16,
    storage_gb: u32,
    storage_type_val: u8, // Renamed to avoid conflict with struct name
    network_mbps: u32,
    additional_specs_bytes: vector<u8>, // Renamed
    commitment_period: u64,
    gpu_count_opt: Option<u8>,
    vram_gb_opt: Option<u16>,
    cuda_cores_opt: Option<u32>,
    tensor_cores_opt: Option<u32>,
    cpu_threads_opt: Option<u16>,
    cpu_frequency_mhz_opt: Option<u32>,
    ctx: &mut TxContext,
) {
    assert!(resource_type <= RESOURCE_TYPE_CUSTOM, EInvalidResourceType);

    let additional_specs_str_opt = if (vector::length(&additional_specs_bytes) > 0) {
        some(string::utf8(additional_specs_bytes))
    } else {
        none<String>()
    };

    let model_name_str_opt = if (vector::length(&model_name) > 0) {
        some(string::utf8(model_name))
    } else {
        none<String>()
    };

    let specs = if (resource_type == RESOURCE_TYPE_GPU) {
        ResourceSpecification {
            gpu_model: model_name_str_opt,
            gpu_count: gpu_count_opt,
            vram_gb: vram_gb_opt,
            cuda_cores: cuda_cores_opt,
            tensor_cores: tensor_cores_opt,
            cpu_model: none<String>(),
            cpu_cores: none<u16>(),
            cpu_threads: none<u16>(),
            cpu_frequency_mhz: none<u32>(),
            ram_gb: some(memory_gb),
            storage_gb: some(storage_gb),
            storage_type: some(storage_type_val),
            network_bandwidth_mbps: some(network_mbps),
            additional_specs: additional_specs_str_opt,
        }
    } else if (resource_type == RESOURCE_TYPE_CPU) {
        ResourceSpecification {
            gpu_model: none<String>(),
            gpu_count: none<u8>(),
            vram_gb: none<u16>(),
            cuda_cores: none<u32>(),
            tensor_cores: none<u32>(),
            cpu_model: model_name_str_opt,
            cpu_cores: some(cores),
            cpu_threads: cpu_threads_opt,
            cpu_frequency_mhz: cpu_frequency_mhz_opt,
            ram_gb: some(memory_gb),
            storage_gb: some(storage_gb),
            storage_type: some(storage_type_val),
            network_bandwidth_mbps: some(network_mbps),
            additional_specs: additional_specs_str_opt,
        }
    } else {
        ResourceSpecification {
            gpu_model: none<String>(),
            gpu_count: none<u8>(),
            vram_gb: none<u16>(),
            cuda_cores: none<u32>(),
            tensor_cores: none<u32>(),
            cpu_model: none<String>(),
            cpu_cores: none<u16>(),
            cpu_threads: none<u16>(),
            cpu_frequency_mhz: none<u32>(),
            ram_gb: some(memory_gb),
            storage_gb: some(storage_gb),
            storage_type: some(storage_type_val),
            network_bandwidth_mbps: some(network_mbps),
            additional_specs: additional_specs_str_opt,
        }
    };

    let benchmark_scores_table = table::new<String, u32>(ctx);

    let performance_baseline = ResourcePerformance {
        flops: option::none(),
        ai_ops: option::none(),
        bandwidth_gbps: option::none(),
        latency_ms: option::none(),
        energy_efficiency: option::none(),
        benchmark_scores: benchmark_scores_table,
    };

    let credential_own_uid = object::new(ctx);
    let id_for_resource_field = object::uid_to_inner(&credential_own_uid);

    let provider = tx_context::sender(ctx);
    let registration_time = tx_context::epoch_timestamp_ms(ctx);

    let credential = ComputeResourceCredential {
        id: credential_own_uid,
        resource_id: id_for_resource_field,
        provider_id: provider,
        resource_type: resource_type,
        specs: specs,
        performance_baseline: performance_baseline,
        verification_proofs: vector::empty<ID>(),
        registration_time: registration_time,
        last_verification_time: registration_time,
        credibility_score: INITIAL_CREDIBILITY_SCORE,
        status: STATUS_PENDING,
        nft_mint: none<ID>(),
    };

    let _staking_amount = coin::value(&stake_coin);
    transfer::public_transfer(stake_coin, provider);

    event::emit(ResourceRegistrationEvent {
        resource_id: id_for_resource_field,
        provider: provider,
        resource_type: resource_type,
        registration_time: registration_time,
        staking_amount: _staking_amount,
        commitment_period: commitment_period,
    });

    transfer::public_transfer(credential, provider);
}

/// 提交资源验证证明
public entry fun submit_resource_verification(
    resource: &mut ComputeResourceCredential,
    verification_proof_bytes: vector<u8>,
    ctx: &mut TxContext,
) {
    let verifier = tx_context::sender(ctx);
    assert!(resource.status != STATUS_TERMINATED, EResourceNotActive);

    let current_time = tx_context::epoch_timestamp_ms(ctx);
    let _proof_hash_val = sui::hash::keccak256(&verification_proof_bytes);

    if (resource.status == STATUS_PENDING) {
        resource.status = STATUS_ACTIVE;
        event::emit(ResourceActivationEvent {
            resource_id: resource.resource_id,
            activation_time: current_time,
            compute_power: get_compute_power_unit(resource),
        });
    };

    let proof_obj = create_verification_proof(
        resource.resource_id,
        verifier,
        VERIFICATION_SUCCESS,
        verification_proof_bytes,
        none<String>(),
        ctx,
    );
    vector::push_back(&mut resource.verification_proofs, object::id(&proof_obj));
    transfer::share_object(proof_obj);

    resource.last_verification_time = current_time;
    resource.credibility_score = calculate_new_score(resource.credibility_score, true, 10);

    event::emit(ResourceVerificationEvent {
        resource_id: resource.resource_id,
        verifier: verifier,
        result: VERIFICATION_SUCCESS,
        timestamp: current_time,
    });
}

/// 铸造资源凭证NFT
public entry fun mint_resource_nft(
    credential: &mut ComputeResourceCredential,
    name_bytes: vector<u8>,
    description_bytes: vector<u8>,
    image_url_bytes: vector<u8>,
    ctx: &mut TxContext,
) {
    assert!(credential.status == STATUS_ACTIVE, EResourceNotActive);
    assert!(credential.credibility_score >= MIN_CREDIBILITY_SCORE, ELowCredibilityScore);

    let nft_verification_history = vector::empty<VerificationRecord>();
    let num_proofs = vector::length(&credential.verification_proofs);
    let mut i = 0;
    while (i < num_proofs && i < 5) {
        i = i + 1;
    };

    let nft = ComputeResourceNFT {
        id: object::new(ctx),
        resource_id: credential.resource_id,
        provider: credential.provider_id,
        resource_type: credential.resource_type,
        performance_tier: calculate_performance_tier(credential),
        issuance_time: tx_context::epoch_timestamp_ms(ctx),
        expiration_time: tx_context::epoch_timestamp_ms(ctx) + DEFAULT_NFT_VALIDITY_PERIOD,
        uri: generate_resource_uri(credential),
        compute_power_unit: get_compute_power_unit(credential),
        verification_history: nft_verification_history,
        name: string::utf8(name_bytes),
        description: string::utf8(description_bytes),
        image_url: string::utf8(image_url_bytes),
    };

    option::fill(&mut credential.nft_mint, object::id(&nft));

    event::emit(ResourceNFTMintEvent {
        resource_id: credential.resource_id,
        nft_id: object::id(&nft),
        provider: credential.provider_id,
        performance_tier: nft.performance_tier,
        compute_power: nft.compute_power_unit,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
    transfer::public_transfer(nft, credential.provider_id);
}

/// 创建验证证明对象
fun create_verification_proof(
    resource_id_val: ID,
    verifier_addr: address,
    result_val: u8,
    proof_data_vec: vector<u8>,
    details_opt: Option<String>,
    ctx: &mut TxContext,
): VerificationProof {
    VerificationProof {
        id: object::new(ctx),
        resource_id: resource_id_val,
        verifier: verifier_addr,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
        result: result_val,
        proof_data: proof_data_vec,
        details: details_opt,
    }
}

/// 生成资源URI
fun generate_resource_uri(_credential: &ComputeResourceCredential): String {
    string::utf8(b"https://usdh.network/resources/")
}

/// 计算新的信誉分数
fun calculate_new_score(current_score_val: u16, is_positive: bool, impact_val: u16): u16 {
    if (is_positive) {
        let max_increase = 10000 - current_score_val;
        let actual_increase = if (impact_val < max_increase) impact_val else max_increase;
        current_score_val + actual_increase
    } else {
        let max_decrease = if (current_score_val > 1000) current_score_val - 1000 else 0;
        let actual_decrease = if (impact_val < max_decrease) impact_val else max_decrease;
        let result: u16; // Explicitly declare type
        if (current_score_val > actual_decrease) {
            result = current_score_val - actual_decrease;
        } else {
            result = 0;
        };
        result // Explicitly return
    }
}

/// 计算资源性能等级
fun calculate_performance_tier(credential_ref: &ComputeResourceCredential): u8 {
    let base_tier = if (credential_ref.resource_type == RESOURCE_TYPE_GPU) { 2 } else if (
        credential_ref.resource_type == RESOURCE_TYPE_TPU
    ) { 3 } else { 1 };
    if (credential_ref.credibility_score >= 9000) { base_tier + 1 } else if (
        credential_ref.credibility_score < 6000
    ) { if (base_tier > RESOURCE_TIER_ENTRY) { base_tier - 1 } else { base_tier } } else {
        base_tier
    }
}

/// 估算计算能力
fun get_compute_power_unit(credential_ref: &ComputeResourceCredential): u64 {
    let base_power = if (credential_ref.resource_type == RESOURCE_TYPE_GPU) { 10000 } else if (
        credential_ref.resource_type == RESOURCE_TYPE_TPU
    ) { 15000 } else if (credential_ref.resource_type == RESOURCE_TYPE_CPU) { 5000 } else { 3000 };
    (base_power * (credential_ref.credibility_score as u64)) / 10000
}
