<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('table.title')" v-model="listQuery.detail.title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-input :placeholder="$t('table.author')" v-model="listQuery.detail.username" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.detail.lid" :placeholder="$t('table.type')" clearable style="width: 130px" class="filter-item">
        <el-option v-for="item in labelOptions" :key="item.value" :label="item.label" :value="item.value"/>
      </el-select>
      <el-select v-model="listQuery.detail.state" :placeholder="$t('table.status')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value"/>
      </el-select>
      <el-select v-model="listQuery.detail.allow" :placeholder="$t('table.audit')" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in allowOptions" :key="item.value" :label="item.label" :value="item.value"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column :label="$t('table.id')" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.nid }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createTime')" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.updateTime')" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.title')" width="180">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.author')" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.type')" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.lid | analysisType }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.chapterName')" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.chapter_name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.state | statusFilter">{{ scope.row.state === 1 ? '完结' : '连载中' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button v-if="scope.row.allow!=1" size="mini" type="success" @click="handleDisplay(scope.row, 1)">{{ $t('table.overTrial') }}
          </el-button>
          <el-button v-if="scope.row.allow==0" size="mini" type="danger" @click="handleDisplay(scope.row, -1)">{{ $t('table.reject') }}
          </el-button>
          <el-button v-if="scope.row.allow==1" size="mini" type="danger" @click="handleDisplay(scope.row, -2)">{{ $t('table.shelves') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.pageNum" :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

    <el-dialog :visible.sync="dialogFormVisible" title="给作者发送处理结果吧">
      <el-form label-position="left" label-width="70px" style="width: 80%; margin-left:50px;">
        <el-form-item label="标题" prop="title">
          <el-input v-model="message.title" />
        </el-form-item>
        <el-form-item label="具体理由" prop="content">
          <el-input :rows="5" v-model="message.content" type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="handleSend">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { fetchPv, createArticle, updateArticle } from '@/api/article'
import { fetchList } from '@/api/novel'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
import { auditNovel } from '../../api/novel'
import { sendMessage } from '../../api/message'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Novel',
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        detail: {
          title: undefined,
          state: undefined,
          username: undefined,
          lid: undefined,
          allow: undefined
        }
      },
      importanceOptions: [1, 2, 3],
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
      ],
      stateOptions: [
        {
          label: '连载中',
          value: 0
        },
        {
          label: '完结',
          value: 1
        }
      ],
      allowOptions: [
        {
          label: '已审核',
          value: 1
        },
        {
          label: '未审核',
          value: 0
        },
        {
          label: '已驳回',
          value: -1
        },
        {
          label: '已下架',
          value: -2
        }
      ],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        nid: undefined,
        create_time: new Date(),
        update_time: new Date(),
        title: '',
        username: '',
        chapter_name: '',
        label_name: '',
        state: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      message: {
        title: '',
        content: ''
      },
      item: {},
      allow: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery.detail, this.listQuery.pageNum, this.listQuery.pageSize).then(res => {
        this.listLoading = false
        this.list = res.data.list
        this.total = res.data.total
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    handleAudit(row, allow) {
      auditNovel(row.nid, allow).then(res => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        const index = this.list.indexOf(row)
        if (allow === 1) {
          this.list[index].allow = 1
        } else {
          this.list.splice(index, 1)
        }
      })
    },
    resetTemp() {
      this.temp = {
        nid: undefined,
        create_time: new Date(),
        update_time: new Date(),
        title: '',
        username: '',
        chapter_name: '',
        label_name: '',
        state: 1
      }
    },
    resetNotice() {
      this.message = {
        title: '',
        content: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDisplay(row, allow) {
      this.resetNotice()
      this.dialogFormVisible = true
      this.item = row
      this.allow = allow
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleSend() {
      this.handleAudit(this.item, this.allow)
      const detail = {
        toId: this.item.uid,
        fromId: this.$store.state.user.uid,
        title: this.message.title,
        content: this.message.content
      }
      sendMessage(detail).then(res => {
        // console.log(res)
      })
      this.dialogFormVisible = false
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
          const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
          const data = this.formatJson(filterVal, this.list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'table-list'
          })
          this.downloadLoading = false
        })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
