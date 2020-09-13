<template>
  <div class="app-container">
    <div class="searchBody">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
        <el-form-item>
          <el-button type="success" icon="el-icon-plus" @click="showAddDialog" >添加服务器</el-button>
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
      <el-table-column label="服务器名称" prop="serverName" ></el-table-column>
      <el-table-column label="地址" prop="host" ></el-table-column>
      <el-table-column label="端口" prop="port" ></el-table-column>
      <el-table-column label="用户名" prop="username" ></el-table-column>
      <el-table-column label="密码"   prop="password" ></el-table-column>
      <el-table-column label="操作" fixed="right" width='120'>
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" circle @click="showEditDialog(scope.row)" title="编辑"></el-button>
          <el-button type="danger" size="mini" icon="el-icon-close" circle @click="deleteData(scope.row)" title="删除"></el-button>
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
    <el-dialog title="添加服务器" :visible.sync="addDialog" width="30%">
      <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="80px" size="small">
        <el-form-item label="名称" prop="serverName">
          <el-input size="mini"  v-model="addForm.serverName" ></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="host">
          <el-input size="mini"  v-model="addForm.host" ></el-input>
        </el-form-item>
        <el-form-item
          label="端口"
          prop="port"
          :rules="[
            { required: true, message: '端口不能为空'},
            { type: 'number', message: '端口必须为数字值'}
          ]">
          <el-input size="mini"  v-model.number="addForm.port" ></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input size="mini" v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input size="mini" v-model="addForm.password"></el-input>
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
import { getPage, save, deleteData } from '@/api/server'
export default {
  data() {
    return {
      tableData: [],
      dataTotal: null,
      searchForm: {
        pageSize: 10,
        pageNum: 1
      },
      addForm: {
        id: null,
        serverName: null,
        addType: 'add',
        password: null
      },
      addFormRules: {
        serverName: [{ required: true, trigger: 'blur', message: '必需项' }],
        host: [{ required: true, trigger: 'blur', message: '必需项' }],
        username: [{ required: true, trigger: 'blur', message: '必需项' }]
      },
      addDialog: false
    }
  },
  mounted() {
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
          if (this.addForm.addType === 'add' && !this.addForm.password){
            this.$notify({
              message: '密码不能为空',
              type: 'warning'
            })
            return
          }
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
