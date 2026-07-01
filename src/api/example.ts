/**
 * 模拟返回列表数据，用于演示 y-column-xxx 各类组件用法。
 */
export function getList() {
  return Promise.resolve({
    size: 10,
    current: 1,
    searchCount: true,
    records: [
      {
        id: '2038877892004839426',
        collectName: '用户行为离线同步',
        datasourceName: 'mysql_74_3309',
        dbType: 'MySQL',
        dbName: 'nc_test',
        status: 'SUCCESS',
        priority: 'HIGH',
        envType: '开发环境',
        remark: '每日凌晨执行',
        collectType: '定时',
        lastCollectTime: '2026-06-29 02:00:00',
        collectCount: 12580,
      },
      {
        id: '2038877892004839427',
        collectName: '订单数据实时采集',
        datasourceName: 'kafka_prod_cluster',
        dbType: 'Kafka',
        dbName: 'order_topic',
        status: 'RUNNING',
        priority: 'HIGH',
        envType: '生产环境',
        remark: '',
        collectType: '实时',
        lastCollectTime: '2026-06-29 10:15:32',
        collectCount: 987654,
      },
      {
        id: '2038877892004839428',
        collectName: '日志归档批处理',
        datasourceName: 'hdfs_logs_namenode',
        dbType: 'HDFS',
        dbName: '/data/logs',
        status: 'FAILED',
        priority: 'MEDIUM',
        envType: '测试环境',
        remark: '需排查连接超时',
        collectType: '定时',
        lastCollectTime: '2026-06-28 23:50:00',
        collectCount: 0,
      },
      {
        id: '2038877892004839429',
        collectName: '用户画像宽表同步',
        datasourceName: 'clickhouse_bi',
        dbType: 'ClickHouse',
        dbName: 'user_profile',
        status: 'PENDING',
        priority: 'LOW',
        envType: '开发环境',
        remark: '',
        collectType: '手动',
        lastCollectTime: '-',
        collectCount: 0,
      },
      {
        id: '2038877892004839430',
        collectName: '商品类目维度表',
        datasourceName: 'mysql_74_3309',
        dbType: 'MySQL',
        dbName: 'nc_test',
        status: 'SUCCESS',
        priority: 'MEDIUM',
        envType: '生产环境',
        remark: '全量同步',
        collectType: '手动',
        lastCollectTime: '2026-06-29 01:30:00',
        collectCount: 3420,
      },
    ],
    total: 5,
    hasNext: false,
    extend: {},
    empty: false,
    totalPage: 1,
    hasPrevious: false,
  })
}

/**
 * 模拟返回详情数据，用于演示详情页 y-desc 描述列表等组件用法。
 */
export function getDetail() {
  return Promise.resolve({
    id: '2038877892004839426',
    collectName: '用户行为离线同步',
    datasourceName: 'mysql_74_3309',
    dbType: 'MySQL',
    dbName: 'nc_test',
    status: 'SUCCESS',
    priority: 'HIGH',
    envType: '开发环境',
    remark:
      '每日凌晨执行离线同步任务，将用户行为数据从业务库同步至数仓 ODS 层，支持全量+增量两种模式，上游依赖 DQC 校验通过后触发。',
    collectType: '定时',
    lastCollectTime: '2026-06-29 02:00:00',
    collectCount: 12580,
    // 配置信息（详情页额外展示）
    cronExpression: '0 0 2 * * ?',
    timeout: 3600,
    retryCount: 3,
    retryInterval: 300,
    shardCount: 4,
    // 创建/更新信息
    createTime: '2026-01-15 10:30:00',
    creator: '张三',
    updateTime: '2026-06-28 18:00:00',
    updater: '李四',
    // 运行日志
    runLogs: [
      { time: '2026-06-29 02:00:00', status: 'SUCCESS', message: '任务触发成功' },
      { time: '2026-06-29 02:05:23', status: 'SUCCESS', message: '全量数据抽取完成，共 12580 条' },
      { time: '2026-06-29 02:08:10', status: 'SUCCESS', message: '数据写入 ODS 层完成' },
      { time: '2026-06-29 02:08:15', status: 'SUCCESS', message: 'DQC 校验通过，任务结束' },
    ],
    // 关联资源（演示空状态）
    relatedResources: [],
  })
}
