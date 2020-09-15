<template>
  <div class="app-container">
    <div class="searchBody">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
        <el-form-item>
          <el-button type="success" size="mini"  icon="el-icon-plus" @click="showAddDialog" >添加端口</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px;"
      row-key="id"
      border
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="行号" type="index" width="50"></el-table-column>
      <el-table-column label="本地端口" prop="localPort" ></el-table-column>
      <el-table-column label="外网端口" prop="internetPort" ></el-table-column>
      <el-table-column label="所属服务器" prop="serverName" ></el-table-column>
      <el-table-column label="服务器IP" prop="serverHost" ></el-table-column>
      <el-table-column label="创建时间" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width='160'>
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="showEditDialog(scope.row)" title="编辑">编辑</el-button>
          <el-button type="danger" size="mini" @click="deleteData(scope.row)" title="删除">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="block">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="[10, 20, 50]"
        :page-size="searchForm.pageSize"
        :current-page="searchForm.pageNum"
        layout="total, sizes, prev, pager, next, jumper"
        :total="dataTotal">
      </el-pagination>
    </div>
    <el-dialog title="添加端口" :visible.sync="addDialog" width="30%">
      <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="120px" size="small">
        <el-form-item   label="所属服务器" prop="serverId">
          <el-select size="mini" style="width: 100%" clearable  v-model="addForm.serverId"  >
            <el-option
              v-for="(item,index) in serverList"
              :key="item+index"
              :label="item.serverName"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item
          label="本地端口"
          prop="localPort"
          :rules="[
            { required: true, message: '端口不能为空'},
            { type: 'number', message: '端口必须为数字值'}
          ]"
        >
          <el-input size="mini"  v-model.number="addForm.localPort" ></el-input>
        </el-form-item>
        <el-form-item
          label="外网端口"
          prop="internetPort"
          :rules="[
            { required: true, message: '端口不能为空'},
            { type: 'number', message: '端口必须为数字值'}
          ]"
        >
          <el-input size="mini"  v-model.number="addForm.internetPort" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getPage, save, deleteData } from '@/api/port'
import { getList } from '@/api/server'
export default {
  data() {
    return {
      tableData: [],
      dataTotal: null,
      serverList: [],
      searchForm: {
        pageSize: 10,
        pageNum: 1
      },
      addForm: {
        id: null,
        username: null,
        addType: 'add',
        password: null
      },
      addFormRules: {
        serverId: [{ required: true, trigger: 'blur', message: '必需项' }],
        localPort: [{ required: true, trigger: 'blur', message: '必需项' }],
        internetPort: [{ required: true, trigger: 'blur', message: '必需项' }]
      },
      addDialog: false
    }
  },
  mounted() {
    this.initServerList()
    this.getData()
  },
  methods: {
    getData() {
      getPage(this.searchForm).then(response => {
        this.tableData = response.data.list
        this.dataTotal = response.data.total
      })
    },
    deleteData(row) {
      this.$confirm('确认删除?', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteData({ id: row.id }).then(response => {
          this.$notify({
            message: '删除成功',
            type: 'success'
          })
          this.getData()
        })
      })
    },
    confirmAddForm() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          save(this.addForm).then(response => {
            this.$notify({
              message: '保存成功',
              type: 'success'
            })
            this.addDialog = false
            this.getData()
          })
        }
      })
    },
    handleSizeChange(pageSize) {
      this.searchForm.pageSize = pageSize
      this.getData()
    },
    handleCurrentChange(pageNum) {
      this.searchForm.pageNum = pageNum
      this.getData()
    },
    initServerList() {
      getList().then(response => {
        this.serverList = response.data
      })
    },
    showAddDialog() {
      this.addDialog = true
      this.addForm.addType = 'add'
      this.addForm.id = null
    },
    showEditDialog(row) {
      this.addDialog = true
      this.addForm = row
      this.addForm.password = null
      this.addForm.addType = 'edit'
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
