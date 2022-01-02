import Dexie from 'dexie'
import dayjs from 'dayjs'

/**
 * 因为数据库表本身严格遵从版本号控制，不能在使用的过程中动态创建表格
 * 在任何一个新的业务中，都必须显示的声明表数据结构和版本号
 * 由于yicat本身是多团队体系，在任何一个团队中的操作数据兜有groupId的信息
 * 所以约定：任何一个表格字段都包含groupId字段
 * 关于http请求历史记录，需要显示的定义是否需要缓存
 * 关于编辑器中的句段数据变化比较核心，需要设计数据结构单独保存，编辑器中的数据都必须有documentId信息
 */
const dbInstance = new Dexie('wsc_data_db')
// 定义数据库table结构
// 此处数据结构只是定义需要索引的字段，实际存储的字段可任意多个
// 仅索引的字段才能使用搜索，过滤，比较大小等功能
/**
 * 定义一个关于http访问请求的历史记录表
 * 数据字段：id,url,status,method,params,data,time
 */
dbInstance
  .version(1)
  .stores({
    // 定义表名和需要索引的字段
    request_history: '++id,initiator,url,method,reqHeaders,resHeaders,timeUsed,reqBody,resBody,statusCode,createDate,timeStamp'
  })

/**
 * 版本升级，仅增加一个新的索引，无修改其他字段
 * 备注：如有其他非索引字段内容变化，需再次特别说明
 */
// dbInstance
//   .version(2)
//   .stores({ request_history: '++id,url,status,time' }) // 定义request_history表
//   .upgrade(trans => {
//     // 不同的版本设置不同的索引配置数据结构，在版本更新之间需要根据结构变化重新维护纠正数据
//     // 注意：如果在维护过程中出现异常，版本升级将失败，新版本的定义将整体无效
//     // 新版本升级后旧版本的定义不能删除，需保留历史步骤，浏览器会逐个应用升级策略
//     // 新版本仅对需要变化的数据结构进行重新定义，无变化的数据结构可无需重复定义
//     // 关于verison的详细介绍：https://dexie.org/docs/Tutorial/Design#database-versioning
//     return trans.request_history.toCollection().modify(requestHistory => {
//       const tmp = requestHistory
//       // 对之前的时间格式进行格式化
//       tmp.time = dayjs(requestHistory.time).format('YYYY-MM-DD HH:mm:ss')
//     })
//   })
// dbInstance.version(3).stores({ request_history: '++id,url,status,time,type' })
// dbInstance
//   .version(4)
//   .stores({ request_history: '++id,url,status,time,type,requestId' })

const localdb = {
  add(requestRecord) {
    // TODO: 删除30天之前的历史记录
    const lastMonthDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss')
    dbInstance
      .table('request_history')
      .where('createDate')
      .below(lastMonthDate)
      .delete()
      .then(deleteCount => {
        console.log(`Deleted: ${deleteCount} records`)
      })
    // 返回一个Promise<id>, new record id
    requestRecord.createDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return dbInstance.table('request_history').add(requestRecord)
  },
  query(siteHost, hourstoNow = 7) {
    const dateStartStr = dayjs().subtract(hourstoNow, 'hour').format('YYYY-MM-DD HH:mm:ss')
    const dateEndStr = dayjs().format('YYYY-MM-DD HH:mm:ss')
    return dbInstance
      .table('request_history')
      .where('createDate')
      .between(dateStartStr, dateEndStr)
      .toArray(items => {
        return items.filter(i => i.initiator === siteHost)
      })
  },
  count() {
    // return Promise<count>
    return dbInstance.table('request_history').count()
  },
}

// TODO: 自定清除一个月以前的存储数据
// 关于编辑器离线使用相关的前期铺垫：暂时设计为每次从服务端加载数据，然后将数据全量保存在本地缓存
// 然后在后期实现如果没有网络的情况下加载页面，可以使用缓存数据。但是前提是整个编辑器得先做离线访问支持
// expose the obj to windows for manualing using
// yicat_cache_db.tables[0].where('createDate').between('2020-04-30 16:30:00', '2020-04-30 16:31:59').toArray().then(items => console.log(items))

export default localdb
