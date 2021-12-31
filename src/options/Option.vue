<template>
  <div class="options-page">
    <el-form>
      <el-form-item label="网站选择">
        <el-select v-model="currentSite" size="mini" style="width: 300px;">
          <el-option v-for="(site, index) in sites" :key="index" :label="site.site" :value="site.id" :disabled="!site.enabled"></el-option>
        </el-select>
        <el-button type="primary" size="mini" @click="query">查询</el-button>
      </el-form-item>
    </el-form>
    <div class="table-pagination" style="text-align: right; margin: 30px;">
      <el-pagination background :current-page.sync="currentPage" :page-size.sync="pageSize" :page-sizes="[10, 50, 100, 200]" layout="prev, pager, next, sizes, jumper" :total="data.length"></el-pagination>
    </div>
    <el-table :data="currentPageViewList" border fit size="mini">
      <el-table-column type="index"></el-table-column>
      <el-table-column label="记录时间" prop="createDate" width="140px"></el-table-column>
      <el-table-column label="method" prop="method" width="60px"></el-table-column>
      <el-table-column label="URL" prop="url" width="400px"></el-table-column>
      <el-table-column label="耗时(ms)" prop="timeUsed"></el-table-column>
      <el-table-column label="响应码" prop="statusCode"></el-table-column>
      <el-table-column label="响应码" prop="statusCode"></el-table-column>
      <el-table-column label="响应码" prop="statusCode"></el-table-column>
      <el-table-column label="响应码" prop="statusCode"></el-table-column>
    </el-table>
    <div class="table-pagination" style="text-align: right; margin: 30px;">
      <el-pagination background :current-page.sync="currentPage" :page-size.sync="pageSize" :page-sizes="[10, 50, 100, 200]" layout="prev, pager, next, sizes, jumper" :total="data.length"></el-pagination>
    </div>
  </div>
</template>

<script>import localdb from "../biz/db"
import util from "../biz/util"

export default {
  data() {
    return {
      config: {},
      data: [],
      currentSite: '',
      pageSize: 10,
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
  },
  methods: {
    query () {
      const site = this.sites.find(s => s.id === this.currentSite)
      this.data = []
      if (site) {
        localdb.query(site.site, 30)
          .then(records => {
            console.log(records[0])
            this.data = records
          })
      }
    }
  },
  created () {
    /**
     * load all the data
     * load the configuation
     */
    util.getPluginConfig().then(config => {
      console.log('config')
      this.config = config
      if (this.sites.length) {
        this.currentSite = this.sites[0].id
        this.query()
      }
    })
    setTimeout(() => {
      // window.location.reload()
    }, 20 * 1000)
  }
}
</script>

<style lang="scss">
.options-page {
  min-height: 200px;
  min-width: 400px;
  height: 100%;
}
</style>
