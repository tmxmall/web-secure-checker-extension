<template>
  <div class="options-page">
    <p>
      <el-select v-model="currentSite" size="mini"></el-select>
    </p>
    <!-- TODO: 待分页 -->
    <el-table :data="currentSiteData" border fit size="mini">
      <el-table-column type="index"></el-table-column>
      <el-table-column label="time"></el-table-column>
      <el-table-column label="host"></el-table-column>
      <el-table-column label="path"></el-table-column>
      <el-table-column label="method"></el-table-column>
      <el-table-column label="query"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'Welcome!',
      data: [],
      currentSite: ''
    }
  },
  computed: {
    sites () {
      return Array.from(new Set(this.data.map(item => item.site)))
    },
    currentSiteData () {
      if (!this.currentSite) {
        return [] // 必须选择一个site
      }
      return this.data.filter(item => item.size === this.currentSite)
    }
  },
  created () {
    /**
     * load all the data
     * load the configuation
     */
    setTimeout(() => {
      window.location.reload()
    }, 5000)
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
