<template>
  <div class="chart-container">
    <el-select v-model="query.constraint" placeholder="请选择">
      <el-option
        v-for="item in constraintOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"/>
    </el-select>
    <el-select v-model="query.lid" placeholder="请选择">
      <el-option
        v-for="item in labelOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"/>
    </el-select>
    <el-button type="primary" child-event="getStatistic" @click="search">查询</el-button>

    <chart :statistic = "statistic" :selectconstraint = "selectconstraint" height="80%" width="100%" @childEvent="getStatistic"/>
  </div>
</template>

<script>
import Chart from './charts/index'
import { select } from '../../api/novel'

export default {
  name: 'MixChart',
  components: { Chart },
  data() {
    return {
      statistic: [],
      selectconstraint: '',
      query: {
        lid: undefined,
        state: undefined,
        constraint: 'score'
      },
      constraintOptions: [
        {
          label: '推荐量',
          value: 'recommend_num'
        },
        {
          label: '点击量',
          value: 'click_num'
        },
        {
          label: '收藏量',
          value: 'collect_num'
        },
        {
          label: '评分',
          value: 'score'
        }
      ],
      labelOptions: [
        {
          label: '玄幻奇幻',
          value: 1
        },
        {
          label: '武侠仙侠',
          value: 2
        },
        {
          label: '都市言情',
          value: 3
        },
        {
          label: '历史军事',
          value: 4
        },
        {
          label: '科幻灵异',
          value: 5
        },
        {
          label: '网游竞技',
          value: 6
        },
        {
          label: '女生频道',
          value: 7
        }
      ]
    }
  },
  created() {
    this.getStatistic()
  },
  methods: {
    getStatistic() {
      select(this.query).then(res => {
        this.statistic = res.data.data
      })
    },
    search() {
      this.selectconstraint = this.query.constraint
      this.getStatistic(this.query)
    }
  }
}
</script>

<style scoped>
  .chart-container{
    position: relative;
    width: 100%;
    height: calc(100vh - 84px);
  }
</style>

