<template>
  <div class="options-page">
    <el-form>
      <el-form-item label="网站选择">
        <el-select v-model="currentSite" size="mini" style="width: 300px;">
          <el-option v-for="(site, index) in sites" :key="index" :label="site.site" :value="site.id" :disabled="!site.enabled"></el-option>
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
          <el-pagination background :current-page.sync="currentPage" :page-size.sync="pageSize" :page-sizes="[10, 50, 100, 200]" layout="prev, pager, next, sizes, jumper" :total="data.length"></el-pagination>
        </div>
        <el-table :data="currentPageViewList" border fit size="mini">
          <el-table-column type="index"></el-table-column>
          <el-table-column label="记录时间" prop="createDate" width="140px"></el-table-column>
          <el-table-column label="method" prop="method" width="80px"></el-table-column>
          <el-table-column label="URL" prop="url" width="400px"></el-table-column>
          <el-table-column label="耗时(ms)" prop="timeUsed"></el-table-column>
          <el-table-column label="响应码" prop="statusCode"></el-table-column>
          <el-table-column label="响应码" prop="statusCode"></el-table-column>
          <el-table-column label="响应码" prop="statusCode"></el-table-column>
          <el-table-column label="响应码" prop="statusCode"></el-table-column>
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
              <el-tag v-for="(hitType, index) in scope.row.hitTypes" :key="index" class="type-item">{{ getHitTypeLabel(hitType) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="规则统计">
        <!-- <el-table :data="uniqueApis" border fit size="mini">
          <el-table-column type="index"></el-table-column>
          <el-table-column label="API" prop="api" width="240px"></el-table-column>
          <el-table-column label="命中次数" prop="count" width="60px"></el-table-column>
        </el-table> -->
      </el-tab-pane>
      <el-tab-pane label="规则说明"></el-tab-pane>
      <el-tab-pane label="插件设置">
        <Popup></Popup>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
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
    }
  },
  computed: {
    sites () {
      return this.config.sites || []
    },
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
    }
  },
  methods: {
    getHitTypeLabel (hitType) {
      return rule.allRulesWithLabel()[hitType] || `识别错误${hitType}`
    },
    query () {
      const site = this.sites.find(s => s.id === this.currentSite)
      this.data = []
      if (site) {
        // 根据插件配置查询指定时间的统计数据
        localdb.query(site.site, this.config.showDataRangeDays)
          .then(records => {
            console.log(records[0])
            this.data = records
          })
      }
    }
  },
  created () {
    /**
     * load the configuation
     */
    util.getPluginConfig().then(config => {
      console.log('config')
      this.config = config || {}
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
  .type-item {
    margin: 4px;
  }
}
</style>
