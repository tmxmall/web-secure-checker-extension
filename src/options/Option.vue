<template>
  <div class="options-page">
    <el-form inline>
      <el-form-item label="网站选择">
        <el-select v-model="currentSite" size="mini" style="width: 300px;" @change="query">
          <el-option v-for="(site, index) in sites" :key="index" :label="site.site" :value="site.id" :disabled="!site.enabled"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间:">
        <el-select v-model="showDataRangeHours" size="mini" @change="query">
          <el-option :value="1" label="1小时内"></el-option>
          <el-option :value="3" label="3小时内"></el-option>
          <el-option :value="8" label="8小时内"></el-option>
          <el-option :value="24" label="24小时内"></el-option>
          <el-option :value="72" label="3天内"></el-option>
          <el-option :value="168" label="7天内"></el-option>
        </el-select>
        <el-button type="primary" size="mini" @click="query">
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <el-alert :closable="false" style="margin-bottom: 10px;">当前网站中的风险网络请求API统计展示</el-alert>
    <el-tabs type="border-card">
      <el-tab-pane label="访问记录">
        <div class="table-pagination" style="text-align: right; margin: 30px;">
          <el-pagination background :current-page.sync="currentPage" :page-size.sync="pageSize" :page-sizes="[10, 20, 50, 100, 200]" layout="prev, pager, next, sizes, jumper" :total="data.length"></el-pagination>
        </div>
        <el-table :data="currentPageViewList" border fit size="mini">
          <el-table-column type="index" label="序号"></el-table-column>
          <el-table-column label="记录时间" prop="createDate" width="140px"></el-table-column>
          <el-table-column label="method" prop="method" width="80px"></el-table-column>
          <el-table-column label="URI" prop="pathname" width="400px"></el-table-column>
          <el-table-column label="耗时(ms)" prop="timeUsed"></el-table-column>
          <!-- <el-table-column label="响应码" prop="statusCode"></el-table-column> -->
          <!-- <el-table-column label="响应码" prop="statusCode"></el-table-column> -->
          <!-- <el-table-column label="响应码" prop="statusCode"></el-table-column> -->
          <!-- <el-table-column label="响应码" prop="statusCode"></el-table-column> -->
        </el-table>
        <div class="table-pagination" style="text-align: right; margin: 30px;">
          <el-pagination background :current-page.sync="currentPage" :page-size.sync="pageSize" :page-sizes="[10, 20, 50, 100, 200]" layout="prev, pager, next, sizes, jumper" :total="data.length"></el-pagination>
        </div>
      </el-tab-pane>
      <el-tab-pane label="API统计">
        <el-table :data="uniqueApis" border fit size="mini">
          <el-table-column type="index"></el-table-column>
          <el-table-column label="API" prop="api" width="240px"></el-table-column>
          <el-table-column label="命中规则" prop="hitTypes">
            <template slot-scope="scope">
              <el-tooltip
                v-for="(hitType, index) in scope.row.hitTypes"
                :key="index"
                placement="top"
                :content="getHitTypeDesc(hitType)"
              >
                <el-tag class="type-item">
                  {{ getHitTypeLabel(hitType) }}
                </el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- <el-tab-pane label="规则统计">
        <el-table :data="uniqueApis" border fit size="mini">
          <el-table-column type="index"></el-table-column>
          <el-table-column label="API" prop="api" width="240px"></el-table-column>
          <el-table-column label="命中次数" prop="count" width="60px"></el-table-column>
        </el-table>
      </el-tab-pane> -->
      <el-tab-pane label="规则说明">
        <el-row>
          <el-col :span="12">
            <el-table :data="allRulesView" border fit size="mini">
              <el-table-column type="index"></el-table-column>
              <el-table-column label="名称" prop="name" width="240px"></el-table-column>
              <el-table-column label="描述" prop="desc"></el-table-column>
              <el-table-column label="API统计" prop="count" width="80px"></el-table-column>
            </el-table>
          </el-col>
          <el-col :span="12" class="col2">
            <div id="chart1"></div>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="插件设置">
        <Popup @config-update="updateConfig"></Popup>
      </el-tab-pane>
      <!-- <el-tab-pane label="API Poster">
        <p>实现一个快速重现API请求的工具</p>
        <p>实现一个简易版postman工具，但是会自动注入当前所选网站的cookie,从当前active tab中获取可用cookie</p>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import * as G2 from '@antv/g2'
import localdb from "../biz/db"
import rule from "../biz/rule"
import util from "../biz/util"
import Popup from '../popup/Popup.vue'

export default {
  components: { Popup },
  data() {
    return {
      config: {},
      data: [],
      currentSite: '',
      pageSize: 20,
      currentPage: 1,
      rules: [],
      showDataRangeHours: 168
    }
  },
  computed: {
    sites () { return this.config.sites || [] },
    currentPageViewList () {
      let current = this.currentPage
      if (this.data.length <= this.pageSize) {
        current = 1
      }
      const start = (current - 1) * this.pageSize
      const end = start + this.pageSize
      return this.data.slice(start, end)
    },
    uniqueApis () {
      const map = {}
      const apis = new Set()
      this.data.forEach(record => {
        const url = new URL(record.url)
        const api = url.pathname
        map[api] = (map[api] || []).concat(record.hitTypes)
        apis.add(api)
      })
      return Array.from(apis).map(api => ({api, hitTypes: Array.from(new Set(map[api]))}))
    },
    ruleDetails () {
      // 对每一个规则的详细描述
      return []
    },
    allRulesView () {
      return this.allRules.map(hitType => {
        return {
          name: this.getHitTypeLabel(hitType),
          desc: this.getHitTypeDesc(hitType),
          count: this.getHitApiCount(hitType)
        }
      }).sort((a, b) => a.count - b.count > 0 ? -1 : 1)
    }
  },
  methods: {
    updateConfig (config) {
      this.config = config
    },
    getHitTypeDesc (hitType) {
      return (this.rules[hitType] || {}).desc || '无详细描述'
    },
    getHitTypeLabel (hitType) {
      return (this.rules[hitType] || {}).name || '未分类'
    },
    getHitApiCount (hitType) {
      return this.data.filter(record => record.hitTypes.includes(hitType)).length
    },
    query () {
      const site = this.sites.find(s => s.id === this.currentSite)
      this.data = []
      if (site) {
        // 根据插件配置查询指定时间的统计数据
        localdb.query(site.site, this.showDataRangeHours)
          .then(records => {
            console.log(records[0])
            this.data = records.map(record => {
              record.pathname = new URL(record.url).pathname
              return record
            })
            setTimeout(() => {
              this.initChart()
            }, 3000)
          })
      }
    },
    initChart () {
      const data = this.allRulesView
      // G2 对数据源格式的要求，仅仅是 JSON 数组，数组的每个元素是一个标准 JSON 对象。
      // Step 1: 创建 Chart 对象
      const chart = new G2.Chart({
        container: 'chart1', // 指定图表容器 ID
        width : 700, // 指定图表宽度
        height : 500 // 指定图表高度
      });
      // Step 2: 载入数据源
      chart.source(data);
      // Step 3：创建图形语法，绘制柱状图，由 genre 和 sold 两个属性决定图形位置，genre 映射至 x 轴，sold 映射至 y 轴
      chart.interval().position('name*count').color('count')
      // Step 4: 渲染图表
      chart.render();
    }
  },
  created () {
    this.rules = rule.allRulesWithLabel()
    this.allRules = rule.allRules()
    /**
     * load the configuation
     */
    util.getPluginConfig().then(config => {
      console.log('config')
      this.config = config || {}
      this.showDataRangeHours = this.config.showDataRangeHours || 8
      if (this.sites.length) {
        this.currentSite = this.sites[0].id
        this.query()
      }
    })
  }
}
</script>

<style lang="scss">
.options-page {
  min-height: 200px;
  min-width: 400px;
  height: 100%;
  padding: 10px;
  .type-item {
    margin: 4px;
  }
  .col2 {
    height: 100%;
    #chart1 {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
