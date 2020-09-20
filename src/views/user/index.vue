<template>
  <div class="app-container">
    <div class="searchBody">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
        <el-form-item>
          <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
            <el-form-item>
              <el-button type="success"    @click="showAddDialog" >开通账号</el-button>
              <el-button type="primary"    @click="showAssignDialog()" >端口分配</el-button>
              <el-button type="primary"    @click="resetFLow()" >重置流量</el-button>
              <el-button v-if="!selectedRow||selectedRow.disabled" type="success"   @click="handleEnableUser()" title="启用">启用</el-button>
              <el-button v-if="selectedRow&&!selectedRow.disabled" type="danger"   @click="handleDisableUser()" title="停止">禁用</el-button>
            </el-form-item>
          </el-form>
        </el-form-item>
      </el-form>
      <span style="font-size: 12px; color: #606266"><i class="el-icon-warning" style="margin-right: 3px"></i>流量统计有延迟, 5分钟统计一次</span>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px;"
      row-key="id"
      ref="singleTable"
      @current-change="handleSelect"
      highlight-current-row
      border
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="行号" type="index" width="50"></el-table-column>
      <el-table-column label="用户名" prop="username" ></el-table-column>
      <el-table-column label="用户类型"  >
        <template slot-scope="scope">
          <span
            v-for="(item,index) in userTypeList"
            v-if="scope.row.userType === item.value"
            :key="item+index">
              {{item.name}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="流量限制(GB)" prop="dataLimit" ></el-table-column>
      <el-table-column label="已用流量"   prop="dataUsage" >
        <template slot-scope="scope">
          {{getFlow(scope.row.dataUsage)}}
        </template>
      </el-table-column>
      <el-table-column label="到期时间" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.expireTime | parseTime('{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column  label="状态" >
        <template slot-scope="scope">
          {{ scope.row.disabled===false?'启用':'禁用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right">
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
    <el-dialog title="开通账号" :visible.sync="addDialog" width="30%">
      <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="130px" size="small">
        <el-form-item   label="用户类型" prop="userType">
          <el-select size="mini" style="width: 100%"  v-model="addForm.userType"  >
            <el-option
              v-for="(item,index) in userTypeList"
              :key="item+index"
              :label="item.name"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input size="mini"  v-model="addForm.username" ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input size="mini"  v-model="addForm.password" ></el-input>
        </el-form-item>
        <el-form-item label="到期时间" prop="expireTime">
          <el-date-picker
            style="width: 100%"
            size="mini"
            v-model="addForm.expireTime"
            type="date"
            placeholder="请选择到期时间"
            align="right">
          </el-date-picker>
          </el-form-item>
        <el-form-item label="手机号" prop="userPhone">
          <el-input size="mini"  v-model="addForm.userPhone" ></el-input>
        </el-form-item>
        <el-form-item label="TG" prop="telegram">
          <el-input size="mini"  v-model="addForm.telegram" ></el-input>
        </el-form-item>
        <el-form-item
          prop="dataLimit"
          :rules="[
            { required: true, message: '必填项'},
            { type: 'number', message: '必须为数字值'}
          ]"
        >
          <template slot="label">
                    <span style="position:relative">
                        <span>
                          流量限制(GB)
                          <el-tooltip class="item" effect="dark" placement="top">
                          <div slot="content">
                            <p>设置为0或负数,不限制流量</p>
                          </div>
                          <i class="el-icon-question table-msg"/>
                          </el-tooltip>
                        </span>

                    </span>
          </template>
          <el-input size="mini"  v-model.number="addForm.dataLimit" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddForm">确 定</el-button>
      </div>
    </el-dialog>
    <el-drawer
      title="查看端口"
      :with-header="false"
      :visible.sync="assignDialog"
      direction="rtl"
      size="60%">
      <div class="drawer-body">
        <el-button size="mini" type="success" icon="el-icon-plus" @click="showFreePortDialog" >分配端口</el-button>
        <el-table :data="assignData">
          <el-table-column property="serverName" label="服务器" ></el-table-column>
          <el-table-column property="localPort" label="端口" ></el-table-column>
          <el-table-column  label="状态" >
            <template slot-scope="scope">
              {{ scope.row.disabled===false?'启用':'禁用' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right">
            <template slot-scope="scope">
              <el-button type="danger" size="mini" @click="deleteUserPort(scope.row)"  title="删除">删除</el-button>
              <el-button v-if="scope.row.disabled" type="success" size="mini"  @click="enablePort(scope.row)" title="启用中转">启用</el-button>
              <el-button v-if="!scope.row.disabled" type="danger" size="mini"  @click="disablePort(scope.row)" title="停止中转">禁用</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
    <el-drawer
      title="选择端口"
      :with-header="false"
      :visible.sync="freePortDialog"
      direction="rtl"
      size="50%">
      <div class="drawer-body">
        <el-table :data="freePortData"  @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column property="serverName" label="服务器" ></el-table-column>
          <el-table-column property="localPort" label="端口" ></el-table-column>
        </el-table>
        <div class="demo-drawer__footer">
          <el-button size="mini" @click="freePortDialog=false">取 消</el-button>
          <el-button size="mini" type="primary" @click="selectPorts" >确定</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getPage, save, deleteData, getUserPortList, getFreePortList, saveUserPorts, deleteUserPort, disableUserPort, enableUserPort,disableUser, enableUser, resetFlow } from '@/api/user'
export default {
  data() {
    return {
      tableData: [],
      assignData: [],
      freePortData: [],
      dataTotal: null,
      assignUserId: null,
      searchForm: {
        pageSize: 10,
        pageNum: 1
      },
      userTypeList: [
        {
          name: '管理员',
          value: 0
        },
        {
          name: '普通用户',
          value: 1
        }
      ],
      addForm: {
        id: null,
        username: null,
        addType: 'add',
        password: null,
        expireTime: null,
        dataUsage: null,
        userType: 1,
        dataLimit:0
      },
      addFormRules: {
        host: [{ required: true, trigger: 'blur', message: '必需项' }],
        username: [{ required: true, trigger: 'blur', message: '必需项' }],
        expireTime: [{ required: true, trigger: 'blur', message: '必需项' }]
      },
      addDialog: false,
      selectedRow: null,
      assignDialog: false,
      freePortDialog: false,
      multipleSelection: []
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
    showAssignDialog() {
      if (!this.selectedRow) {
        this.$notify({
          message: '请选择用户',
          type: 'warning'
        })
        return
      }
      this.assignUserId = this.selectedRow.id
      getUserPortList({ userId: this.assignUserId }).then(response => {
        this.assignData = response.data
      })
      this.assignDialog = true
    },
    showEditDialog(row) {
      this.addDialog = true
      this.addForm = row
      this.addForm.password = null
      this.addForm.addType = 'edit'
    },
    showFreePortDialog() {
      getFreePortList({ }).then(response => {
        this.freePortData = response.data
      })
      this.freePortDialog = true
    },
    handleSelectionChange(val) {
      console.log(val)
      this.multipleSelection = val
    },
    handleSelect(val) {
      this.selectedRow = val
    },
    selectPorts() {
      console.log('multipleSelection', this.multipleSelection)
      if (this.multipleSelection.length <= 0) {
        this.$notify({
          message: '请选择端口',
          type: 'warning'
        })
        return
      }
      const selectedUserPortList = []
      const _this = this
      this.multipleSelection.forEach(function(item) {
        selectedUserPortList.push({
          portId: item.id,
          userId: _this.assignUserId,
          serverId: item.serverId
        })
      })
      console.log(selectedUserPortList)
      saveUserPorts(selectedUserPortList).then(response => {
        this.freePortDialog = false
        getUserPortList({ userId: this.assignUserId }).then(response => {
          this.assignData = response.data
        })
      })
    },
    deleteUserPort(row) {
      this.$confirm('确认删除?', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUserPort({ id: row.id }).then(response => {
          this.$notify({
            message: '删除成功',
            type: 'success'
          })
          getUserPortList({ userId: this.assignUserId }).then(response => {
            this.assignData = response.data
          })
        })
      })
    },
    disablePort(row) {
      disableUserPort({ id: row.id }).then(response => {
        this.$notify({
          message: '禁用完成',
          type: 'success'
        })
        getUserPortList({ userId: this.assignUserId }).then(response => {
          this.assignData = response.data
        })
      })
    },
    enablePort(row) {
      enableUserPort({ id: row.id }).then(response => {
        this.$notify({
          message: '启用完成',
          type: 'success'
        })
        getUserPortList({ userId: this.assignUserId }).then(response => {
          this.assignData = response.data
        })
      })
    },
    handleDisableUser() {
      if (!this.selectedRow) {
        this.$notify({
          message: '请选择用户',
          type: 'warning'
        })
        return
      }
      disableUser({ id: this.selectedRow.id }).then(response => {
        this.$notify({
          message: '禁用完成',
          type: 'success'
        })
        this.getData()
      })
    },
    handleEnableUser() {
      if (!this.selectedRow) {
        this.$notify({
          message: '请选择用户',
          type: 'warning'
        })
        return
      }
      enableUser({ id: this.selectedRow.id }).then(response => {
        this.$notify({
          message: '启用完成',
          type: 'success'
        })
        this.getData()
      })
    },
    getFlow(flowBytes) {
      let flow = ''
      // 如果赠送流量小于1MB.则显示为KB
      if (flowBytes / 1024 < 1024) {
        flow = (Math.round(flowBytes / 1024) > 0 ? Math.round(flowBytes / 1024) : 0) + 'KB';
      } else if (flowBytes / 1024 >= 1024 && flowBytes / 1024 / 1024 < 1024) {
        // 如果赠送流量大于1MB且小于1    GB的则显示为MB
        flow = (Math.round(flowBytes / 1024 / 1024) > 0 ? Math.round(flowBytes / 1024 / 1024) : 0) + 'MB';
      } else if (flowBytes / 1024 / 1024 >= 1024) {
        // 如果流量大于1Gb
        const gb_Flow = flowBytes / 1024 / 1024 / 1024
        // toFixed(1);四舍五入保留一位小数
        flow = gb_Flow.toFixed(3) + 'GB'
      } else {
        flow = '0KB'
      }
      return flow
    },
    resetFLow() {
      if (!this.selectedRow) {
        this.$notify({
          message: '请选择用户',
          type: 'warning'
        })
        return
      }
      this.$confirm('确认重置流量?', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetFlow({ id: this.selectedRow.id }).then(response => {
          this.$notify({
            message: '重置成功',
            type: 'success'
          })
          getUserPortList({ userId: this.assignUserId }).then(response => {
            this.assignData = response.data
          })
        })
      })
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
.drawer-body {
  padding: 20px;
}
.demo-drawer__footer {
  padding-top: 20px;
}
</style>
