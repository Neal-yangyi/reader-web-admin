<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.order" placeholder="时间排序" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in timeOptions" :key="item.value" :label="item.label" :value="item.value"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
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
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.title')" align="center" width="265">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createTime')" width="210" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.updateTime')" width="200" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" class-name="small-padding fixed-width" >
        <template slot-scope="scope">
          <el-button size="small" type="success" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="notice" label-position="left" label-width="70px" style="width: 90%; margin-left:50px;">
        <el-form-item :label="$t('table.title')" prop="title">
          <el-input v-model="notice.title"/>
        </el-form-item>
        <el-form-item :label="$t('table.content')" prop="contentStr">
          <tinymce id="tinymce" ref="tinymce" :height="300" v-model="notice.contentStr"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.create') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList } from '@/api/notice'
import waves from '@/directive/waves' // 水波纹指令
import Tinymce from '@/components/Tinymce'
import { addNotice } from '@/api/notice'
import { deleteNotice, updateNotice } from '../../api/notice'

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
  components: { Tinymce },
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
        order: 1
      },
      importanceOptions: [1, 2, 3],
      timeOptions: [
        {
          label: '创建时间',
          value: 1
        },
        {
          label: '更新时间',
          value: 0
        }
      ],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        title: '',
        contentStr: ''
      },
      notice: {
        title: '',
        contentStr: ''
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
        title: [{ required: true, message: 'title is required', trigger: 'blur' }],
        contentStr: [{ required: true, message: 'content is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      item: {},
      isFirst: true
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery.pageNum, this.listQuery.pageSize, this.listQuery.order).then(res => {
        this.listLoading = false
        this.list = res.data.list
        this.total = res.data.total
      })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
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
    resetNotice() {
      this.notice = {
        title: '',
        contentStr: ''
      }
      if (!this.isFirstBind()) {
        this.$refs.tinymce.setContent('')
      }
    },
    handleCreate() {
      this.resetNotice()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const detail = {
            title: this.notice.title,
            contentStr: this.notice.contentStr
          }
          addNotice(detail).then(res => {
            this.list.unshift(res.data)
            console.log(res)
          })
        }
        this.dialogFormVisible = false
      })
    },
    handleUpdate(row) {
      console.log(row)
      this.notice = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      if (!this.isFirstBind()) {
        const contentStr = row.contentStr
        this.$refs.tinymce.setContent(contentStr)
      }
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.notice)
          updateNotice(tempData).then((res) => {
            console.log(res)
            for (const v of this.list) {
              if (v.id === this.notice.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, res.data)
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
    isFirstBind() {
      if (this.isFirst) {
        this.isFirst = false
        return true
      } else {
        return false
      }
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      deleteNotice(row.id).then(res => {
        console.log(res)
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      })
    }
  }
}
</script>
