<template>
  <div class="app-container">
    <div class="top-pannel">
      <span class="top-span"><span>当前账户:</span> <span class="top-text">

          <el-select size="mini" filterable @change="handleSelectUser"  v-model="selectedUser"  >
            <el-option
              v-for="(item,index) in userList"
              :key="item+index"
              :label="item.username"
              :value="item.id"/>
          </el-select>

      </span></span>
      <span class="top-span"><span>账户到期时间:</span> <span class="top-text">{{userDetail.expireTime | parseTime('{y}-{m}-{d}')}}</span></span>
      <span class="top-span"><span>账户流量:</span> <span class="top-text">{{getFlow(userDetail.dataUsage)}}/{{userDetail.dataLimit <= 0?'不限制':userDetail.dataLimit+'G'}}</span></span>
      <el-button  type="text" size="mini"  @click="refreshData()" >刷新</el-button>
      <el-button  type="text" size="mini"  @click="showDataDetail()" >流量使用详情</el-button>
      <el-button v-if="checkUserDisabled()" type="text" style="color: red" size="mini"  @click="showContactInfo()" >账号被禁用,点击联系管理员</el-button>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px;"
      row-key="id"
      border
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="行号" type="index" width="50"></el-table-column>
      <el-table-column label="中站服务器" prop="serverName" ></el-table-column>
      <el-table-column label="中转地址" prop="serverHost" ></el-table-column>
      <el-table-column label="中转端口" prop="internetPort" ></el-table-column>
      <el-table-column label="被中转地址" prop="remoteHost" ></el-table-column>
      <el-table-column label="被中转端口" prop="remotePort" ></el-table-column>
      <el-table-column label="所属用户" prop="username" ></el-table-column>
      <el-table-column  label="是否启动" >
        <template slot-scope="scope">
         {{scope.row.disabled?'已停止':'已启动'}}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right">
        <template slot-scope="scope">
          <el-button  v-if="scope.row.disabled"  type="success" size="mini"  @click="showStartDialog(scope.row)" title="启用中转">启动中转</el-button>
          <el-button  v-if="!scope.row.disabled" :loading="!scope.row.btnLoading?false:true" type="danger" size="mini"  @click="stopForward(scope.row)" title="停止中转">停止中转</el-button>
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
    <el-dialog title="启动转发" :visible.sync="startDialog" width="30%">
      <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="120px" size="small">
        <el-form-item label="域名(或IP)" prop="remoteHost">
          <el-input size="mini"  v-model="addForm.remoteHost" ></el-input>
        </el-form-item>
        <el-form-item
          label="端口"
          prop="remotePort"
          :rules="[
            { required: true, message: '端口不能为空'},
            { type: 'number', message: '端口必须为数字值'}
          ]">
          <el-input size="mini"  v-model.number="addForm.remotePort" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="startDialog = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="confirmStart(row)">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="联系方式" :visible.sync="contactInfoDialog" width="30%">
      <el-form  label-width="120px" size="small">
        <el-form-item label="TG:">
          <a style="color: dodgerblue" :href="contactInfo.telegram">{{contactInfo.telegram}}</a>
        </el-form-item>
        <el-form-item label="QQ:">
          <span>{{contactInfo.qq}}</span>
        </el-form-item>
        <el-form-item label="邮箱:">
          <span>{{contactInfo.email}}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-drawer
      title="流量使用详情"
      :with-header="false"
      :visible.sync="forwardFlowDialog"
      direction="rtl"
      size="60%">
      <div class="drawer-body">
        <el-table :data="forwardFlowList">
          <el-table-column property="serverName" label="所属服务" ></el-table-column>
          <el-table-column property="localPort" label="本地端口" ></el-table-column>
          <el-table-column property="internetPort" label="外网端口" ></el-table-column>
          <el-table-column property="remoteHost" label="被转域名" ></el-table-column>
          <el-table-column property="remotePort" label="被转端口" ></el-table-column>
          <el-table-column label="已用流量" >
            <template slot-scope="scope">
              {{getFlow(scope.row.dataUsage)}}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getPage, start, stopForward } from '@/api/forward'
import { getUserList, getUserDetail, getForwardFlow, getLocalUser } from '@/api/user'
import { getCUID } from '@/utils/auth'
import { getConfig } from '@/api/system'
export default {
  data() {
    return {
      tableData: [],
      dataTotal: null,
      loading: false,
      searchForm: {
        userId: null,
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
        remotePort: null,
        remoteHost: null
      },
      addFormRules: {
        remoteHost: [{ required: true, trigger: 'blur', message: '必需项' }]
      },
      startDialog: false,
      userList: [],
      selectedUser: null,
      userDetail: {
        dataUsage: 0,
        dataLimit: 0
      },
      forwardFlowDialog: false,
      forwardFlowList: [],
      contactInfoDialog: false,
      contactInfo: {}
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      getUserList({}).then(response => {
        this.userList = response.data
        this.selectedUser = Number(getCUID())
        getUserDetail({}).then(response => {
          this.userDetail = response.data
        })
        getPage(this.searchForm).then(response => {
          this.tableData = response.data.list
          this.dataTotal = response.data.total
        })
      })
    },
    checkUserDisabled() {
      const localUser = getLocalUser();
      if (localUser && localUser.disabled) {
        return true
      }
      return false
    },
    confirmStart() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          start(this.addForm).then(response => {
            this.loading = false
            this.$notify({
              message: '启动成功',
              type: 'success'
            })
            this.startDialog = false
            this.getData()
          })
        }
      })
    },
    handleSelectUser(userId) {
      this.searchForm.userId = userId
      getPage(this.searchForm).then(response => {
        this.tableData = response.data.list
        this.dataTotal = response.data.total
      })
      getUserDetail({ 'userId': this.searchForm.userId }).then(response => {
        this.userDetail = response.data
      })
    },
    refreshData() {
      getPage(this.searchForm).then(response => {
        this.tableData = response.data.list
        this.dataTotal = response.data.total
      })
      getUserDetail({ 'userId': this.searchForm.userId }).then(response => {
        this.userDetail = response.data
      })
      this.$notify({
        message: '刷新完成',
        type: 'success'
      })
    },
    showDataDetail() {
      this.forwardFlowDialog = true
      getForwardFlow({ 'userId': this.searchForm.userId }).then(response => {
        this.forwardFlowList = response.data
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
    showStartDialog(row) {
      this.startDialog = true
      this.addForm.serverId = row.serverId
      this.addForm.portId = row.portId
      this.addForm.remotePort = row.remotePort
      this.addForm.remoteHost = row.remoteHost
    },
    stopForward(row) {
      this.addForm.serverId = row.serverId
      this.addForm.portId = row.portId
      this.$set(row, 'btnLoading', true)
      stopForward(this.addForm).then(response => {
        this.$set(row, 'btnLoading', false)
        this.$notify({
          message: '停止完成',
          type: 'success'
        })
        this.getData()
      })
    },
    showContactInfo() {
      this.contactInfoDialog = true
      getConfig({}).then(response => {
        this.contactInfo = response.data
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
.top-pannel{
  margin: 10px 0 10px 0;
  color: #909399;
}
.top-span{
  margin-right: 20px;
}
.top-text{
  color: #606266;
}
.drawer-body {
  padding: 20px;
}
</style>
