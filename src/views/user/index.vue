<template>
  <div class="app-container">
    <div class="searchBody">
      <el-input type="text" v-model="searchForm.params.query" placeholder="请输入用户名筛选" style="width: 200px;"></el-input>
      <el-button type="success" style="margin-left:10px;padding: 10px;" @click="showAddDialog" >开通账号</el-button>
      <div class="tip"><span style="font-size: 12px; color: #606266"><i class="el-icon-warning" style="margin-right: 3px"></i>流量统计有延迟, 5分钟统计一次</span></div>
    </div>
    <div class="item-container">
      <div class="item-box" v-for="(item,index) in tableData" :key="index">
        <div class="box-col"><label>用户名</label>{{item.username}}</div>
        <div class="box-col"><label>TG</label>{{item.telegram}}</div>
        <div class="box-col"><label>用户角色</label>{{item.userType | userTypeFilter}}</div>
        <div class="box-col"><label>流量限制</label>{{item.dataLimit}}(GB)</div>
        <div class="box-col"><label>已使用流量</label>{{getFlow(item.dataUsage)}} <el-button type="danger" class="reset" @click="resetFLow(item)">重置</el-button></div>
        <div class="box-col"><label>到期时间</label>{{item.expireTime | parseTime('{y}-{m}-{d}')}}</div>
        <div class="box-col"><label>当前状态</label>{{item.disabled ? '禁用':'启用'}}</div>
        <div class="box-trl">
          <el-button type="primary" size="mini" @click="showEditDialog(item)" title="编辑">编辑</el-button>
          <el-button type="success" v-if="item.disabled" size="mini" @click="handleEnableUser(item)" title="启用">启用</el-button>
          <el-button type="danger"  v-else size="mini" @click="handleDisableUser(item)" title="禁用">禁用</el-button>
          <el-button type="primary" size="mini" @click="showAssignDialog(item)" title="端口分配">端口分配</el-button>
          <el-button type="danger" size="mini" @click="deleteData(item)" title="删除">删除</el-button>
        </div>
      </div>
    </div>
    <div class="block">
      <xd-pager
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="[10, 20, 50]"
        :page-size="searchForm.pageSize"
        :current-page="searchForm.pageNum"
        layout="total, sizes, prev, pager, next, jumper"
        :total="dataTotal">
      </xd-pager>
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
      :size="drawerPercent">
      <div class="drawer-body">
        <el-button size="mini" type="success" icon="el-icon-plus" @click="showFreePortDialog" >分配端口</el-button>
        <el-button size="mini" type="danger" icon="el-icon-minus" disabled title="未开发" >删除端口</el-button>
        <!--<el-select v-model="server" @change="serverChange" class="drawer-select" placeholder="按服务器筛选">-->
          <!--<el-option value="">全部</el-option>-->
          <!--<el-option v-for="(item,index) in serverList" :key="index" :label="item.serverName" :value="item.id"></el-option>-->
        <!--</el-select>-->
        <div class="item-container">
          <div class="item-box" @click="item.checked = !item.checked;$forceUpdate()" v-for="(item,index) in assignData" :key="index">
            <div class="box-col"><label>服务器名称</label>{{item.serverName}}</div>
            <div class="box-col"><label>服务器端口</label>{{item.localPort}}</div>
            <div class="box-col"><label>状态</label>{{item.disabled===false?'启用':'禁用'}}</div>
            <div class="checkbox" v-if="item.checked">
              <i class="el-icon-check"></i>
            </div>
            <div class="box-trl">
              <el-button type="danger" size="mini" @click.stop="deleteUserPort(item)"  title="删除">删除</el-button>
              <el-button v-if="item.disabled" type="success" size="mini"  @click.stop="enablePort(item)" title="启用中转">启用</el-button>
              <el-button v-if="!item.disabled" type="danger" size="mini"  @click.stop="disablePort(item)" title="停止中转">禁用</el-button>
            </div>
          </div>
        </div>
        <div class="block">
          <xd-pager
            background
            @size-change="handleUserPortSizeChange"
            @current-change="handleUserPortCurrentChange"
            :page-sizes="[10, 20, 50]"
            :page-size="userPortSearchForm.pageSize"
            :current-page="userPortSearchForm.pageNum"
            layout="total, sizes, prev, pager, next, jumper"
            :total="userPortDataTotal">
          </xd-pager>
        </div>
      </div>
    </el-drawer>
    <el-drawer
      title="选择端口"
      :with-header="false"
      :visible.sync="freePortDialog"
      direction="rtl"
      :size="drawerPercent">
      <div class="drawer-body">
        <el-button size="mini" type="success" @click="selectPorts" >确定</el-button>
        <el-button size="mini" type="success" @click="checkAll" >全选</el-button>
        <el-button size="mini" type="danger" @click="freePortDialog=false">取 消</el-button>
        <el-select @change="handleServerChange" v-model="portSelectForm.serverId" class="drawer-select" :class="{ mobile: isMobile }" placeholder="按服务器筛选">
          <el-option v-for="(item,index) in serverList" :key="index" :label="item.serverName" :value="item.id"></el-option>
        </el-select>
        <div class="item-container">
          <div class="item-box" @click="item.checked = !item.checked;$forceUpdate()" v-for="(item,index) in freePortData" :key="index">
            <div class="box-col"><label>服务器端口</label>{{item.localPort}}</div>
            <div class="checkbox" v-if="item.checked" style="top: 5px">
              <i class="el-icon-check"></i>
            </div>
          </div>
        </div>
        <div class="block">
          <xd-pager
            background
            @size-change="handleFreePortSizeChange"
            @current-change="handleFreePortCurrentChange"
            :page-sizes="[10, 20, 50]"
            :page-size="freePortSearchForm.pageSize"
            :current-page="freePortSearchForm.pageNum"
            layout="total, sizes, prev, pager, next, jumper"
            :total="freePortDataTotal">
          </xd-pager>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getPage, save, deleteData, getUserPortList, getFreePortPage, saveUserPorts, deleteUserPort, disableUserPort, enableUserPort, disableUser, enableUser, resetFlow } from '@/api/user'
import { getList } from '@/api/server'
export default {
  data() {
    return {
      tableData: [],
      assignData: [],
      freePortData: [],
      dataTotal: null,
      freePortDataTotal: null,
      userPortDataTotal: null,
      assignUserId: null,
      searchForm: {
        pageSize: 10,
        pageNum: 1,
        params: {
          query: ''
        }
      },
      checkboxShow: true,
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
        dataLimit: 0
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
      multipleSelection: [],
      serverId: null,
      serverList: [],
      portSelectForm: {
        serverId: null
      },
      freePortSearchForm: {
        pageSize: 10,
        pageNum: 1,
        serverId: null
      },
      userPortSearchForm: {
        pageSize: 10,
        pageNum: 1,
        userId: null
      }
    }
  },
  mounted() {
    this.getData()
  },
  filters: {
    userTypeFilter (val) {
      let userType = { 0: '管理员', 1: '普通用户'}
      return userType[val] || val
    }
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
    handleUserPortSizeChange(pageSize) {
      this.userPortSearchForm.pageSize = pageSize
      getUserPortList(this.userPortSearchForm).then(response => {
        this.assignData = response.data.list
        this.userPortDataTotal = response.data.total
      })
    },
    handleCurrentChange(pageNum) {
      this.searchForm.pageNum = pageNum
      this.getData()
    },
    handleUserPortCurrentChange(pageNum) {
      this.userPortSearchForm.pageNum = pageNum
      getUserPortList(this.userPortSearchForm).then(response => {
        this.assignData = response.data.list
        this.userPortDataTotal = response.data.total
      })
    },
    handleFreePortSizeChange(pageSize) {
      this.freePortSearchForm.pageSize = pageSize
      getFreePortPage(this.freePortSearchForm).then(response => {
        this.freePortData = response.data.list
        this.freePortDataTotal = response.data.total
      })
    },
    handleFreePortCurrentChange(pageNum) {
      this.freePortSearchForm.pageNum = pageNum
      getFreePortPage(this.freePortSearchForm).then(response => {
        this.freePortData = response.data.list
        this.freePortDataTotal = response.data.total
      })
    },
    showAddDialog() {
      this.addDialog = true
      this.addForm.addType = 'add'
      this.addForm.id = null
    },
    showAssignDialog(item) {
      this.assignUserId = item.id
      this.userPortSearchForm.userId = item.id
      getUserPortList(this.userPortSearchForm).then(response => {
        this.assignData = response.data.list
        this.userPortDataTotal = response.data.total
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
      this.getServerList()
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
      let arr = []
      for (let i of this.freePortData) {
        i.checked && arr.push({
          portId: i.id,
          userId: this.assignUserId,
          serverId: i.serverId
        })
      }
      if (arr.length <= 0) {
        this.$notify({
          message: '请选择端口',
          type: 'warning'
        })
        return
      }
      console.log(arr)
      saveUserPorts(arr).then(response => {
        // this.freePortDialog = false
        getUserPortList(this.userPortSearchForm).then(response => {
          this.assignData = response.data.list
          this.userPortDataTotal = response.data.total
        })
        this.handleServerChange(this.portSelectForm.serverId)
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
          getUserPortList(this.userPortSearchForm).then(response => {
            this.assignData = response.data.list
            this.userPortDataTotal = response.data.total
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
        getUserPortList(this.userPortSearchForm).then(response => {
          this.assignData = response.data.list
          this.userPortDataTotal = response.data.total
        })
      })
    },
    enablePort(row) {
      enableUserPort({ id: row.id }).then(response => {
        this.$notify({
          message: '启用完成',
          type: 'success'
        })
        getUserPortList(this.userPortSearchForm).then(response => {
          this.assignData = response.data.list
          this.userPortDataTotal = response.data.total
        })
      })
    },
    handleDisableUser(item) {
      disableUser({ id: item.id }).then(response => {
        this.$notify({
          message: '禁用完成',
          type: 'success'
        })
        this.getData()
      })
    },
    handleEnableUser(item) {
      enableUser({ id: item.id }).then(response => {
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
    resetFLow(item) {
      this.$confirm('确认重置流量?', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetFlow({ id: item.id }).then(response => {
          this.$notify({
            message: '重置成功',
            type: 'success'
          })
          getUserPortList(this.userPortSearchForm).then(response => {
            this.assignData = response.data.list
            this.userPortDataTotal = response.data.total
          })
        })
      })
    },
    getServerList() {
      getList({}).then(response => {
        this.serverList = response.data
        if (this.serverList.length) {
          this.portSelectForm.serverId = this.serverList[0].id
          this.handleServerChange(this.portSelectForm.serverId)
        }
      })
    },
    handleServerChange(serverId) {
      this.freePortSearchForm.serverId = serverId
      this.checkboxShow = false
      getFreePortPage(this.freePortSearchForm).then(response => {
        this.freePortData = [].concat(response.data.list)
        this.checkboxShow = true
        this.$forceUpdate()
        this.freePortDataTotal = response.data.total
      })
    },
    checkAll () {
      for (let i of this.freePortData) {
        i.checked = true
      }
      this.$forceUpdate()
    }
  }
}
</script>
<style>
  .el-drawer.rtl{
    overflow: scroll;
  }
</style>
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
  .drawer-select{
    margin: auto;
    margin-left: 20px;
    &.mobile{
      width: 98%;
      margin: 10px auto 0px;
      display: block;
    }
  }
}
.demo-drawer__footer {
  padding-top: 20px;
}
.el-drawer__body {
  overflow: auto;
  /* overflow-x: auto; */
}
.reset{
  line-height: 30px;
  padding: 0 10px;
  float: right;
  font-size: 12px;
}
</style>
